// internal imports
import { Config } from "~/core/args";
import { SHARED_CONSTANTS } from "~/core/constants";
import { logger } from "~/core/log";
import { ArrayUtils, capitalizeFirstLetter, getDirs, ITypedObject, unstringifyObject } from "~/utils";
import { BaseClient, getClientByType, IParsedPlayData, IPlayData } from "../clients";
import { GameLogManager, IBaseGameNamespace } from "../game";
import { Updater } from "../updater";
import { Room } from "./lobby-room";
import { SerialRoom } from "./lobby-room-serial";
import { ThreadedRoom } from "./lobby-room-threaded";

const RoomClass: typeof Room = Config.SINGLE_THREADED
    ? SerialRoom
    : ThreadedRoom;

// external imports
import * as cluster from "cluster";
import * as ws from "lark-websocket";
import * as net from "net";
import * as querystring from "querystring";
import * as readline from "readline";

cluster.setupMaster({
    exec: Config.BASE_DIR + "/gameplay/worker.js",
    args: [], // CLI args will be set via process.env variables
});

type createServerFunction = (callback: (socket: net.Socket) => void) => net.Server;

/*
    Clients connect like this:
    Lobby -> Room -> new thread -> Session
*/

/**
 * The server that clients initially connect to before being moved to their game lobby.
 * Basically creates and manages game sessions.
 */
export class Lobby {
    public static getInstance(): Lobby {
        if (!Lobby.instance) {
            Lobby.instance = new Lobby();
        }

        return Lobby.instance;
    }

    private static instance?: Lobby;

    public readonly name = `Lobby @ ${process.pid}`;
    public readonly gameNamespaces: ITypedObject<IBaseGameNamespace> = {};
    public readonly gameLogger = new GameLogManager();

    private nextRoomNumber = 1;
    private isShuttingDown = false;

    private readonly clients: BaseClient[] = [];
    private readonly rooms = new Map<string, Map<string, Room>>();
    private readonly roomsPlaying = new Map<string, Map<string, Room>>();
    private readonly clientsRoom = new Map<BaseClient, Room>();

    private readonly gameAliasToName = new Map<string, string>();

    private readonly updater?: Updater;

    private readonly listenerServers = new Map<string, net.Server>();

    private constructor() {
        this.initializeGames().then(() => {
            this.initializeListener("tcp", Config.TCP_PORT, net.createServer);
            this.initializeListener("ws", Config.WS_PORT, ws.createServer);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // ReadLine: listens for CTRL+C to kill off child threads gracefully (letting their games complete)
        rl.setPrompt("");
        rl.on("SIGINT", async () => {
            if (!this.isShuttingDown) {
                this.isShuttingDown = true;
                logger.info("Ω Shutting down gracefully Ω");

                const n = Array.from(this.roomsPlaying).reduce((sum, [name, rooms]) => sum + rooms.size, 0);
                logger.info(`   ${n} game${n !== 1 ? "s" : ""} currently running`);
                if (n === 0) {
                    logger.info("     ↳ No one here, see you later!");
                }

                try {
                    // tell all clients we are shutting down, and asynchronously
                    // wait for the socket to confirm the data was sent before
                    // proceeding
                    await Promise.all([...this.clients].map((client) => {
                        client.disconnect("Sorry, the server is shutting down.");
                    }));
                }
                catch (rejection) {
                    // we don't care
                }

                if (n > 0) {
                    logger.info("     Waiting for them to exit before shutting down.");
                    logger.info("     ^C again to force shutdown, which force disconnects clients.");
                }
                else {
                    process.exit(0);
                }
            }
            else {
                logger.info("╘ Force shutting down.");
                process.exit(0);
            }
        });

        if (Config.UPDATER_ENABLED) {
            this.updater = new Updater();
        }
    }

    /**
     * Gets the session for gameAlias and session id, if it exists
     *
     * @param {string} gameAlias - The name alias of the game for this session
     * @param {string} id - the session id of the gameName
     * @returns {Session} the session, if found
     */
    public getRoom(gameAlias: string, id: string): Room | undefined {
        const gameName = this.getGameNameForAlias(gameAlias);
        if (gameName) {
            const rooms = this.rooms.get(gameName);
            if (rooms) {
                return this.rooms.get(gameName)!.get(id);
            }
        }
        else {
            throw new Error(`Game name '${gameAlias}' is not a valid game alias.`);
        }
    }

    /**
     * Gets the actual name of an alias for a game, e.g. "checkers" -> "Checkers"
     *
     * @param {string} gameAlias - an alias for the game, not case sensitive
     * @returns {string|undefined} the actual game name of the aliased game, or undefined if not valid
     */
    public getGameNameForAlias(gameAlias: string): string | undefined {
        return this.gameAliasToName.get(gameAlias.toLowerCase());
    }

    /**
     * Gets the game class (constructor) for a given game alias
     *
     * @param {string} gameAlias - an alias for the game you want
     * @returns {Class} the game class constructor, if found
     */
    public getGameNamespace(gameAlias: string): IBaseGameNamespace | undefined {
        const gameName = this.getGameNameForAlias(gameAlias);
        if (gameName) {
            return this.gameNamespaces[gameName]!;
        }
    }

    /**
     * Invoked when a client disconnects from the lobby
     *
     * @override
     * @param {BaseClient} client - the client that disconnected
     */
    private clientDisconnected(client: BaseClient, reason?: string): void {
        ArrayUtils.removeElements(this.clients, client);

        const room = this.clientsRoom.get(client);
        if (room) {
            // we need to remove the client from this room
            room.removeClient(client);

            if (room.clients.length === 0) {
                // then that room is empty, no need to keep it around
                this.rooms.get(room.gameNamespace.GameManager.gameName)!.delete(room.id);

                if (Number(room.id) + 1 === this.nextRoomNumber) {
                    // then the next game number was never used, so reuse it
                    this.nextRoomNumber--;
                }
            }

            this.clientsRoom.delete(client);
        }
    }

    /**
     * Adds a socket of some client class as a proper Client type
     * @param socket the socket to bind the Client around
     * @param clientClass the class constructor of the Client class
     */
    private addSocket(socket: net.Socket, clientClass: typeof BaseClient): void {
        const client = new clientClass(socket);
        this.clients.push(client);

        client.sent.alias.on((data) => this.clientSentAlias(client, data));
        client.sent.play.on((data) => this.clientSentPlay(client, data));
        client.events.disconnected.on(() => this.clientDisconnected(client, "Disconnected unexpectedly"));
        client.events.timedOut.on(() => this.clientDisconnected(client, "Timed out"));
    }

    /**
     * Creates and initializes a server that uses a listener pattern identical to net.Server
     *
     * @param {string} type - type of server and what type of clients to expect from it
     * @param {number} port - port to listen on for this server
     * @param {Object} createServer - the required module's createServer method
     */
    private initializeListener(type: string, port: number, createServer: createServerFunction): void {
        const clientClass = getClientByType(type);
        if (!clientClass) {
            throw new Error(`'${type}' is not a valid type of listener for clients.`);
        }

        const listener = createServer((socket) => {
            this.addSocket(socket, clientClass);
        });

        listener.listen(port, "0.0.0.0", () => {
            logger.info(`»» Listening on port ${port} for ${type.toUpperCase()} Clients ««`);
        });

        listener.on("error", (err) => {
            logger.error((err as any).code !== "EADDRINUSE"
            ? String(err)
            : `Lobby cannot listen on port ${port} for game connections. Address in use.
There's probably another Cerveau server running on this same computer.`);

            process.exit(1);
        });

        this.listenerServers.set(type, listener);
    }

    /**
     * Initializes all the games in the games/ folder
     */
    private async initializeGames(): Promise<void> {
        const GAMES_DIR = "src/games/";
        const dirs = await getDirs(GAMES_DIR);

        for (const dir of dirs) {
            logger.info(`► ${capitalizeFirstLetter(dir)} game found ◄`);

            let gameNamespace: IBaseGameNamespace | undefined;
            try {
                const data = await import(GAMES_DIR + dir);
                gameNamespace = data.Namespace as IBaseGameNamespace;
            }
            catch (err) {
                logger.error(String(err), `Could not load game ${dir}`);
                process.exit(1);
                return;
            }
            const gameName = gameNamespace.GameManager.gameName;

            // hook up all the ways to get the game class via an index
            this.gameAliasToName.set(gameName.toLowerCase(), gameName);
            for (const alias of gameNamespace.GameManager.aliases) {
                this.gameAliasToName.set(alias.toLowerCase(), gameName);
            }

            this.gameNamespaces[gameName] = gameNamespace;

            this.rooms.set(gameName, new Map());
            this.roomsPlaying.set(gameName, new Map());

            break; // should have parsed anarchy, the rest are not converted yet
        }

        Object.freeze(this.gameNamespaces); // no more games can be added,
        // and it's public so we don't want people fucking with this object
    }

    /**
     * Retrieves, or creates a new, session. For clients when saying what they want to play
     *
     * @param {string} gameName - key identifying the name of the game you want. Should exist in games/
     * @param {string} [id] - basically a room id. Specifying an id can be used
     * to join other players on purpose. "*" will join you to any open session
     * or a new one, and "new" will always give you a brand new room even if
     * there are open ones.
     * @returns {Session} the game of gameName and id. If one does not exists a new instance will be created
     */
    private getOrCreateRoom(gameName: string, id: string): Room |string {
        const rooms = this.rooms.get(gameName);

        if (!rooms) {
            return `Game name ${gameName} is not a valid to get or create a Room for.`;
        }

        let room: Room | undefined;

        if (id !== "new") {
            if (id === "*" || id === undefined) { // then they want to join any open game
                // try to find an open session
                for (const [, theRoom] of rooms) {
                    if (theRoom.isOpen() && theRoom.gameNamespace.GameManager.gameName === gameName) {
                        room = theRoom;
                        break;
                    }
                }

                if (!room) {
                    // then there was no open room to join,
                    // so they get a new room
                    id = "new";
                }
            }
            else {
                // they requested to join a specific room
                room = this.getRoom(gameName, id);
            }
        }

        if (room) {
            if (room.isRunning()) {
                // we can't put them in this game, so they get a new room
                return `Room ${id} for game ${gameName} is full! Sorry.`;
            }
            else if (room.isOver()) {
                // we need to clear out this Room as it's over and available to re-use
                this.rooms.delete(id);
                room = undefined;
            }
        }

        if (!room) { // then we couldn't find a room from the requested gameName + id, so they get a new one
            if (!id || id === "new") {
                id = String(this.nextRoomNumber++);
            }

            room = new RoomClass(id, this.getGameNamespace(gameName)!, this.gameLogger, this.updater);
            rooms.set(id, room);
        }

        return room;
    }

    /**
     * When a client sends the 'play' event, which tells the server what it wants to play and as who.
     *
     * @param {BaseClient} client - the client that send the 'play' event
     * @param {IPlayData} data - the information about what this client wants to
     * play.
     */
    private async clientSentPlay(client: BaseClient, data: IPlayData): Promise<void> {
        const playData = this.validatePlayData(data);

        if (typeof(playData) === "string") {
            // it did not validate, so playData is the invalid message
            client.disconnect(playData);
            return;
        }

        let authenticationError: string | undefined;
        try {
            authenticationError = await this.authenticate(playData.gameName, playData.playerName, playData.password);
        }
        catch (error) {
            authenticationError = error.message;
        }

        if (authenticationError) {
            client.disconnect(`Authentication Error: '${authenticationError}'`);
            return;
        }

        const room = this.getOrCreateRoom(data.gameName, data.requestedSession);

        if (typeof(room) === "string") {
            client.disconnect(room);
            return;
        }

        // we need to check to make sure they did not request an already requested player index
        if (playData.playerIndex !== undefined) {
            if (room.clients.find((c) => c.playerIndex === playData!.playerIndex)) {
                // then there is already a client in this room that requested this player index
                // so the existing client gets the index, this current client gets squat
                playData.playerIndex = undefined;
            }
        }

        client.setInfo(playData.playerName, playData.clientType, playData.playerIndex);

        room.addClient(client);
        this.clientsRoom.set(client, room);

        if (Config.GAME_SETTINGS_ENABLED && data.gameSettings) {
            room.addGameSettings(playData.gameSettings);
        }

        client.send("lobbied", {
            gameName: data.gameName,
            gameSession: room.id,
            constants: SHARED_CONSTANTS,
        });

        if (room.canStart()) {
            this.unTrackClients(...room.clients);

            const roomsPlayingThisGame = this.roomsPlaying.get(playData.gameName)!;
            roomsPlayingThisGame.set(room.id, room);

            room.events.over.on(() => {
                roomsPlayingThisGame.delete(room.id);

                if (this.isShuttingDown && this.roomsPlaying.size === 0) {
                    logger.info("Final game session exited. Shutdown complete.");
                    process.exit(0);
                }
            });

            room.start();
        }
    }

    private async authenticate(gameName: string, playerName: string, password: string | undefined,
    ): Promise<string | undefined> {
        if (!Config.AUTH_PASSWORD) {
            return undefined; // we do not need to authenticate them
        }

        if (Config.AUTH_PASSWORD !== password) {
            return `Could not authenticate. '${password} is not a valid password to play on this server'`;
        }

        return undefined; // password was valid!
    }

    /**
     * Validates that the data sent in a 'play' event from a client is valid
     *
     * @param {Object} data - the play event data to validate
     * @returns {string} human readable text why the data is not valid
     * @throws {Error} if there is a validation error, human readable message as to why is thrown
     */
    private validatePlayData(data?: IPlayData): string | IParsedPlayData {
        if (!data) {
            return "Sent 'play' event with no data.";
        }

        const { gameSettings, ...noGameSettings } = data;
        const validatedData: IParsedPlayData = {
            gameSettings: {} as any, // will be overwritten below
            ...noGameSettings,
        };

        if (this.isShuttingDown) {
            return "Game server is shutting down and not accepting new clients.";
        }

        const gameAlias = String(data.gameName); // clients can send aliases of what they want to play
        const gameNamespace = this.getGameNamespace(gameAlias);
        if (!gameNamespace) {
            return `Game alias '${data.gameName}' is not a known game.`;
        }
        else {
            validatedData.gameName = gameNamespace.GameManager.gameName;
        }

        const n = gameNamespace.GameManager.requiredNumberOfPlayers;
        if (typeof(data.playerIndex) === "number" && (data.playerIndex < 0 || data.playerIndex >= n)) {
            return `playerIndex ${data.playerIndex} is out of range (max ${n} players).`;
        }

        if (data && data.gameSettings && Config.GAME_SETTINGS_ENABLED) {
            try {
                validatedData.gameSettings = unstringifyObject(
                    querystring.parse(data.gameSettings) as any, // string[] is not valid, but we don't care
                ) as any; // any because null will not be valid, but unstringify has the option to make that valid
            }
            catch (err) {
                return `Game settings incorrectly formatted. Must be one string in the url parameters format.
Available game settings:
${gameNamespace.gameSettings.getHelp()}`;
            }

            // this function might mutate the game settings to validate them
            const sanitizedGameSettings = gameNamespace.gameSettings.sanitize(validatedData.gameSettings);
            const invalidGameSettings = gameNamespace.gameSettings.invalidate(sanitizedGameSettings);
            if (typeof invalidGameSettings === "string") {
                return invalidGameSettings; // it did not validate, so return the validation error
            }
            validatedData.gameSettings = sanitizedGameSettings;
        }

        return validatedData;
    }

    /**
     * When a client sends the 'alias' event, which tells use they want to know what this game alias really is
     *
     * @param {BaseClient} client - the client that send the 'play'
     * @param {string} alias - the alias they want named
     */
    private async clientSentAlias(client: BaseClient, alias: string): Promise<void> {
        const gameName = this.getGameNameForAlias(alias);

        if (!gameName) {
            client.disconnect(`${alias} is not a known game alias for any game.`);
            return;
        }

        client.send("named", gameName);
    }

    /**
     * Stops tracking clients
     * @param clients the clients to stop tracking events for
     */
    private unTrackClients(...clients: BaseClient[]): void {
        for (const client of clients) {
            client.events.disconnected.offAll();
            client.events.timedOut.offAll();
        }

        ArrayUtils.removeElements(this.clients, ...clients);
    }
}

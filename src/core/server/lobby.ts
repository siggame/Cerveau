// internal imports
import { PlayEvent } from "cadre-ts-utils/cadre";
import { Config } from "~/core/config";
import { SHARED_CONSTANTS } from "~/core/constants";
import { logger } from "~/core/logger";
import { capitalizeFirstLetter, getDirs, getMinusArray, isNil,
         TypedObject, unCapitalizeFirstLetter, UnknownObject } from "~/utils";
import { BaseClient, TCPClient, WSClient } from "../clients";
import { GamelogManager, IBaseGameNamespace } from "../game";
import { Updater } from "../updater";
import { Room } from "./lobby-room";
import { SerialRoom } from "./lobby-room-serial";
import { ThreadedRoom } from "./lobby-room-threaded";

// external imports
import * as larkWebsocket from "lark-websocket";
import * as net from "net";
import { join } from "path";
import * as querystring from "querystring";
import * as readline from "readline";
import { sanitizeNumber } from "~/core/sanitize";
import { IGamesExport } from "~/core/server/games-export";

const ws = larkWebsocket as typeof net;

const GAMES_DIR = join(__dirname, "../../games/");

const RoomClass: typeof Room = Config.SINGLE_THREADED
    ? SerialRoom
    : ThreadedRoom;

/*
    Clients connect like this:
    Lobby -> Room -> [new thread] -> Session
*/

/**
 * The server that clients initially connect to before being moved to their
 * game lobby.
 *
 * Basically creates and manages game sessions.
 */
export class Lobby {
    /**
     * Gets, and starts up the lobby singleton, if it has not started already.
     *
     * @returns The Lobby singleton
     */
    public static getInstance(): Lobby { // tslint:disable-line:function-name
        if (!Lobby.instance) {
            Lobby.instance = new Lobby();
        }

        return Lobby.instance;
    }

    /** The singleton instance. */
    private static instance?: Lobby;

    /** A public promise that is resolved once all the games are ready. */
    public readonly gamesInitializedPromise: Promise<void>;

    /** All the namespaces for games we can play, indexed by gameName. */
    public readonly gameNamespaces: TypedObject<IBaseGameNamespace> = {};

    /** The logger instance that manages game logs. */
    public readonly gamelogManager = new GamelogManager();

    /** Next number to use for wildcard game sessions. */
    private nextRoomNumber = 1;

    /** If we are shutting down, to prevent new games from connecting. */
    private isShuttingDown = false;

    /** All the clients connected, but not yet in a Room. */
    private readonly clients: Set<BaseClient> = new Set();

    /** All the Rooms we currently have with clients in them. */
    private readonly rooms = new Map<string, Map<string, Room>>();

    /** All the Rooms that are actually running a game at the moment. */
    private readonly roomsPlaying = new Map<string, Map<string, Room>>();

    /** A mapping of a client to the room they are in.  */
    private readonly clientsRoom = new Map<BaseClient, Room>();

    /** A mapping of game aliases to their name (id). */
    private readonly gameAliasToName = new Map<string, string>();

    /** The Updater instance that checks for updates. */
    private readonly updater?: Updater;

    /** The Node.js listener servers that accept new clients. */
    private readonly listenerServers: net.Server[] = [];

    /**
     * Initializes the Lobby that listens for new clients.
     * There should only be 1 Lobby per program running at a time.
     */
    private constructor() {
        this.gamesInitializedPromise = new Promise<void>(async (resolve) => {
            await this.initializeGames();

            await Promise.all([ // so they can initialize asynchronously
                this.initializeListener(
                    Config.TCP_PORT,
                    net.createServer,
                    TCPClient,
                ),
                this.initializeListener(
                    Config.WS_PORT,
                    ws.createServer,
                    WSClient,
                ),
            ]);

            logger.info("🎉 Everything is ready! 🎉");

            resolve();
        }).catch((err) => {
            logger.error("Fatal exception initializing games!");
            logger.error(String(err));
            process.exit(1); // kills the entire game server
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // ReadLine: listens for CTRL+C to kill off child threads gracefully
        // (letting their games complete)
        rl.setPrompt("");
        rl.on("SIGINT", () => this.shutDown());

        if (Config.UPDATER_ENABLED) {
            this.updater = new Updater();

            this.updater.events.updateFound.on(() => {
                this.shutDown();
            });
        }
    }

    /**
     * Gets the session for gameAlias and session id, if it exists
     *
     * @param gameAlias - The name alias of the game for this session
     * @param id - the session id of the gameName
     * @returns the session, if found
     */
    public getRoom(gameAlias: string, id: string): Room | Error | undefined {
        const gameName = this.getGameNameForAlias(gameAlias);
        if (gameName) {
            const rooms = this.rooms.get(gameName);
            if (rooms) {
                return rooms.get(id);
            }
        }
        else {
            return new Error(`Game name '${gameAlias}' is not a valid game alias.`);
        }
    }

    /**
     * Gets the actual name of an alias for a game, e.g. "checkers" -> "Checkers"
     *
     * @param gameAlias - an alias for the game, not case sensitive
     * @returns the actual game name of the aliased game, or undefined if not valid
     */
    public getGameNameForAlias(gameAlias: string): string | undefined {
        return this.gameAliasToName.get(gameAlias.toLowerCase());
    }

    /**
     * Gets the game class (constructor) for a given game alias
     *
     * @param gameAlias - an alias for the game you want
     * @returns the game class constructor, if found
     */
    public getGameNamespace(gameAlias: string): IBaseGameNamespace | undefined {
        const gameName = this.getGameNameForAlias(gameAlias);
        if (gameName) {
            return this.gameNamespaces[gameName];
        }
    }

    /**
     * Tries to set up a Room for private arena play with clients.
     *
     * @param data - Data about the Room to setup with.
     * @returns An error string if it could not be validated, otherwise
     * undefined if no error and the Room was successfully created.
     */
    public setup(data: {
        gameAlias: string;
        session: string;
        gameSettings: Readonly<UnknownObject>;
    }): string | undefined {
        const namespace = this.getGameNamespace(data.gameAlias);
        if (!namespace) {
            return `gameName ${data.gameAlias} is valid for any games`;
        }

        const settings = namespace.gameSettingsManager.invalidateSettings(
            data.gameSettings,
        );

        if (settings instanceof Error) {
            return `gameSettings invalid: ${settings.message}`;
        }

        // Now get the room
        // (it will never be an Error because we know the gameName is valid)
        const existingRoom = this.getRoom(
            namespace.gameName,
            data.session,
        ) as Room | undefined;

        if (existingRoom) {
            return `session ${data.session} is already taken.`;
        }

        // We now know the Room can be created safely.
        const room = this.getOrCreateRoom(
            data.gameAlias,
            data.session,
        ) as Room;

        room.addGameSettings(settings);
        const rooms = this.rooms.get(namespace.gameName);

        if (!rooms) {
            throw new Error(`Could not find rooms for ${namespace.gameName}.`);
        }

        rooms.set(data.session, room);

        // if we got here the setup data looks valid, so let's setup the Room.
    }

    /**
     * Invoked when a client disconnects from the lobby
     *
     * @param client - the client that disconnected
     * @param reason the reason the client disconnected, if we know why
     *               (e.g. timed out)
     */
    private clientDisconnected(client: BaseClient, reason?: string): void {
        this.clients.delete(client);

        const room = this.clientsRoom.get(client);
        if (room) {
            // we need to remove the client from this room
            room.removeClient(client);

            if (room.clients.length === 0) {
                // then that room is empty, no need to keep it around
                const rooms = this.rooms.get(room.gameNamespace.gameName);
                if (!rooms) {
                    throw new Error("Could not find rooms client was in");
                }
                rooms.delete(room.id);

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
        this.clients.add(client);

        client.sent.alias.on((data) => this.clientSentAlias(client, data));
        client.sent.play.on((data) => this.clientSentPlay(client, data));
        client.events.disconnected.on(() => this.clientDisconnected(client, "Disconnected unexpectedly"));
        client.events.timedOut.on(() => this.clientDisconnected(client, "Timed out"));
    }

    /**
     * Creates and initializes a server that uses a listener pattern identical
     * to net.Server.
     *
     * @param port - The port to listen on for this server.
     * @param createServer - The required module's createServer method.
     * @param clientClass - The class constructor for clients of this listener.
     * @returns Once the listener is listening.
     */
    private initializeListener(
        port: number,
        createServer: (callback: (socket: net.Socket) => void) => net.Server,
        clientClass: typeof BaseClient,
    ): Promise<void> {
        const listener = createServer((socket) => {
            this.addSocket(socket, clientClass);
        });

        // Place a ' ' (space) before the 'Client' part of the class name.
        const clientName = clientClass.name.replace(/(Client)/g, " $1");

        this.listenerServers.push(listener);

        listener.on("error", (err: Error & { code: string }) => {
            logger.error(err.code !== "EADDRINUSE" // Very common error for devs
                ? String(err)
                : `Lobby cannot listen on port ${port} for game connections.
Address is already in use.

There's probably another Cerveau server running on this same computer.`);

            process.exit(1);
        });

        return new Promise((resolve) => {
            listener.listen(port, "0.0.0.0", () => {
                logger.info(`📞 Listening on port ${port} for ${clientName}s 📞`);

                resolve();
            });
        });
    }

    /**
     * Initializes all the games in the games/ folder.
     *
     * @returns The promise resolves when all games are initialized,
     * if an error occurs loading a game this is never resolved and the
     * process exits with code 1.
     */
    private async initializeGames(): Promise<void | never> {
        let dirs = await getDirs(GAMES_DIR);

        if (Config.GAME_NAMES_TO_LOAD.length > 0) {
            const gameDirs = Config.GAME_NAMES_TO_LOAD.map(unCapitalizeFirstLetter);

            const unknownGameNames = getMinusArray(gameDirs, dirs);
            if (unknownGameNames.length > 0) {
                throw new Error(`Cannot find directories to load for the selected games: ${
                    unknownGameNames.map((name) => `"${capitalizeFirstLetter(name)}"`).join(", ")
                }`);
            }

            // The selected game directories look fine! load them instead.
            dirs = gameDirs;
        }

        for (const dir of dirs) {
            let gameNamespace: IBaseGameNamespace | undefined;
            try {
                const data = await import(GAMES_DIR + dir) as IGamesExport;
                gameNamespace = data.Namespace;
            }
            catch (err) {
                const errorGameName = capitalizeFirstLetter(dir);
                throw new Error(`⚠️ Could not load game ${errorGameName} ⚠️
---
${err}`);
            }
            const gameName = gameNamespace.gameName;
            logger.info(`🕹️ ${gameName} game loaded 🕹️`);

            // hook up all the ways to get the game class via an index
            this.gameAliasToName.set(gameName.toLowerCase(), gameName);
            for (const alias of gameNamespace.GameManager.aliases) {
                this.gameAliasToName.set(alias.toLowerCase(), gameName);
            }

            this.gameNamespaces[gameName] = gameNamespace;

            this.rooms.set(gameName, new Map());
            this.roomsPlaying.set(gameName, new Map());
        }

        Object.freeze(this.gameNamespaces); // No more games can be added;
        // and it's public so we don't want people fucking with this object.
    }

    /**
     * Retrieves, or creates a new, session. For clients when saying what they
     * want to play.
     *
     * @param gameName - The key identifying the name of the game you want.
     * Should exist in games/
     * @param requestedId - Basically a room id. Specifying an id can be used
     * to join other players on purpose. "*" will join you to any open session
     * or a new one, and "new" will always give you a brand new room even if
     * there are open ones.
     * @returns The Room of gameName and id. If one does not exists a new
     * instance will be created
     */
    private getOrCreateRoom(
        gameName: string,
        requestedId: string = "*",
    ): Room |string {
        const rooms = this.rooms.get(gameName);

        if (!rooms) {
            return `Game name ${gameName} is not known to us.`;
        }

        let room: Room | undefined;
        let id = requestedId;

        if (id !== "new") {
            if (id === "*" || id === undefined) {
                // Then they want to join any open game,
                // so try to find an open session.
                for (const [, theRoom] of rooms) {
                    const theGame = theRoom.gameNamespace.gameName;
                    if (theRoom.isOpen() && theGame === gameName) {
                        room = theRoom;
                        break;
                    }
                }

                if (!room) {
                    // Then there was no open room to join,
                    // so they get a new room.
                    id = "new";
                }
            }
            else {
                // They requested to join a specific room.
                // An Error cannot be returned as gameName is checked above
                room = this.getRoom(gameName, id) as Room | undefined;
            }
        }

        if (room) {
            if (room.isRunning()) {
                // We can't put them in this game, so they get a new room.
                return `Room ${id} for game ${gameName} is full! Sorry.`;
            }
            else if (room.isOver()) {
                // We need to clear out this Room as it's over and available
                // to re-use.
                this.rooms.delete(id);
                room = undefined;
            }
        }

        if (!room) {
            // Then we couldn't find a room from the requested gameName + id,
            // so they get a new one.
            if (!id || id === "new") {
                id = String(this.nextRoomNumber++);
            }

            const namespace = this.getGameNamespace(gameName);
            if (!namespace) {
                throw new Error(`Could not find a namespace for ${gameName}.`);
            }

            room = new RoomClass(
                id,
                namespace,
                this.gamelogManager,
                this.updater,
            );

            rooms.set(id, room);
        }

        return room;
    }

    /**
     * When a client sends the 'play' event, which tells the server what it
     * wants to play and as who.
     *
     * @param client - The client that send the 'play' event
     * @param data - The information about what this client wants to play.
     */
    private async clientSentPlay(
        client: BaseClient,
        data: Readonly<PlayEvent["data"]>,
    ): Promise<void> {
        const playData = this.validatePlayData(data);

        if (typeof playData === "string") {
            // It did not validate, so playData is the invalid message
            client.disconnect(playData);

            return;
        }

        let authenticationError: string | undefined;
        try {
            authenticationError = await this.authenticate(
                playData.gameName,
                playData.playerName,
                playData.password,
            );
        }
        catch (error) {
            authenticationError = (error as Error).message;
        }

        if (authenticationError) {
            client.disconnect(`Authentication Error: '${authenticationError}'`);

            return;
        }

        const room = this.getOrCreateRoom(data.gameName, data.requestedSession);

        if (typeof room === "string") {
            client.disconnect(room);

            return;
        }

        // We need to check to make sure they did not request an already
        // requested player index.
        if (!isNil(playData.playerIndex)) {
            if (room.clients.find((c) => c.playerIndex === playData.playerIndex)) {
                // Then there is already a client in this room that requested
                // this player index so the existing client gets the index,
                // and this client gets rejected
                client.disconnect(`Player index ${playData.playerIndex} is already taken`);

                return;
            }
        }

        client.setInfo({
            name: playData.playerName,
            type: playData.clientType,
            index: playData.playerIndex,
        });

        room.addClient(client);
        this.clientsRoom.set(client, room);

        if (Config.GAME_SETTINGS_ENABLED && data.gameSettings) {
            room.addGameSettings(playData.validGameSettings);
        }

        client.send({
            event: "lobbied",
            data: {
                gameName: data.gameName,
                gameSession: room.id,
                constants: SHARED_CONSTANTS,
            },
        });

        if (room.canStart()) {
            this.unTrackClients(...room.clients);

            const roomsPlayingThisGame = this.roomsPlaying.get(playData.gameName);
            if (!roomsPlayingThisGame) {
                throw new Error(`Could not find rooms for ${data.gameName} to start`);
            }
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

    /**
     * Authenticates player information. If a string is resolved that is an
     * error message string. Otherwise they authenticated and can play!
     *
     * @param gameName - The name of the game they want to play.
     * @param playerName - The name of the player wanting to play.
     * @param password - The password they are trying to use. Not encrypted or
     * anything fancy like that. Plaintext.
     * @returns A promise that resolves to either error text is they
     */
    private async authenticate(
        gameName: string,
        playerName: string,
        password: string | undefined,
    ): Promise<string | undefined> {
        if (!Config.AUTH_PASSWORD) {
            return undefined; // we do not need to authenticate them
        }

        // tslint:disable-next-line:possible-timing-attack - passwords are in no way crypto-safe in Cerveau
        if (Config.AUTH_PASSWORD !== password) {
            return `Could not authenticate.
'${password} is not a valid password to play on this server'`;
        }

        return undefined; // password was valid!
    }

    /**
     * Validates that the data sent in a 'play' event from a client is valid.
     *
     * @param data - The play event data to validate.
     * @returns - Human readable text why the data is not valid.
     */
    private validatePlayData(
        data?: Readonly<PlayEvent["data"]>,
    ): string | (PlayEvent["data"] & { validGameSettings: UnknownObject }) {
        if (!data) {
            return "Sent 'play' event with no data.";
        }

        const { gameSettings, ...noGameSettings } = data;
        const validatedData = {
            validGameSettings: {}, // will be overwritten below
            gameSettings,
            ...noGameSettings,
        };

        if (this.isShuttingDown) {
            return "Game server is shutting down and not accepting new clients.";
        }

        // Clients can send aliases of what they want to play as the game name;
        // so we need to verify it is a valid game name
        const gameAlias = String(data.gameName);
        const gameNamespace = this.getGameNamespace(gameAlias);
        if (!gameNamespace) {
            return `Game alias '${data.gameName}' is not a known game.`;
        }
        else {
            validatedData.gameName = gameNamespace.gameName;
        }

        // Special case for backwards compatibility.
        // -1 is treated as if they didn't care about their playerIndex
        if (validatedData.playerIndex === -1 || isNil(validatedData.playerIndex)) {
            validatedData.playerIndex = undefined;
        }
        else {
            const asNumber = sanitizeNumber(validatedData.playerIndex, true);
            if (asNumber instanceof Error) {
                return `playerIndex is not valid: ${asNumber.message}`;
            }
            validatedData.playerIndex = asNumber;
        }

        const n = gameNamespace.GameManager.requiredNumberOfPlayers;
        if (validatedData.playerIndex !== undefined
            && (validatedData.playerIndex < 0 || validatedData.playerIndex >= n)
        ) {
            return `playerIndex '${validatedData.playerIndex}' is out of range (max ${n} players).
Please use zero-based indexing, where '0' is the first player.`;
        }
        // else it is valid as undefined or a number in the range for max players.

        if (data && data.gameSettings && Config.GAME_SETTINGS_ENABLED) {
            const footer = `
---
Available game settings:
${gameNamespace.gameSettingsManager.getHelp()}`;

            let settings: UnknownObject = {};
            try {
                settings = (querystring.parse(data.gameSettings));
            }
            catch (err) {
                return `Game settings incorrectly formatted.
Must be one string in the url parameters format.${footer}`;
            }

            const validated = gameNamespace.gameSettingsManager.invalidateSettings(settings);
            if (validated instanceof Error) {
                return validated.message + footer;
            }

            validatedData.validGameSettings = validated;
        }

        return validatedData;
    }

    /**
     * When a client sends the 'alias' event, which tells use they want to
     * know what this game alias really is.
     *
     * @param client - The client that send the 'play'.
     * @param alias - The alias they want named.
     * @returns A promise that is resolved once we've sent the client their
     * 'named' gameName.
     */
    private async clientSentAlias(
        client: BaseClient,
        alias: string,
    ): Promise<void> {
        const gameName = this.getGameNameForAlias(alias);

        if (!gameName) {
            client.disconnect(`${alias} is not a known game alias for any game.`);

            return;
        }

        client.send({ event: "named", data: gameName });
    }

    /**
     * Stops tracking clients
     *
     * @param clients the clients to stop tracking events for
     */
    private unTrackClients(...clients: BaseClient[]): void {
        for (const client of clients) {
            client.events.disconnected.offAll();
            client.events.timedOut.offAll();
        }

        for (const client of clients) {
            this.clients.delete(client);
        }
    }

    /**
     * Attempts to gracefully shut down this Lobby and all its Rooms.
     * If this is called a second time while waiting for games to exit,
     * then this will force shut down.
     *
     * @returns A promise that _might_ resolve. Otherwise process.exit is
     * called so it never resolves. Really just ignore this.
     */
    private async shutDown(): Promise<void> {
        if (!this.isShuttingDown) {
            this.isShuttingDown = true;
            logger.info("Ω Shutting down gracefully Ω");

            const n = Array
                .from(this.roomsPlaying)
                .reduce((sum, [name, rooms]) => sum + rooms.size, 0);

            logger.info(`   ${n} game${n !== 1 ? "s" : ""} currently running`);
            if (n === 0) {
                logger.info("     ↳ No one here, see you later!");
            }

            try {
                // Tell all clients we are shutting down, and asynchronously
                // wait for the socket to confirm the data was sent before
                // proceeding.
                await Promise.all([...this.clients].map((client) => {
                    client.disconnect("Sorry, the server is shutting down.");
                }));
            }
            catch (rejection) {
                // We don't care.
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
    }
}

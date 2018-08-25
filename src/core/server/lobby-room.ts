import { events, Signal } from "ts-typed-events";
import { BaseGameSettingsManager, GamelogManager, IBaseGameNamespace, IGamelog,
         IGamelogWinnerLoser } from "~/core/game";
import { logger } from "~/core/log";
import { removeElements, UnknownObject } from "~/utils";
import { BaseClient } from "../clients/";
import { Updater } from "../updater";

/**
 * A container for the Lobby to contain clients and information about what they
 * want to play.
 */
export class Room {
    /** The events emitted from this room. */
    public readonly events = events({
        over: new Signal(),
    });

    /**
     * All the clients connected to this room (spectators and players alike)
     */
    public readonly clients: BaseClient[] = [];

    /**
     * Once written to disk, this will be the filename of the gamelog for this
     * room
     */
    public gamelogFilename?: string;

    /** Once the game is over, this will exist and be the list of winners */
    public winners?: IGamelogWinnerLoser[];

    /** Once the game is over, this will exist and be the list of losers */
    public losers?: IGamelogWinnerLoser[];

    /** The manager we use to validate game settings against */
    protected readonly gameSettingsManager: BaseGameSettingsManager;

    /** If the game this room is playing has been ran and it is over */
    private over: boolean = false;

    /**
     * Creates a room for a lobby to hold clients before they play the game.
     *
     * @param id - The ID of our session we will run in time.
     * @param gameNamespace - The namespace of the game to play.
     * @param gamelogManager - The gamelog manager instance to log gamelogs
     * generated in this room.
     * @param updater - The updated to check for updates with.
     */
    constructor(
        public readonly id: string,
        public readonly gameNamespace: IBaseGameNamespace,
        protected readonly gamelogManager: GamelogManager,
        private readonly updater?: Updater,
    ) {
        this.gameSettingsManager = new gameNamespace.GameSettingsManager();
    }

    /**
     * Gets the clients that are playing the game (omits spectators).
     *
     * @returns A new array of only clients playing the game.
     */
    public getClientsPlaying(): BaseClient[] {
        return this.clients.filter((c) => !c.isSpectating);
    }

    /**
     * Adds a client to this session.
     *
     * @param client - the client to add to this session
     */
    public addClient(client: BaseClient): void {
        this.clients.push(client);
    }

    /**
     * Removes a client from this session.
     *
     * @param client - the client to remove from this session
     */
    public removeClient(client: BaseClient): void {
        removeElements(this.clients, client);
    }

    /**
     * Checks if the game for this session is over
     * @returns True if the game is over, false otherwise
     */
    public isOver(): boolean {
        return this.over;
    }

    /**
     * If this session is open to more clients joining
     *
     * @returns true if open, false otherwise
     */
    public isOpen(): boolean {
        return !this.isOver() && !this.isRunning() && !this.canStart();
    }

    /**
     * If this session has enough playing clients in it to start running.
     * The Lobby uses this to know when it should start.
     *
     * @returns true if ready to start running, false otherwise
     */
    public canStart(): boolean {
        const { requiredNumberOfPlayers } = this.gameNamespace.GameManager;

        return !this.isOver()
            && !this.isRunning()
            && this.getClientsPlaying().length === requiredNumberOfPlayers;
    }

    /**
     * Starts this session by having it spin up a new worker thread for the
     * game instance.
     */
    public start(): void {
        if (this.updater) { // && this.updater.foundUpdates()) {
            logger.warn("Starting a game session without updates!");
        }

        // super classes should inherit and do things
    }

    /**
     * If this session has a game instance running on a worker thread.
     * @returns true if it is running, false otherwise
     */
    public isRunning(): boolean {
        return false; // super lobbies should do the thing
    }

    /**
     * Adds game settings to this game instance, parsing them from strings to
     * correct types.
     *
     * @param settings - the key/value pair settings to add
     * @returns An error if the settings were invalid, otherwise nothing
     */
    public addGameSettings(settings: UnknownObject): void | Error {
        return this.gameSettingsManager.addSettings(settings);
    }

    /**
     * Invoked when a sub class knows its game session.
     *
     * @returns Once the over event is emitted.
     */
    protected async handleOver(): Promise<void> {
        this.events.over.emit();
    }

    /**
     * Cleans everything up once the same session is over
     *
     * @param gamelog The gamelog resulting from the game played in the session
     * @returns A promise that resolves once the gamelog is written to disk.
     */
    protected async cleanUp(gamelog: IGamelog): Promise<void> {
        this.over = true;
        this.winners = gamelog.winners;
        this.losers = gamelog.losers;

        // Undefined to signify the gamelog does not exist,
        // as it has not be written to the file system yet
        this.gamelogFilename = undefined;

        // Now write the gamelog, once written update our
        // `gamelogFilename` to the actual slug to signify it can be
        // read now
        this.gamelogFilename = await this.gamelogManager.log(gamelog);
    }
}

import { events, Signal } from "ts-typed-events";
import { BaseGameSettingsManager, GameLogManager, IBaseGameNamespace, IGamelog,
    IGamelogWinnerLoser } from "~/core/game";
import { logger } from "~/core/log";
import { IAnyObject, removeElements } from "~/utils";
import { BaseClient } from "../clients/";
import { Updater } from "../updater";

/**
 * A container for the Lobby to contain clients and information about what they want to play
 */
export class Room {
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

    constructor(
        public readonly id: string,
        public readonly gameNamespace: IBaseGameNamespace,
        protected readonly gameLogger: GameLogManager,
        private readonly updater?: Updater,
    ) {
        this.gameSettingsManager = new gameNamespace.GameSettingsManager();
    }

    public getClientsPlaying(): BaseClient[] {
        return this.clients.filter((c) => !c.isSpectating);
    }

    /**
     * Adds a client to this session
     *
     * @param client - the client to add to this session
     */
    public addClient(client: BaseClient): void {
        this.clients.push(client);
    }

    /**
     * Removes a client from this session
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
     * If this session has enough playing clients in it to start running. Lobby starts sessions.
     *
     * @returns true if ready to start running, false otherwise
     */
    public canStart(): boolean {
        return !this.isOver()
            && !this.isRunning()
            && this.getClientsPlaying().length === this.gameNamespace.GameManager.requiredNumberOfPlayers;
    }

    /**
     * Starts this session by having it spin up a new worker thread for the game instance
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
     * Adds game settings to this game instance, parsing them from strings to correct types
     *
     * @param settings - the key/value pair settings to add
     * @returns An error if the settings were invalid, otherwise nothing
     */
    public addGameSettings(settings: IAnyObject): void | Error {
        return this.gameSettingsManager.addSettings(settings);
    }

    protected async handleOver(): Promise<void> {
        this.events.over.emit();
    }

    protected async cleanUp(gamelog: IGamelog): Promise<void> {
        this.over = true;
        this.winners = gamelog.winners;
        this.losers = gamelog.losers;
        // undefined to signify the gamelog does not exist, as it has not be written to the file system yet
        this.gamelogFilename = undefined;

        // now write the gamelog, once written update our
        // `gamelogFilename` to the actual slug to signify it can be
        // read now
        this.gamelogFilename = await this.gameLogger.log(gamelog);
    }
}
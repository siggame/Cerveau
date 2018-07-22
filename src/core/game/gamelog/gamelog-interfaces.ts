import { IOrderData, IRunData } from "~/core/clients";
import { IUnknownObject } from "~/utils";

/** The shape of a gamelog, both being built and if read from memory. */
export interface IGamelog {
    /**
     * The name of the game.
     * Use this to figure out how to parse game structure
     */
    gameName: string;

    /**
     * The session identifier used on the game server for this game's session
     */
    gameSession: string;

    /** The Unix epoch for the time when this gamelog was generated */
    epoch: number;

    /** The value used to seed the random number generator server side */
    settings: IUnknownObject;

    /** The list of all players that won this game (normally just one) */
    winners: IGamelogWinnerLoser[];

    /** The list of all players that lost this game (normally just one) */
    losers: IGamelogWinnerLoser[];

    /** Lookup of constants used to parse game server <-> client IO */
    constants: IUnknownObject;

    /**
     * The list of all deltas in the game. The first delta being the initial
     * state
     */
    deltas: IDelta[];
}

/** A delta represents a change in game state */
export interface IDelta {
    /** The type of delta, or reason it occurred */
    type: string;

    /**
     * Meta data about why the delta occurred, such as data sent to the server
     * from a game client
     */
    data?: IDeltaData;

    /** The state of the game, but ONLY changed keys */
    game: any;
}

/** The base delta data interface */
export interface IDeltaData {
}

/** Data about why a player disconnected. */
export interface IDisconnectDeltaData extends IDeltaData {
    player: IGameObjectReference;
    timeout: boolean;
}

/** Data about what game logic got ran. */
export interface IRanDeltaData extends IDeltaData {
    player: IGameObjectReference;
    run: IRunData;
    invalid?: string;
    returned: any;
}

/** Data about a player being ordered to do something. */
export interface IOrderedDeltaData extends IDeltaData {
    player: IGameObjectReference;
    order: IOrderData;
}

/** Data bout a player finishing an order. */
export interface IFinishedDeltaData extends IDeltaData {
    player: IGameObjectReference;
    order: IOrderData;
    returned: any;
    invalid?: any;
}

/** A shorthand object representing a player that won or lost in the game */
export interface IGamelogWinnerLoser {
    /** The player's index in the game.players array */
    index: number;

    /** The player's GameObject id */
    id: string;

    /** The name of the player */
    name: string;

    /** The reason this player won or lost */
    reason: string;

    /** Indicates if they disconnected unexpectedly before the game was over */
    disconnected: boolean;

    /** Indicates if they timed out before the game was over */
    timedOut: boolean;
}

/** A reference to a game object, which just holds the ID of the game object */
export interface IGameObjectReference {
    /**
     * A unique id for each instance of a GameObject or a sub class.
     * Used for client and server communication.
     * Should never change value after being set.
     */
    id: string;
}

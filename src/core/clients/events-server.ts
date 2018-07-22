import { IUnknownObject } from "~/utils";

// These are events the server (this) sends to the client

/** Sent to clients when the game is over. For the "over" event. */
export interface IOverData {
    gamelogURL: string;
    visualizerURL?: string;
    message?: string;
}

/** Sent to clients when the game has started. For the "start" event. */
export interface IStartData {
    playerID?: string;
}

/**
 * Sent to clients when they need to run an order (function).
 * For the "order" event.
 */
export interface IOrderData {
    name: string;
    index: number;
    args: any[];
}

/**
 * Sent to clients when something they send gameplay wise is invalid.
 * For the "invalid" event
 */
export interface IInvalidData {
    message: string;
    data?: any;
}

/**
 * Sent to clients when they join a Lobby but the game has not started.
 * For the "lobbied" event.
 */
export interface ILobbiedData {
    gameName: string;
    gameSession: string;
    constants: IUnknownObject;
}

/**
 * Sent to clients when something happens that is so bad, they must be
 * forcefully disconnected. For the "fatal" event.
 */
export interface IFatalData {
    message?: string;
}

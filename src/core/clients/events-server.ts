import { IAnyObject } from "src/utils";

// These are events the server (this) sends to the client

export interface IOverData {
    gamelogURL: string;
    visualizerURL?: string;
    message?: string;
}

export interface IStartData {
    playerID?: string;
}

export interface IOrderData {
    name: string;
    index: number;
    args: any[];
}

export interface IInvalidData {
    message: string;
    data?: any;
}

export interface ILobbiedData {
    gameName: string;
    gameSession: string;
    constants: IAnyObject;
}

export interface IFatalData {
    message?: string;
}

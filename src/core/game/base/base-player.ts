import { BaseAI } from "./base-ai";
import { BaseGameObject, IBaseGameObjectData } from "./base-game-object";

/** Base data Player instances will need to be initialized */
export interface IBasePlayerData extends IBaseGameObjectData {
    name: string;
    clientType: string;
}

/**
 * Represents a Player in a game.
 * NOTE: An interface because we don't want to deal with multiple-inheritance
 * in TS.
 */
export interface IBasePlayer extends BaseGameObject, IBasePlayerData {
    ai: BaseAI;
    timeRemaining: number;

    lost: boolean;
    reasonLost: string;
    won: boolean;
    reasonWon: string;
}

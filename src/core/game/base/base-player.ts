import { BaseAI } from "./base-ai";
import { BaseGameObject, IBaseGameObjectData } from "./base-game-object";

export interface IBasePlayerData extends IBaseGameObjectData {
    name: string;
    clientType: string;
}

export interface IBasePlayer extends BaseGameObject, IBasePlayerData {
    ai: BaseAI;
    timeRemaining: number;

    lost: boolean;
    reasonLost: string;
    won: boolean;
    reasonWon: string;
}

export type BasePlayer = BaseGameObject & IBasePlayer;

import { IBasePlayer } from "cadre-ts-utils/cadre";
import { BaseAI } from "./base-ai";
import { BaseGameObject, IBaseGameObjectData } from "./base-game-object";

/** Base data Player instances will need to be initialized */
export interface IBasePlayerData extends IBaseGameObjectData {
    name: string;
    clientType: string;
}

/**
 * Represents a Player in a game.
 * NOTE: A type because we don't want to deal with multiple-inheritance in TS.
 */
export type BasePlayer = BaseGameObject & IBasePlayer & {
    ai: BaseAI;
};

import { ISanitizableType } from "~/core/sanitize/sanitizable-interfaces";
import { Constructor } from "~/utils";
import { BaseAI } from "./base-ai";
import { BaseGame } from "./base-game";
import { BaseGameManager } from "./base-game-manager";
import { BaseGameObjectFactory } from "./base-game-object-factory";
import { BaseGameSettingsManager } from "./base-game-settings";
import { IBasePlayer } from "./base-player";

/** Namespace schema for a base game object */
export interface IBaseGameObjectSchema {
    parentClassName?: string;
    attributes: { [key: string]: ISanitizableType & {
        defaultValue?: any,
    }};
    functions: { [key: string]: IBaseGameObjectFunctionSchema };
}

/** Namespace schema for functions that game objects can invoke */
export interface IBaseGameObjectFunctionSchema {
    args: Array<ISanitizableType & { argName: string, defaultValue?: any }>;
    returns: ISanitizableType;
    invalidValue?: any;
}

/** The namespace all game index files should export */
export interface IBaseGameNamespace {
    AI: typeof BaseAI;
    Game: typeof BaseGame;
    GameManager: typeof BaseGameManager;
    GameObjectFactory: typeof BaseGameObjectFactory;
    GameSettingsManager: typeof BaseGameSettingsManager;
    Player: Constructor<IBasePlayer>;

    gameName: string;
    gameObjectsSchema: {
        AI: IBaseGameObjectSchema;
        Game: IBaseGameObjectSchema;
        [gameObjectName: string]: IBaseGameObjectSchema;
    };
    gameSettingsManager: BaseGameSettingsManager;
}

/**
 * Should be invoked by all games to format their namespace correctly.
 *
 * @param namespace - The base game namespace to use.
 * @returns A fresh game namespace ready to be used to play games with.
 */
export function makeNamespace(namespace: IBaseGameNamespace): IBaseGameNamespace {
    for (const obj of Object.values(namespace.gameObjectsSchema)) {
        let depth = obj;
        while (depth.parentClassName) {
            // hook up the parent classes' attributes/functions
            const parent = namespace.gameObjectsSchema[depth.parentClassName];
            Object.assign(obj.attributes, parent.attributes);
            Object.assign(obj.functions, parent.functions);
            depth = parent;
        }
    }

    return namespace;
}

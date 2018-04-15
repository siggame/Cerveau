import { ISanitizableType } from "~/core/type-sanitizer";
import { Constructor } from "~/utils";
import { BaseAI } from "./base-ai";
import { BaseGame } from "./base-game";
import { BaseGameManager } from "./base-game-manager";
import { BaseGameObjectFactory } from "./base-game-object-factory";
import { BaseGameSettingsManager } from "./base-game-settings";
import { IBasePlayer } from "./base-player";

export interface IBaseGameObjectSchema {
    parentClassName?: string;
    attributes: { [key: string]: ISanitizableType & { defaultValue?: any } };
    functions: { [key: string]: IBaseGameObjectFunctionSchema };
}

export interface IBaseGameObjectFunctionSchema {
    // invalidate: (instance: BaseGameObject, args: IAnyObject) => string | IArguments;
    // run: (instance: BaseGameObject, ...args: any[]) => Promise<any>;
    args: Array<ISanitizableType & { argName: string, defaultValue?: any }>;
    returns: ISanitizableType;
    invalidValue?: any;
}

export interface IBaseGameSchema {
    [gameObjectName: string]: IBaseGameObjectSchema;
}

export interface IBaseGameNamespace {
    AI: typeof BaseAI;
    Game: typeof BaseGame;
    GameManager: typeof BaseGameManager;
    GameObjectFactory: typeof BaseGameObjectFactory;
    GameSettingsManager: typeof BaseGameSettingsManager;
    Player: Constructor<IBasePlayer>;

    gameObjectsSchema: {
        AI: IBaseGameObjectSchema;
        Game: IBaseGameObjectSchema;
        [gameObjectName: string]: IBaseGameObjectSchema;
    };
    gameSettingsManager: BaseGameSettingsManager;
}

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

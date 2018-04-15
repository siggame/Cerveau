import { defaultArray, sanitizeType } from "~/core/type-sanitizer";
import { IAnyObject, objectHasProperty } from "~/utils";
import { IBaseGameNamespace, IBaseGameObjectFunctionSchema } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";

/**
 * A collection of static functions to sanitize inputs from AI clients for the ${game_name} Game.
 */
export class BaseGameSanitizer {
    constructor(protected readonly namespace: IBaseGameNamespace) {
    }

    public sanitizeOrderArgs(aiFunctionName: string,
                             args: any[],
    ): Error | any[] {
        const schema = this.namespace.gameObjectsSchema.AI.functions[aiFunctionName];
        if (!schema) {
            return new Error(`Order ${aiFunctionName} does not exist to sanitize args for`);
        }

        const argsArray = defaultArray(args);
        return schema.args.map((t, i) => sanitizeType(t, argsArray[i]));
    }

    public validateFinishedReturned(aiFunctionName: string,
                                    returned: any,
    ): any {
        const schema = this.namespace.gameObjectsSchema.AI.functions[aiFunctionName];
        if (!schema) {
            return new Error(`Order ${aiFunctionName} does not exist to sanitize returned for`);
        }

        return sanitizeType(schema.returns, returned);
    }

    public validateRunArgs(gameObject: BaseGameObject,
                           functionName: string,
                           args: IAnyObject,
    ): Error | Map<string, any> {
        const schema = this.validateGameObject(gameObject, functionName);
        if (schema instanceof Error) {
            return schema;
        }

        const sanitizedArgs = new Map<string, any>();
        for (const arg of schema.args) {
            const value = objectHasProperty(args, arg.argName)
                ? args[arg.argName]
                : arg.defaultValue;

            const sanitized = sanitizeType(arg, value);
            sanitizedArgs.set(arg.argName, sanitized);
        }

        return sanitizedArgs;
    }

    public validateRanReturned(gameObject: BaseGameObject,
                               functionName: string,
                               returned: any,
    ): any {
        const schema = this.validateGameObject(gameObject, functionName);
        if (schema instanceof Error) {
            return schema;
        }

        return sanitizeType(schema.returns, returned);
    }

    private validateGameObject(gameObject: BaseGameObject,
                               functionName: string,
    ): Error | IBaseGameObjectFunctionSchema {
        if (
            !gameObject ||
            !(gameObject instanceof BaseGameObject) ||
            !this.namespace.gameObjectsSchema[gameObject.gameObjectName]
        ) {
            return new Error(`${gameObject} is not a valid game object`);
        }

        const gameObjectSchema = this.namespace.gameObjectsSchema[gameObject.gameObjectName];
        if (!gameObjectSchema.functions[functionName]) {
            return new Error(`${gameObject} does not have a method ${functionName}`);
        }

        return gameObjectSchema.functions[functionName];
    }
}

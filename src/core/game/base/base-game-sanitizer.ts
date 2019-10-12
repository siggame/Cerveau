import { sanitizeArray, sanitizeType } from "~/core/sanitize/";
import { Immutable, objectHasProperty, quoteIfString, UnknownObject } from "~/utils";
import { IBaseGameNamespace, IBaseGameObjectFunctionSchema } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";

/** If failed validation this shape is expected. */
export interface IInvalidated {
    /** The human readable string why it is invalid. */
    invalid: string;
}

/**
 * A collection of static functions to sanitize inputs from AI clients for the
 * Game.
 */
export class BaseGameSanitizer {
    /**
     * Creates a new sanitizer for a game.
     *
     * @param namespace - The game namespace we are sanitizing for.
     */
    constructor(protected readonly namespace: Immutable<IBaseGameNamespace>) {
    }

    /**
     * Sanitizes arguments for an AI order.
     *
     * @param aiFunctionName - The name of the order.
     * @param args  - The arguments for that order (in order of arguments).
     * @returns An error if they could not be sanitized. Otherwise a new array
     * with freshly sanitized arguments.
     */
    public sanitizeOrderArgs(
        aiFunctionName: string,
        args: Immutable<unknown[]>,
    ): Error | unknown[] {
        const schema = this.namespace.gameObjectsSchema.AI.functions[aiFunctionName];
        if (!schema) {
            return new Error(`Order ${aiFunctionName} does not exist to sanitize args for`);
        }

        const argsArray = sanitizeArray(args, false);

        return schema.args.map((t, i) => {
            const sanitized = sanitizeType(t, argsArray[i]);
            if (sanitized instanceof Error) {
                throw sanitized; // server side error, we should never have this happen
            }

            return sanitized;
        });
    }

    /**
     * Validates a return value from an AI finishing an order.
     *
     * @param aiFunctionName - The name of the order/function the AI executed.
     * @param returned - The value they returned.
     * @returns The returned value, now sanitized.
     */
    public validateFinishedReturned(
        aiFunctionName: string,
        returned: unknown,
    ): unknown {
        const schema = this.namespace.gameObjectsSchema.AI.functions[aiFunctionName];
        if (!schema) {
            return new Error(`Order ${aiFunctionName} does not exist to sanitize returned for`);
        }

        return sanitizeType(schema.returns, returned);
    }

    /**
     * Validates the arguments for an AI requesting a run function.
     *
     * @param gameObject - The game object that would run this function.
     * @param functionName - The name of the function trying to run.
     * @param args - Key/value arguments for the function
     * @returns An error if validation failed, otherwise a map of sanitized
     * key/value arguments, with the iteration order respecting their argument
     * order for the function.
     */
    public validateRunArgs(
        gameObject: BaseGameObject,
        functionName: string,
        args: Readonly<UnknownObject>,
    ): Error | Map<string, unknown> | IInvalidated {
        const schema = this.validateGameObject(gameObject, functionName);
        if (schema instanceof Error) {
            return schema;
        }

        const sanitizedArgs = new Map<string, unknown>();
        for (const arg of schema.args) {
            const value = objectHasProperty(args, arg.argName)
                ? args[arg.argName]
                : arg.defaultValue;

            const sanitized = sanitizeType(arg, value);

            if (sanitized instanceof Error) {
                return {
                    invalid: `${gameObject.gameObjectName}.${functionName}()'s '${arg.argName}' arg was sent ${
                        quoteIfString(value)
                    } - ${sanitized.message}`,
                };
            }

            sanitizedArgs.set(arg.argName, sanitized);
        }

        return sanitizedArgs;
    }

    /**
     * Validates the return value of a ran function.
     *
     * @param gameObject - The game object instance that ran code.
     * @param functionName - The function name in the game object that ran.
     * @param returned - The value that was returned from that function.
     * @returns A sanitized return value of the expected schema type.
     */
    public validateRanReturned(
        gameObject: BaseGameObject,
        functionName: string,
        returned: unknown,
    ): unknown {
        const schema = this.validateGameObject(gameObject, functionName);
        if (schema instanceof Error) {
            return schema;
        }

        const sanitized = sanitizeType(schema.returns, returned);
        if (sanitized instanceof Error) {
            throw sanitized; // server side error, we should never have this happen
        }

        return sanitized;
    }

    /**
     * Validates a game object has a specific function.
     *
     * @param gameObject - The game object instance.
     * @param functionName The function name inside the game object.
     * @returns The schema if valid, otherwise an error.
     */
    private validateGameObject(
        gameObject: BaseGameObject,
        functionName: string,
    ): Error | Immutable<IBaseGameObjectFunctionSchema> {
        if (
            !gameObject ||
            !(gameObject instanceof BaseGameObject) ||
            !this.namespace.gameObjectsSchema[gameObject.gameObjectName]
        ) {
            return new Error(`${gameObject} is not a valid game object`);
        }

        const gameObjectSchema = this.namespace.gameObjectsSchema[gameObject.gameObjectName];
        const functionSchema = gameObjectSchema && gameObjectSchema.functions[functionName];
        if (!gameObjectSchema || !functionSchema) {
            return new Error(`${gameObject} does not have a method ${functionName}`);
        }

        return functionSchema;
    }
}

import { defaultArray, sanitizeType } from "~/core/type-sanitizer";
import { IAnyObject, objectHasProperty } from "~/utils";
import { IBaseGameNamespace, IBaseGameObjectFunctionSchema } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";

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
    constructor(protected readonly namespace: IBaseGameNamespace) {
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
        args: any[],
    ): Error | any[] {
        const schema = this.namespace.gameObjectsSchema.AI.functions[aiFunctionName];
        if (!schema) {
            return new Error(`Order ${aiFunctionName} does not exist to sanitize args for`);
        }

        const argsArray = defaultArray(args);
        return schema.args.map((t, i) => sanitizeType(t, argsArray[i]));
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
        returned: any,
    ): any {
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
        args: IAnyObject,
    ): Error | Map<string, any> | { invalid: string } {
        const schema = this.validateGameObject(gameObject, functionName);
        if (schema instanceof Error) {
            return schema;
        }

        const sanitizedArgs = new Map<string, any>();
        for (const arg of schema.args) {
            const value = objectHasProperty(args, arg.argName)
                ? args[arg.argName]
                : arg.defaultValue;

            let sanitized = sanitizeType(arg, value);
            const invalidPrefix = gameObject.gameObjectName
                + `.${functionName}()'s '${arg.argName}' arg was `
                + `sent '${value}'`;

            if (arg.typeName === "gameObject" && !arg.nullable && !sanitized) {
                return {
                    invalid: `${invalidPrefix}, which cannot be null.`,
                };
            }

            if ((
                arg.typeName === "string" ||
                arg.typeName === "float" ||
                arg.typeName === "int" ||
                arg.typeName === "boolean"
            ) && arg.literals) {
                let found = arg.literals.includes(sanitized);

                if (!found && arg.typeName === "string") {
                    // Try to see if the string is found via a case-insensitive
                    // search.
                    const lowered: string = sanitized.toLowerCase();
                    for (const literal of arg.literals!) {
                        const loweredLiteral = (literal as string).toLowerCase();

                        if (lowered === loweredLiteral) {
                            sanitized = literal; // we found the literal value
                            found = true;
                            break;
                        }
                    }
                }

                if (!found) {
                    // the value they sent was not one of the literals
                    return {
                        invalid: `${invalidPrefix}, which is not an expected `
                            + `value from [${arg.literals!.join(", ")}]`,
                    };
                }
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
        returned: any,
    ): any {
        const schema = this.validateGameObject(gameObject, functionName);
        if (schema instanceof Error) {
            return schema;
        }

        return sanitizeType(schema.returns, returned);
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

import { BaseGameObject } from "~/core/game/base/base-game-object";

/**
 * Takes a variable and ensures it is a game object, If the passed in value is
 * not a game object of the class specified, returns an Error.
 *
 * @param obj Any variable, if it is a game object passes it back, otherwise
 * returns undefined or an Error.
 * @param gameObjectClass An optional game object class to enforce on the game
 * object.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns The passed in game object, if it is one, otherwise undefined.
 */
export function sanitizeGameObject(
    obj: unknown,
    gameObjectClass: typeof BaseGameObject,
    allowError: boolean,
): BaseGameObject | Error;

/**
 * Takes a variable and ensures it is a game object.
 * If it is not returns undefined.
 *
 * @param obj Any variable, if it is a game object passes it back, otherwise
 * returns undefined or an Error.
 * @param gameObjectClass An optional game object class to enforce on the game
 * object.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns The passed in game object, if it is one, otherwise undefined.
 */
export function sanitizeGameObject(
    obj: unknown,
    gameObjectClass: typeof BaseGameObject,
    allowError: false,
): BaseGameObject | undefined;

/**
 * Takes a variable and ensures it is a game object, If the passed in value is
 * not a game object of the class specified, returns an Error.
 *
 * @param obj Any variable, if it is a game object passes it back, otherwise
 * returns undefined or an Error.
 * @param gameObjectClass An optional game object class to enforce on the game
 * object.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns The passed in game object, if it is one, otherwise undefined.
 */
export function sanitizeGameObject(
    obj: unknown,
    gameObjectClass: typeof BaseGameObject,
    allowError: boolean = true,
): BaseGameObject | undefined | Error {
    return obj instanceof gameObjectClass
        ? obj
        : (allowError
            ? new Error(`${obj} is not of the expected GameObject class \`${gameObjectClass.name}\``)
            : undefined
        );
}

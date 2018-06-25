/**
 * A collection of static functions that deals with transforming game states to
 * and from serialize-able objects when communicating between client <--> sever
 */

import { IAnyObject, isEmptyExceptFor, isObject, mapToObject } from "~/utils";
import { SHARED_CONSTANTS } from "./constants";
import { BaseGame, BaseGameObject } from "./game/";

/** The names of types that are accepted from creer types. */
export type SerializableTypeName =
    "string" |
    "float" |
    "int" |
    "boolean" |
    "dictionary" |
    "list" |
    "gameObject" |
    "void"
;

/**
 * Checks if a given object is a game object reference (has only an id key set).
 *
 * @param obj - The object to check.
 * @returns True if the object is a game object reference
 */
export function isGameObjectReference(obj: IAnyObject): boolean {
    return isEmptyExceptFor(obj, "id");
}

/**
 * Checks if the given value is an object that is an array in delta array
 * notation
 *
 * @param a The object to check.
 * @returns True if it a delta array, false otherwise.
 */
export function isDeltaArray(a: any): boolean {
    return (
        isObject(a) &&
        Object.hasOwnProperty.call(a, SHARED_CONSTANTS.DELTA_LIST_LENGTH)
    );
}

/**
 * Serializes something about a game so it is safe to send over a socket.
 * This is required to avoid cycles and send lists correctly.
 *
 * @param state The variable you want to serialize.
 * Anything in the game should be Serializable, numbers, strings,
 * BaseGameObjects, dicts, lists, nulls, etc.
 * @returns The state, serialized. It will never be the same object if it is an
 * object ({} or []).
 */
export function serialize(state: any): any {
    if (!isObject(state)) {
        return state; // not an object, no need to further serialize
    }
    else if (state instanceof BaseGameObject) {
        // no need to serialize this whole thing
        return { id: state.id };
    }

    if (state instanceof Map) {
        state = mapToObject(state);
    }

    const serialized: IAnyObject = {};
    if (state instanceof Array) {
        // Record the length, we never send arrays in serialized states because
        // you can't tell when they change in size without sending all the
        // elements.
        serialized[SHARED_CONSTANTS.DELTA_LIST_LENGTH] = state.length;
    }

    for (const [key, value] of Object.entries(state)) {
        serialized[key] = serialize(value);
    }

    return serialized;
}

/**
 * Un-serializes data from a game client.
 *
 * @param data The data to un-serialize.
 * @param game The game to lookup game objects in for game object references in
 * data.
 * @param dataTypeConverter The function to convert the un-serialized value
 * once found.
 * @returns The data now un-serialized, will create new objects instead of
 * reusing objects.
 */
export function unSerialize(
    data: any,
    game: BaseGame,
    dataTypeConverter?: (val: any) => any,
): any {
    if (isObject(data) && game) {
        const result: IAnyObject = Array.isArray(data)
            ? []
            : {};

        for (const key of Object.keys(data)) {
            const value = data[key];
            if (isObject(value)) {
                result[key] = isGameObjectReference(value)
                    ? game.gameObjects[value.id] // it's a tracked game object
                    : unSerialize(value, game);
            }
            else {
                result[key] = value;
            }
        }

        return result;
    }

    if (dataTypeConverter) {
        return dataTypeConverter(data);
    }
    return data;
}

/**
 * A collection of static functions that deals with transforming game states to
 * and from serialize-able objects when communicating between client <--> sever
 */

import { IAnyObject, isEmptyExceptFor, isObject } from "~/utils";
import { SHARED_CONSTANTS } from "./constants";
import { BaseGame, BaseGameObject } from "./game/";

export type SerializableTypeName =
    "string" |
    "float" |
    "int" |
    "boolean" |
    "dictionary" |
    "list" |
    "gameObject" |
    "void";

/**
 * Checks if a given object is a game object reference (has only an id key set)
 * @param obj the object to check
 * @returns true if the object is a game object reference
 */
export function isGameObjectReference(obj: IAnyObject): boolean {
    return isEmptyExceptFor(obj, "id");
}

/**
 * Checks if the given key in an object is serializable
 * @param obj the object to check
 * @param key the key to check for within obj
 * @returns true if it is serializable, false otherwise
 */
export function isSerializable(obj: any, key: string): boolean {
    /*
    return isObject(obj) && (obj.hasOwnProperty(key) || (obj._serializableKeys && obj._serializableKeys[key]))
    && !String(key).startsWith("_") && (obj._serializableKeys === undefined || obj._serializableKeys[key]);
    */
    return false; // TODO ^
}

/**
 * Checks if the given value is an object that is an array in delta array notation
 * @param a the object to check
 * @returns true if it a delta array, false otherwise
 */
export function isDeltaArray(a: any): boolean {
    return (isObject(a) && Object.hasOwnProperty.call(a, SHARED_CONSTANTS.DELTA_LIST_LENGTH));
}

/**
 * Serializes something about a game so it is safe to send over a socket.
 * This is required to avoid cycles and send lists correctly.
 * @param state  The variable you want to serialize.
 * Anything in the game should be Serializable, numbers, strings, BaseGameObjects, dicts, lists, nulls, etc.
 * @param game the game you are serializing things for
 * @returns the state, serialized. It will never be the same object if it is an object ({} or [])
 */
export function serialize(state: any, game: BaseGame): any {
    if (!isObject(state)) {
        return state; // not an object, no need to further serialize
    }
    else if (state instanceof BaseGameObject) { // no need to serialize this whole thing
        return { id: state.id };
    }

    const serialized: IAnyObject = {};
    if (state instanceof Array) {
        // record the length, we never send arrays in serialized states because
        // you can't tell when they change in size without sending all the elements
        serialized[SHARED_CONSTANTS.DELTA_LIST_LENGTH] = state.length;
    }

    for (const key of Object.keys(serialized)) {
        if (isSerializable(state, key)) {
            const value = state[key];
            if (isObject(value)) {
                serialized[key] = serialize(value, game || state);
            }
            else {
                serialized[key] = value;
            }
        }
        // else it is not Serializable, so skip it and look at the next key
    }

    return serialized;
}

/**
 * un-serializes data from a game client
 *
 * @param data the data to un-serialize
 * @param game the game to lookup game objects in for game object references in data
 * @param dataTypeConverter the function to convert the un-serialized value once found
 * @returns the data now un-serialized, will create new objects instead of reusing objects
 */
export function unSerialize(data: any, game: BaseGame, dataTypeConverter?: (val: any) => any): any {
    if (isObject(data) && game) {
        const result: IAnyObject = Array.isArray(data)
            ? []
            : {};

        for (const key of Object.keys(data)) {
            const value = data[key];
            if (isObject(value)) {
                if (isGameObjectReference(value)) { // it's a tracked game object
                    result[key] = game.gameObjects[value.id];
                }
                else {
                    result[key] = unSerialize(value, game);
                }
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

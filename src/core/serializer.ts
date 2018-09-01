/**
 * A collection of static functions that deals with transforming game states to
 * and from serialize-able objects when communicating between client <--> sever
 */

import { isEmptyExceptFor, isObject,
         ITypedObject, mapToObject, UnknownObject } from "~/utils";
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

/** Base types that are serializable */
type BaseSerializable =
    string |
    boolean |
    BaseGameObject |
    null |
    undefined
;

/** All seriabliable types */
type Serializable =
    BaseSerializable |
    ITypedObject<BaseSerializable> |
    Map<string, BaseSerializable> |
    BaseSerializable[]
;

/** Base types that are serialized to */
type BaseSerialized =
    string |
    number |
    boolean |
    null |
    undefined
;

/** All types that are serialized to */
type Serialized =
    BaseSerialized |
    BaseSerialized[] |
    ITypedObject<BaseSerialized>
;

/**
 * Checks if a given object is a game object reference (has only an id key set).
 *
 * @param obj - The object to check.
 * @returns True if the object is a game object reference
 */
export function isGameObjectReference(
    obj: UnknownObject,
): obj is { id: string } {
    return isEmptyExceptFor(obj, "id");
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
export function serialize(state: unknown): Serialized {
    let serializing = state;
    if (!isObject(serializing)) {
        // not an object, no need to further serialize
        return serializing as BaseSerialized;
    }
    else if (serializing instanceof BaseGameObject) {
        // no need to serialize this whole thing
        return { id: serializing.id };
    }

    if (serializing instanceof Map) {
        serializing = mapToObject(serializing);
    }

    const serialized: UnknownObject = {};
    if (serializing instanceof Array) {
        // Record the length, we never send arrays in serialized states because
        // you can't tell when they change in size without sending all the
        // elements.
        serialized[SHARED_CONSTANTS.DELTA_LIST_LENGTH] = serializing.length;
    }

    for (const [key, value] of Object.entries(serializing as UnknownObject)) {
        serialized[key] = serialize(value);
    }

    return serialized as {}; // it is actually ITypedObject<Serialized> but that gets mad
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
export function unSerialize<T = Serializable>(
    data: unknown,
    game: BaseGame,
    dataTypeConverter?: (val: unknown) => T,
): T {
    if (isObject(data) && game) {
        const result: UnknownObject = Array.isArray(data)
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

        return result as T;
    }

    if (dataTypeConverter) {
        return dataTypeConverter(data);
    }

    return data as T; // it is a primitive, which are serializeable
}

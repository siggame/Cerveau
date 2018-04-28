import { logger } from "~/core/log";
import { isObject, ITypedObject } from "~/utils";
import { BaseGameObject } from "./game/base/base-game-object";

// Max/Min true int32 values for most programming languages.
const INT_MAX = 2147483647;
const INT_MIN = -2147483648;

/** The various types we can sanitize. */
export type ISanitizableType = ISanitizableTypePrimitive
                             | ISanitizableTypeList
                             | ISanitizableTypeDictionary
                             | ISanitizableTypeGameObject;

/** Primitive types we can sanitize. */
export interface ISanitizableTypePrimitive {
    typeName: "string" | "float" | "int" | "boolean" | "void";
}

/** A list (array) that can be sanitized. */
export interface ISanitizableTypeList {
    typeName: "list";
    valueType: ISanitizableType;
}

/** A dictionary (object/map) that can be sanitized. */
export interface ISanitizableTypeDictionary {
    typeName: "dictionary";
    valueType: ISanitizableType;
    keyType: ISanitizableType;
}

/** A game object in a game that can be sanitized. */
export interface ISanitizableTypeGameObject {
    typeName: "gameObject";
    gameObjectClass: typeof BaseGameObject;
}

/**
 * Takes a variable and tries to cast it to a boolean.
 *
 * @param b - Any variable to try to cast to a boolean,
 * for example "TruE" will be `true`.
 * @returns A boolean that represents what was sent.
 */
export function defaultBoolean(b: any): boolean {
    switch (typeof(b)) {
        case "string":
            const lowered = b.toLowerCase();
            if (lowered === "true") {
                // They sent some form of "true" as a string,
                // so make it the boolean true
                return true;
            }
            else if (lowered === "false") {
                // They sent some form of "false" as a string,
                // so make it the boolean false
                return false;
            }
            return Boolean(b);
        case "number":
            return b !== 0;
        default:
            return !!b;
    }
}

/**
 * Takes a variable and tries to cast it to a number.
 *
 * @param n Any number like variable to try to transform.
 * @returns Always returns a number, 0 is the default.
 */
export function defaultNumber(n: any): number {
    return Number(n) || 0.0;
}

/**
 * Takes a variable and tries to cast it to a integer, checking 32 bit integer
 * bounds.
 *
 * @param i Any number like variable to try to transform.
 * @returns Always returns an integer, 0 is the default.
 */
export function defaultInteger(i: any): number {
    let num = parseInt(i, 10) || 0;

    if (num > INT_MAX) {
        logger.warn(`Integer ${num} exceeds INT_MAX`);
        num = INT_MAX;
    }
    else if (num < INT_MIN) {
        logger.warn(`Integer ${num} exceeds INT_MIN`);
        num = INT_MIN;
    }

    return num;
}

/**
 * Takes a variable and tries to cast it to a string.
 *
 * @param s Any string like variable to try to transform, undefined and null
 * will be empty string.
 * @returns Always returns a string.
 */
export function defaultString(s: any): string {
    return s === undefined || s === null
        ? ""
        : String(s);
}

/**
 * Takes a variable and tries to cast it to an array
 *
 * @param a Any variable, if it is an array passes it back, otherwise returns
 * a new empty array.
 * @returns Always returns an array, if the passed in variable was not an
 * array, constructs and returns a new array.
 */
export function defaultArray<T = any>(a: T[]): T[] {
    return Array.isArray(a)
        ? a
        : [];
}

/**
 * Takes a variable and tries to cast it to an object
 * @param o Any variable, if it is an object passes it back, otherwise returns
 * a new empty object.
 * @returns Always returns an object, if the passed in variable was not an
 * object, constructs and returns a new object.
 */
export function defaultObject<T = any>(o: any): ITypedObject<T> {
    return isObject(o)
        ? o
        : {};
}

/**
 * Takes a variable and ensures it is a game object, if it is not, returns
 * undefined.
 *
 * @param o Any variable, if it is a game object passes it back, otherwise
 * returns a undefined.
 * @param gameObjectClass An optional game object class to enforce on the game
 * object.
 * @returns The passed in game object, if it is one, otherwise undefined.
 */
export function defaultGameObject(
    o: any,
    gameObjectClass?: typeof BaseGameObject,
): BaseGameObject | undefined {
    const obj = o instanceof BaseGameObject
        ? o
        : undefined;

    if (gameObjectClass) {
        return (obj && obj instanceof gameObjectClass)
            ? obj
            : undefined;
    }
    else {
        return obj;
    }
}

/**
 * Sanitizes a value to a specified type. If it does not match at all, then the
 * default value for that type is returned.
 * @param type The type to coerce to.
 * @param obj The value to coerce from.
 * @returns A value now sanitized and guaranteed to be of that type.
 */
export function sanitizeType(type: ISanitizableType, obj: any): any {
    switch (type.typeName) {
        case "void":
            return undefined;
        case "boolean":
            return defaultBoolean(obj);
        case "float":
            return defaultNumber(obj);
        case "int":
            return defaultInteger(obj);
        case "string":
            return defaultString(obj);
        case "dictionary":
            const asObj = defaultObject(obj);
            for (const key of Object.keys(asObj)) {
                asObj[key] = sanitizeType(type.valueType, asObj[key]);
            }
            return asObj;
        case "list":
            const asArray = defaultArray(obj);
            for (let i = 0; i < asArray.length; i++) {
                asArray[i] = sanitizeType(type.valueType, asArray[i]);
            }
            return asArray;
        case "gameObject": // assume game object
            return defaultGameObject(obj, type.gameObjectClass);
    }
}

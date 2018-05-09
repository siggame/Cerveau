/** An object with all values being a certain type. */
export interface ITypedObject<T = any> { [key: string]: T | undefined; }

/** An object used as a map to any values. */
export interface IAnyObject extends ITypedObject<any> {}

/** Shorthand for null or undefined. */
export type nil = null | undefined;

/**
 * Traverses down a tree like object via list of keys.
 *
 * @param obj - Tree like object with nested properties to traverse
 * @param keys - List of keys to traverse, in order
 * @returns Whatever value is at the end of the keys path
 * @throws Throws an error when a given key is not found in the object
 * traversing.
 */
export function traverse(obj: any, keys: string[]): any {
    if (typeof(obj) !== "object" || obj === null) {
        throw new Error(`obj ${obj} is not an object to traverse.`);
    }

    let o = obj;
    for (const key of keys) {
        if (Object.hasOwnProperty.call(obj, key)) {
            o = o[key];
        }
        else {
            throw new Error(`Key ${key} not found in object to traverse`);
        }
    }

    return o;
}

/**
 * Tries to cast a string to a primitive value if it looks like one.
 *
 * @param value - The value to try to cast. Will only work on strings.
 * @returns Value as a number if it appears to be a number,
 *          or value as a boolean if it appears to be 'true' or 'false',
 *          or just value back as a string.
 */
export function unstringify(
    value: string | number | boolean | null,
): string | number | boolean | null {
    if (typeof(value) === "string") {
        switch (value.toUpperCase()) { // check for booleans
            case "TRUE":
                return true;
            case "FALSE":
                return false;
            case "NULL":
                return null;
        }

        // check if number
        const asNumber = Number(value);
        if (!isNaN(asNumber)) {
            return asNumber;
        }

        // looks like a string after all
    }

    return value;
}

/**
 * Accepts an object of any key/values, and tries to unstringify each value,
 * and returns the new resulting object.
 *
 * @param obj the object to try to unstringify its children
 * @returns the un-stringified object (a new object, obj is untouched)
 */
export function unstringifyObject(
    obj: {[key: string]: string},
): {[key: string]: string | number | boolean | null} {
    const unStringified: {[key: string]: any} = {};
    for (const key of Object.keys(obj)) {
        unStringified[key] = unstringify(obj[key]);
    }

    return unStringified;
}

/**
 * Checks if the given value is an object and not null.
 *
 * @param obj - The object to check.
 * @returns True if it is an object and not null, false otherwise.
 */
export function isObject(obj: any): obj is IAnyObject {
    return (typeof(obj) === "object" && obj !== null);
}

/**
 * Checks if an object is empty (has no keys).
 *
 * @param obj - The object to check.
 * @returns True if the object is empty, false otherwise.
 */
export function isObjectEmpty(obj: IAnyObject): boolean {
    return (Object.getOwnPropertyNames(obj).length === 0);
}

/**
 * Check if an object is empty except for a single key.
 *
 * @param obj - The object to check
 * @param keys - The key(s) to check if it is the only key in that
 * (duplicates are ignored).
 * @returns True if the given object is empty except for a single key,
 * false otherwise.
 */
export function isEmptyExceptFor(
    obj: IAnyObject,
    ...keys: Array<string | number>,
): boolean {
    const keysSet = new Set(keys);
    const properties = Object.getOwnPropertyNames(obj);
    if (!isObject(obj) || properties.length !== keysSet.size) {
        return false; // it can't be empty except for the given keys
    }

    for (const property of properties) {
        if (!keysSet.delete(property)) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if a given thing is null or undefined.
 *
 * @param thing - The thing to check against.
 * @returns True if it is, false otherwise.
 */
export function isNil<T>(thing: T | undefined | null): thing is nil {
    return thing === undefined || thing === null;
}

/**
 * Checks if an object has a given property.
 *
 * @param obj - The object to check in.
 * @param property - The name of the property (key) to check for.
 * @returns True if the property is present in the object, false otherwise.
 */
export function objectHasProperty(
    obj: any,
    property: PropertyKey,
): obj is {[property: string]: any} {
    return Boolean(obj) && Object.prototype.hasOwnProperty.call(obj, property);
}

/**
 * Converts an object into a proper Map.
 *
 * @param obj - The object to convert
 * @returns A new map with the keys from obj and their values.
 */
export function objectToMap<T>(obj: {[key: string]: T}): Map<string, T> {
    const map = new Map<string, T>();
    for (const [key, value] of Object.entries(obj)) {
        map.set(key, value);
    }

    return map;
}

/**
 * Converts a Map to an object.
 *
 * @param map - The map to convert from.
 * @returns A new object with the same key/value pairs from the map.
 */
export function mapToObject<T>(
    map: Map<string, T>,
): {[key: string]: T | undefined} {
    const obj: {[key: string]: T} = {};
    for (const [key, value] of map) {
        obj[key] = value;
    }

    return obj;
}

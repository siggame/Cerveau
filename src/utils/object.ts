export interface ITypedObject<T = any> { [key: string]: T | undefined; }
// tslint:disable-next-line:no-empty-interface - because it is just key/value
export interface IAnyObject extends ITypedObject<any> {}

export type nil = null | undefined;

/**
 * Traverses down a tree like object via list of keys
 * @param obj tree like object with nested properties to traverse
 * @param keys list of keys to traverse, in order
 * @returns whatever value is at the end of the keys path
 * @throws {Error} throws an error when a given key is not found in the object traversing
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
 * Tries to cast a string to a primitive value if it looks like one
 * @param value the value to try to cast. Will only work on strings.
 * @returns value as a number if it appears to be a number,
 *          or value as a boolean if it appears to be 'true' or 'false',
 *          or just value back as a string
 */
export function unstringify(value: string | number | boolean | null): string | number | boolean | null {
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
 * and returns the new resulting object
 * @param obj the object to try to unstringify its children
 * @returns the unstringified object (a new object, obj is untouched)
 */
export function unstringifyObject(obj: {[key: string]: string}): {[key: string]: string | number | boolean | null} {
    const unstringified: {[key: string]: any} = {};
    for (const key of Object.keys(obj)) {
        unstringified[key] = unstringify(obj[key]);
    }

    return unstringified;
}

/**
 * Checks if the given value is an object and not null
 * @param obj the object to check
 * @returns true if it is an object and not null, false otherwise
 */
export function isObject(obj: any): obj is IAnyObject {
    return (typeof(obj) === "object" && obj !== null);
}

/**
 * Checks if an object is empty (has no keys)
 * @param obj the object to check
 * @returns true if the object is empty, false otherwise
 */
export function isObjectEmpty(obj: IAnyObject): boolean {
    return (Object.getOwnPropertyNames(obj).length === 0);
}

/**
 * Check if an object is empty except for a single key
 * @param obj the object to check
 * @param keys the key(s) to check if it is the only key in that (duplicates are ignored)
 * @returns true if the given object is empty except for a single key, false otherwise
 */
export function isEmptyExceptFor(obj: IAnyObject, ...keys: Array<string | number>): boolean {
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

export function isNil<T>(thing: T | undefined | null): thing is nil {
    return thing === undefined || thing === null;
}

export function objectHasProperty<T extends object>(obj: T, property: PropertyKey): obj is T {
    return Object.prototype.hasOwnProperty.call(obj, property);
}

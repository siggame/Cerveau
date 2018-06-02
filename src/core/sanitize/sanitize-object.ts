import { isObject, ITypedObject } from "~/utils";

/**
 * Takes a variable and tries to cast it to an object. If the passed in value is
 * not object-like at all, returns an Error.
 *
 * @param o Any variable, if it is an object passes it back, otherwise returns
 * a new empty object.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an object, if the passed in variable was not an
 * object, constructs and returns a new object.
 */
export function sanitizeObject<T = any>(
    o: any,
    allowError: boolean,
): ITypedObject<T> | Error;

/**
 * Takes a variable and tries to cast it to an object.
 * Always returns an object, empty by default.
 *
 * @param o Any variable, if it is an object passes it back, otherwise returns
 * a new empty object.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an object, if the passed in variable was not an
 * object, constructs and returns a new object.
 */
export function sanitizeObject<T = any>(
    o: any,
    allowError: false,
): ITypedObject<T>;

/**
 * Takes a variable and tries to cast it to an object. If the passed in value is
 * not object-like at all, returns an Error.
 *
 * @param o Any variable, if it is an object passes it back, otherwise returns
 * a new empty object.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an object, if the passed in variable was not an
 * object, constructs and returns a new object.
 */
export function sanitizeObject<T = any>(
    o: any,
    allowError: boolean = true,
): ITypedObject<T> | Error {
    return isObject(o)
        ? o
        : (allowError
            ? new Error(`'${o}' cannot be reasonable case to an Object`)
            : {}
        );
}

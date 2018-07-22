import { isObject, IUnknownObject } from "~/utils";

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
export function sanitizeObject(
    o: unknown,
    allowError: boolean,
): IUnknownObject | Error;

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
export function sanitizeObject(
    o: unknown,
    allowError: false,
): IUnknownObject;

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
export function sanitizeObject(
    o: unknown,
    allowError: boolean = true,
): IUnknownObject | Error {
    return isObject(o)
        ? o
        : (allowError
            ? new Error(`'${o}' cannot be reasonable case to an Object`)
            : {}
        );
}

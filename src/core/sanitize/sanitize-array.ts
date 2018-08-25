/**
 * Takes a variable and tries to cast it to an array. If the passed in value is
 * not array-like at all, returns an Error.
 *
 * @param a Any variable, if it is an array passes it back, otherwise returns
 * a new empty array.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an array, if the passed in variable was not an
 * array, constructs and returns a new array.
 */
export function sanitizeArray<T = unknown>(
    a: unknown,
    allowError: boolean,
): T[] | Error;

/**
 * Takes a variable and tries to cast it to an array.
 * Always returns an Array (defaults to empty).
 *
 * @param a Any variable, if it is an array passes it back, otherwise returns
 * a new empty array.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an array, if the passed in variable was not an
 * array, constructs and returns a new array.
 */
export function sanitizeArray<T = unknown>(
    a: unknown,
    allowError: false,
): T[];

/**
 * Takes a variable and tries to cast it to an array. If the passed in value is
 * not array-like at all, returns an Error.
 *
 * @param a Any variable, if it is an array passes it back, otherwise returns
 * a new empty array.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an array, if the passed in variable was not an
 * array, constructs and returns a new array.
 */
export function sanitizeArray<T = unknown>(
    a: unknown,
    allowError: boolean = true,
): T[] | Error {
    return Array.isArray(a)
        ? a
        : (allowError
            ? new Error(`'${a}' cannot be reasonable case to an Array`)
            : []
        );
}

/**
 * Takes a variable and tries to cast it to a number. If the passed in value
 * is not number-like at all, returns an Error.
 *
 * @param n - Any number like variable to try to transform.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A number, or an error if the input was not number like.
 */
export function sanitizeNumber(
    n: unknown,
    allowError: boolean,
): number | Error;

/**
 * Takes a variable and tries to cast it to a number.
 * Always returns a number.
 *
 * @param n - Any number like variable to try to transform.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A number, or an error if the input was not number like.
 */
export function sanitizeNumber(n: unknown, allowError: false): number;

/**
 * Takes a variable and tries to cast it to a number. If the passed in value
 * is not number-like at all, returns an Error.
 *
 * @param n - Any number like variable to try to transform.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A number, or an error if the input was not number like.
 */
export function sanitizeNumber(n: unknown, allowError = true): number | Error {
    const asNumber = Number(n);

    if (allowError && isNaN(asNumber)) {
        return new Error(`'${n}' cannot be reasonably cast to a number.`);
    }

    return asNumber || 0;
}

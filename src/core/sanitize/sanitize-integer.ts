// Max/Min true int32 values for most programming languages.
const INT_MAX = 2147483647;
const INT_MIN = -2147483648;

/**
 * Takes a variable and tries to cast it to a integer, checking 32 bit integer
 * bounds. If the passed in value is not int-like at all, returns an Error.
 *
 * @param i Any number like variable to try to transform.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an integer, 0 is the default.
 */
export function sanitizeInteger(
    i: unknown,
    allowError: boolean,
): number | Error;

/**
 * Takes a variable and tries to cast it to a integer, checking 32 bit integer
 * bounds. Always returns an integer number.
 *
 * @param i Any number like variable to try to transform.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an integer, 0 is the default.
 */
export function sanitizeInteger(
    i: unknown,
    allowError: false,
): number;

/**
 * Takes a variable and tries to cast it to a integer, checking 32 bit integer
 * bounds. If the passed in value is not int-like at all, returns an Error.
 *
 * @param i Any number like variable to try to transform.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns an integer, 0 is the default.
 */
export function sanitizeInteger(
    i: unknown,
    allowError: boolean = true,
): number | Error {
    const asNumber = parseInt(String(i), 10) || 0;

    if (allowError) {
        if (isNaN(asNumber)) {
            return new Error(`'${i}' cannot be reasonably cast to an integer.`);
        }

        if (asNumber > INT_MAX) {
            return new Error(`Integer ${i} exceeds INT_MAX`);
        }
        else if (asNumber < INT_MIN) {
            return new Error(`Integer ${i} exceeds INT_MIN`);
        }
    }

    return asNumber || 0;
}

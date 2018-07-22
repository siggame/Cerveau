
/**
 * Takes a variable and tries to cast it to a boolean. If the passed in value
 * is not boolean-like at all, returns an Error
 *
 * @param b - Any variable to try to cast to a boolean,
 * for example "TruE" will be `true`.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A boolean that represents what was sent, or an error if no default could be found
 */
export function sanitizeBoolean(
    b: unknown,
    allowError: boolean,
): boolean | Error;

/**
 * Takes a variable and tries to cast it to a boolean.
 * Always returns a boolean.
 *
 * @param b - Any variable to try to cast to a boolean,
 * for example "TruE" will be `true`.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A boolean that represents what was sent, or an error if no default could be found
 */
export function sanitizeBoolean(
    b: unknown,
    allowError: false,
): boolean;

/**
 * Takes a variable and tries to cast it to a boolean. If the passed in value
 * is not boolean-like at all, returns an Error
 *
 * @param b - Any variable to try to cast to a boolean,
 * for example "TruE" will be `true`.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A boolean that represents what was sent, or an error if no default could be found
 */
export function sanitizeBoolean(
    b: unknown,
    allowError: boolean = true,
): boolean | Error {
    switch (typeof b) {
        case "string":
            // we know this cast is safe, ts does not know how to follow
            // switch statements for type inferring ATM
            const lowered = (b as string).toLowerCase();
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
        case "object":
            return allowError
                ? new Error(`'${b}' is an Object and cannot be reasonably cast to a boolean`)
                : true; // true because objects are truth-y in JS
        default:
            return Boolean(b);
    }
}

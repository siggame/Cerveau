import { isObject } from "~/utils";

/**
 * Takes a variable and tries to cast it to a string. If the passed in value is
 * not string-like at all, returns an Error.
 *
 * @param s Any string like variable to try to transform, undefined and null
 * will be empty string.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns a string.
 */
export function sanitizeString(
    s: any,
    allowError: boolean,
): string | Error;

/**
 * Takes a variable and tries to cast it to a string.
 * Always returns a string.
 *
 * @param s Any string like variable to try to transform, undefined and null
 * will be empty string.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns a string.
 */
export function sanitizeString(
    s: any,
    allowError: false,
): string;

/**
 * Takes a variable and tries to cast it to a string. If the passed in value is
 * not string-like at all, returns an Error.
 *
 * @param s Any string like variable to try to transform, undefined and null
 * will be empty string.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns Always returns a string.
 */
export function sanitizeString(
    s: any,
    allowError: boolean = true,
): string | Error {
    if (allowError && isObject(s)) {
        return new Error(`'${s}' is an Object and cannot be reasonably cast to a string`);
    }

    return s === undefined || s === null
        ? ""
        : String(s);
}

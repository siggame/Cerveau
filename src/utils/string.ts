/**
 * Capitalizes the first character in a string, and no others.
 *
 * @param str The string to capitalize.
 * @returns `str` with the first character now uppercase.
 */
export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Un-capitalizes the first character in a string, and no others.
 *
 * @param str - The string to un-capitalize.
 * @returns `str` with the first character now lowercase.
 */
export function unCapitalizeFirstLetter(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Wraps a value in quotes if it is a string.
 *
 * @param arg The arg to check if it should be quoted
 * @returns The toString version of arg, wrapped in quotes if it was originally
 * a string.
 */
export function quoteIfString(arg: any): string {
    return typeof arg === "string"
        ? `"${arg}"`
        : String(arg);
}

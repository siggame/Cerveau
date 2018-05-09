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

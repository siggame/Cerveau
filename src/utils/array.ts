import { MathUtils } from "./";

/** An array with at least 1 or more items */
export type ArrayWithOneOrMore<T, K = number> = (
    [T] |
    { 0: T }
) & T[];

/**
 * Removes a matching element from the array, if present.
 *
 * @param array - The array to attempt to remove an element from.
 * @param elements - The element(s) you want to try to remove from the array.
 * @returns The number of elements removed.
 */
export function removeElements<T>(array: T[], ...elements: T[]): number {
    let removed = 0;
    for (const element of elements) {
        const index = array.indexOf(element);

        if (index > -1) {
            array.splice(index, 1);
            removed += 1;
        }
    }

    return removed;
}

/**
 * Removes a matching element from the array, if present.
 *
 * @param element - the element to remove from arrays.
 * @param arrays - The array(s) you want to try to the element from.
 * @returns The number of arrays this element was removed from.
 */
export function removeElementFrom<T>(element: T, ...arrays: T[][]): number {
    let removed = 0;
    for (const array of arrays) {
        const index = array.indexOf(element);

        if (index > -1) {
            array.splice(index, 1);
            removed += 1;
        }
    }

    return removed;
}

/**
 * Gets an element in the array wrapping around (both ways), so -1 would be the
 * last element, and length would warp to 0.
 *
 * @param array - The array to use to get items from.
 * @param index - Index to get in this array, if it is out of bounds
 * (index < 0 or index >= this.length), we will "wrap" that index around to be
 * in range.
 * @returns Element at the index, wrapped around when out of range.
 */
export function getWrapAroundAt<T>(array: T[], index: number): T {
    return array[MathUtils.wrapAround(index, array.length)];
}

/**
 * Returns the next element in the array by some offset,, wrapping around if
 * it would walk off the array.
 *
 * @param array - The array to get something in wrapping around.
 * @param element - Element in the array to find the index of.
 * @param offset - From the element's position where to move, up or down and
 * will wrap around.
 * @returns Undefined if the element was not in this array, or the
 * element at the offset from the passed in element in the array, wrapping
 * around.
 */
export function getWrapAround<T>(array: T[], element: T, offset?: number): T | undefined {
    const index = array.indexOf(element);
    if (index < 0) {
        return;
    }

    return getWrapAroundAt(array, index + (offset || 0));
}

/**
 * Convenience function to get the next element in this array after some element
 * Wrapping around if it would walk off the array.
 *
 * @see getWrapAround
 * @param array - The array to get elements in.
 * @param element - The element in the array to get the next element after
 * @returns the next element in the array after the element, or wraps to the
 * beginning if that element is the last element.
 */
export function nextWrapAround<T>(array: T[], element: T): T | undefined {
    return getWrapAround(array, element, 1);
}

/**
 * Convenience function to get the previous element in this array after some
 * element, wrapping around if it would walk off the array.
 *
 * @see getWrapAround
 * @param array - The array to get elements in.
 * @param element - The element in the array to get the previous element before
 * @returns the previous element in the array after the element, or wraps to the
 * beginning if that element is the last element
 */
export function previousWrapAround<T>(array: T[], element: T): T | undefined {
    return getWrapAround(array, element, -1);
}

/**
 * Checks if an array is empty, and notifies TypeScript that it is if so.
 *
 * @param array - The array to check if is empty.
 * @returns True if empty, false otherwise.
 */
export function isEmpty<T>(array: T[]): array is [never] {
    return array.length === 0;
}

/**
 * Checks if an array has at least 1 item
 *
 * @param array - The array to check if it has at least 1 element.
 * @returns True if not empty, otherwise false when empty.
 */
export function arrayHasElements<T>(array: T[]): array is ArrayWithOneOrMore<T> {
    return array.length > 0;
}

/**
 * Shuffles this array randomly IN PLACE.
 *
 * @param array - The array to shuffle IN PLACE.
 * @param rng - A callback that is a random number generator,
 * must generate numbers [0, 1).
 * @returns This array.
 */
export function shuffle<T>(array: T[], rng: () => number): T[] {
    // from http://stackoverflow.com/a/6274381/944727
    for (
        let j, x, i = array.length; i;
        // tslint:disable-next-line ban-comma-operator
        j = Math.floor(rng() * i), x = array[--i], array[i] = array[j], array[j] = x
    ) { /* pass */ }

    return array;
}

/**
 * Creates a 2D array (array of arrays).
 *
 * @param width - The width of the [first] array.
 * @param height - The height of the [second] arrays in the first.
 * @returns A 2D array, all empty.
 */
export function make2D<T>(width: number, height: number): Array<Array<T | undefined>> {
    const array = new Array<Array<T | undefined>>(width);
    for (let i = 0; i < array.length; i++) {
        array[i] = new Array<T | undefined>(height);
    }

    return array;
}

/**
 * Filters an array IN PLACE, as opposed to returning a new array.
 *
 * @param array - The array to filter, it will be mutated.
 * @param filter - The filter function, return true on elements to keep.
 */
export function filterInPlace<T>(array: T[], filter: (element: T) => boolean): void {
    const filtered = array.filter(filter);
    array.length = filtered.length;
    for (let i = 0; i < filtered.length; i++) {
        array[i] = filtered[i];
    }
}

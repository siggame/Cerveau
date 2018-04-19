import { MathUtils } from "./";

/**
 * removes a matching element from the array, if present
 * @param array - the array to attempt to remove an element from
 * @param elements - the element(s) you want to try to remove from the array
 * @returns the number of elements removed
 */
export function removeElements<T>(array: T[], ...elements: T[]): number {
    let removed = 0;
    for (const element of elements) {
        const index = array.indexOf(element);

        if (index > -1) {
            array.splice(index, 1);
            removed++;
        }
    }

    return removed;
}

/**
 * pushes elements into the array only if they are not already present
 * @param array the array to push elements into
 * @param elements to try to push.
 * @returns new length of this array
 */
export function pushIfAbsent<T>(array: T[], ...elements: T[]): number {
    return array.push(...elements.filter((e) => !array.includes(e)));
}

/**
 * gets an element in the array wrapping around (both ways), so -1 would be the
 * last element, and length would warp to 0.
 *
 * @param array the array to use to get items from
 * @param index - index to get in this array, if it is out of bounds
 * (index < 0 or index >= this.length), we will "wrap" that index around to be
 * in range
 * @returns element at the index, wrapped around when out of range
 */
export function getWrapAroundAt<T>(array: T[], index: number): T {
    return array[MathUtils.wrapAround(index, array.length)];
}

/**
 * returns the next element in the array by some offset,, wrapping around if it would walk off the array
 *
 * @param array the array to get something in wrapping around
 * @param element - element in the array to find the index of
 * @param offset - from the element's position where to move, up or down and will wrap around
 * @returns undefined if the element was not in this array, or the
 * element at the offset from the passed in element in the array, wrapping
 * around
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
 * Wrapping around if it would walk off the array
 *
 * @see getWrapAround
 * @param array the array to get elements in
 * @param element the element in the array to get the next element after
 * @returns the next element in the array after the element, or wraps to the
 * beginning if that element is the last element
 */
export function nextWrapAround<T>(array: T[], element: T): T | undefined {
    return getWrapAround(array, element, 1);
}

/**
 * Convenience function to get the previous element in this array after some
 * element, wrapping around if it would walk off the array
 *
 * @see getWrapAround
 * @param array the array to get elements in
 * @param element the element in the array to get the previous element before
 * @returns the previous element in the array after the element, or wraps to the
 * beginning if that element is the last element
 */
export function previousWrapAround<T>(array: T[], element: T): T | undefined {
    return getWrapAround(array, element, -1);
}

export function lastElementOf<T>(array: T[]): T {
    return array[array.length - 1];
}

/**
 * Checks if an array is empty, and notifies TypeScript that it is if so
 * @param array the array to check if is empty
 * @returns true if empty, false otherwise
 */
export function isEmpty<T>(array: T[]): array is [never] {
    return array.length === 0;
}

/**
 * shuffles this array randomly IN PLACE
 *
 * @param array the array to shuffle IN PLACE
 * @param rng an optional callback that is a random number generator, must generate numbers [0, 1)
 * @returns this array
 */
export function shuffle<T>(array: T[], rng?: () => number): T[] { // from http://stackoverflow.com/a/6274381/944727
    rng = rng || Math.random;
    for (
        let j, x, i = array.length; i;
        j = Math.floor(rng() * i), x = array[--i], array[i] = array[j], array[j] = x
    ) {
        //
    }
    return array;
}

/**
 * Creates a 2D array (array of arrays).
 * @param width The width of the [first] array.
 * @param height The height of the [second] arrays in the first.
 * @returns a 2D array, all empty.
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
 * @param array The array to filter, it will be mutated.
 * @param filter The filter function, return true on elements to keep.
 */
export function filterInPlace<T>(array: T[], filter: (element: T) => boolean): void {
    const filtered = array.filter(filter);
    array.length = filtered.length;
    for (let i = 0; i < filtered.length; i++) {
        array[i] = filtered[i];
    }
}

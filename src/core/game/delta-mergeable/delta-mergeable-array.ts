/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// ^ as DeltaMergeables are black magic anyways

import { SHARED_CONSTANTS } from "~/core/constants";
import { SanitizableType } from "~/core/sanitize/sanitizable-interfaces";
import { Immutable } from "~/utils";
import { createDeltaMergeable } from "./create-delta-mergeable";
import { DeltaMergeable } from "./delta-mergeable";
import { DeltaMergeableWrapped } from "./delta-mergeable-wrapped";

/**
 * Overrides of build-in array methods to be type safe at run time.
 */
class DeltaArray<T> extends Array<T> {
    /**
     * Inserts new elements at the start of an array.
     *
     * NOTE: This is overrides because the Node.js implementation clears
     * out the array while unshifting. However our arrays can never have
     * undefined set (which they are temporarily here), so it produces errors.
     *
     * This implementation below is less efficient, however it ensures an index
     * is never undefined, to maintain type safety at all times.
     *
     * @param items -  Elements to insert at the start of the Array.
     * @returns The new length of the array.
     */
    public unshift(...items: T[]): number {
        const newThis = [...items, ...this];
        const newLength = newThis.length;

        for (let i = 0; i < newLength; i++) {
            if (i < this.length) {
                this[i] = newThis[i];
            } else {
                this.push(newThis[i]);
            }
        }

        return newLength;
    }
}

/**
 * Creates a DeltaMergeable for an Array with a Proxy wrapper.
 *
 * @param args - The creation args.
 * @param args.key - The key of this array in its parent delta mergable.
 * @param args.childType - The type of all children in this Array.
 * @param args.parent - The parent of this node.
 * @param args.initialValue
 * @returns A new DeltaMergeable wrapping an Array.
 */
export function createArray<T = any>(args: {
    /** The key of this array in its parent delta mergable. */
    key: string;
    /** The type of all children in this Array. */
    childType: Immutable<SanitizableType>;
    /** The parent of this node. */
    parent?: DeltaMergeable;
    /** The initial value of the array */
    initialValue?: T[];
}): DeltaMergeable<T[]> {
    let oldLength = 0;
    const array: T[] = new DeltaArray();
    const values = new Array<DeltaMergeable<T>>();
    const wrapper = { creating: true };
    const container = new DeltaMergeableWrapped<T[]>({
        key: args.key,
        parent: args.parent,
        initialValue: array,
        transform: (newArray: T[] | undefined) => {
            if (wrapper.creating) {
                return array;
            }

            const copyFrom = newArray || [];
            const currentValue = container.wrapper as T[];

            // We won't allow people to re-set this array,
            // instead we will mutate the current array to match `newArray`
            currentValue.length = copyFrom.length;
            for (let i = 0; i < copyFrom.length; i++) {
                currentValue[i] = copyFrom[i];
            }

            return array;
        },
    });
    wrapper.creating = false;

    const lengthDeltaMergeable = new DeltaMergeable<number>({
        key: SHARED_CONSTANTS.DELTA_LIST_LENGTH,
        parent: container,
        initialValue: 0,
    });

    /**
     * Checks if the array was Delta updated given an index.
     *
     * @param index - Index in the array updated.
     * @param value - The value at that index updated to.
     */
    function checkIfUpdated(index?: number, value?: T): void {
        let newLength = array.length;
        if (
            index !== undefined &&
            (index >= oldLength || index >= array.length)
        ) {
            newLength = index + 1;
        }

        if (newLength !== oldLength) {
            if (newLength > oldLength) {
                // The array grew in size, so we need some new delta mergeables

                for (let i = oldLength; i < newLength; i++) {
                    const currentValue = i === index ? value : undefined;

                    if (values[i]) {
                        container.adopt(values[i]);
                        values[i].set(currentValue, true);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        values[i] = createDeltaMergeable({
                            key: String(i),
                            parent: container,
                            type: args.childType,
                            initialValue: currentValue,
                        });
                    }

                    array[i] = values[i].get()!;
                }
            } else {
                // newLength < oldLength
                for (let i = newLength; i < oldLength; i++) {
                    values[i].delete();
                }
            }
        }
        oldLength = array.length;
        lengthDeltaMergeable.set(oldLength);
    }

    const proxyArray = new Proxy(array, {
        set(target: T[], property: string | number, value: T): boolean {
            const index = Number(property);
            if (isNaN(index)) {
                if (property === "length") {
                    Reflect.set(target, property, value);
                    checkIfUpdated();

                    return true;
                }

                // All other strings are not able to be set on arrays
                return false;
            }

            // If we got here, we know that the property being set is an index
            checkIfUpdated(index, value);
            values[index].set(value);
            Reflect.set(target, property, values[index].get());

            return true;
        },
        deleteProperty(target: T[], property: string | number): boolean {
            const index = Number(property);

            if (isNaN(index)) {
                return false; // arrays can only delete numbers, not strings
            }

            values[index].delete();
            Reflect.deleteProperty(target, property);

            return true;
        },
    });

    container.wrapper = proxyArray;

    if (args.initialValue) {
        container.set(args.initialValue);
    }

    return container;
}

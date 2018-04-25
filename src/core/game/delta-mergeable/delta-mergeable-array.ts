import { SHARED_CONSTANTS } from "~/core/constants";
import { ISanitizableType } from "~/core/type-sanitizer";
import { createDeltaMergeable } from "./create-delta-mergeable";
import { DeltaMergeable } from "./delta-mergeable";

/**
 * Creates a DeltaMergeable for an Array with a Proxy wrapper.
 * @param args - The creation args
 * @returns A new DeltaMergeable wrapping an Array.
 */
export function createArray<T = any>(args: {
    key: string;
    childType: ISanitizableType;
    parent?: DeltaMergeable;
}): DeltaMergeable<T[]> {
    let oldLength = 0;
    const array: T[] = [];
    const values = new Array<DeltaMergeable<T>>();
    const container = new DeltaMergeable<T[]>({
        key: args.key,
        parent: args.parent,
        initialValue: array,
        transform: (newArray: T[] | undefined, currentValue) => {
            newArray = newArray || [];
            // We won't allow people to re-set this array,
            // instead we will mutate the current array to match `newArray`
            for (let i = 0; i < newArray.length; i++) {
                currentValue![i] = newArray[i];
            }
            currentValue!.length = newArray.length;
            return currentValue;
        },
    });

    const lengthDeltaMergeable = new DeltaMergeable<number>({
        key: SHARED_CONSTANTS.DELTA_LIST_LENGTH,
        parent: container,
        initialValue: 0,
    });

    function checkIfUpdated(index?: number, value?: T): void {
        let newLength = array.length;

        if (index !== undefined && (
            index >= oldLength || index >= array.length
        )) {
            newLength = index + 1;
        }

        if (newLength !== oldLength) {
            if (newLength > oldLength) {
                // The array grew in size, so we need some new delta mergeables

                for (let i = oldLength; i < newLength; i++) {
                    const currentValue = i === index ? value : undefined;

                    if (values[i]) {
                        container.adopt(values[i]);
                        values[i].set(currentValue);
                    }
                    else {
                        values[i] = createDeltaMergeable({
                            key: String(i),
                            parent: container,
                            type: args.childType,
                            initialValue: currentValue,
                        });
                    }

                    array[i] = values[i].get()!;
                }
            }
            else { // newLength < oldLength
                for (let i = newLength; i >= oldLength; i--) {
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

    return container;
}

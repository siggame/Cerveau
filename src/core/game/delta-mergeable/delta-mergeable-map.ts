/*
mport { ISanitizableType } from "src/core/type-sanitizer";
import { IAnyObject, ITypedObject } from "src/utils";
import { createDeltaMergeable } from "./create-delta-mergeable";
import { DeltaMergeable } from "./delta-mergeable";

export class DeltaMergeableMap<V> extends Map<string, V> {
    private readonly container: DeltaMergeable<IAnyObject>;
    private readonly children: ITypedObject<DeltaMergeable<V>> = {};
    private readonly childCache: ITypedObject<DeltaMergeable<V>> = {};

    constructor(
        key: string,
        private readonly valueType: ISanitizableType,
        parent?: DeltaMergeable,
    ) {
        super();

        this.container = new DeltaMergeable({
            key,
            parent,
            transform: (newMap: Map<string, V>, currentValue) => {
                // we won't allow people to re-set this array,
                // instead we will mutate the current array to match `newArray`
                currentValueblagr
                for (const [key, value] of newMap.entries) {
                    currentValue![i] = newArray[i];
                }
                currentValue!.length = newArray.length;
                return currentValue;
            },
        });
    }

    public set(key: string, value: V): this {
        let child = this.children[key];

        if (!child) {
            // we do not have this key as an active child, check the cache
            child = this.childCache[key];
            if (child) {
                // we are re-using a delta mergeable from the cache
                this.container.adopt(child);
            }
            else {
                // we've never seen this key, so make a delta mergeable for it
                child = createDeltaMergeable({
                    key,
                    parent: this.container,
                    type: this.valueType,
                });

                this.childCache[key] = child;
            }

            this.children[key] = child;
        }

        child.set(value);

        return super.set(key, child.get()!);
    }

    public delete(key: string): boolean {
        if (this.has(key)) {
            const child = this.container.child(String(key))!; // TODO: type K is basically always strings at this point

            child.delete();
        }
        return super.delete(key);
    }
}

export function createMap<V>(
    key: string,
    valueType: ISanitizableType,
    parent?: DeltaMergeable,
): Map<string, V> {
    return new DeltaMergeableMap<V>(key, valueType, parent);
}
*/

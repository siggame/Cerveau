// tslint:disable:no-any no-unsafe-any no-non-null-assertion
// ^ as DeltaMergeables are black magic anyways

import { ISanitizableType } from "~/core/sanitize/sanitizable-interfaces";
import { Immutable, TypedObject, UnknownObject } from "~/utils";
import { createDeltaMergeable } from "./create-delta-mergeable";
import { DeltaMergeable, DeltaTransform } from "./delta-mergeable";

/**
 * Creates a DeltaMergeable for an Object with a Proxy wrapper.
 * @param args - The creation args
 * @returns A new DeltaMergeable wrapping an Object.
 */
export function createObject(args: Readonly<{
    key: string;
    initialValue?: any;
    parent?: DeltaMergeable;
    childTypes?: Immutable<TypedObject<ISanitizableType>>;
    childType?: Immutable<ISanitizableType>;
    transform?: DeltaTransform<object>;
}>): DeltaMergeable<UnknownObject> {
    const deltaMergeables: TypedObject<DeltaMergeable> = {};
    const container = new DeltaMergeable<object>({
        key: args.key,
        parent: args.parent,
        initialValue: args.initialValue || {},
        transform: args.transform || ((newObj?: any, currentValue?: UnknownObject): UnknownObject => {
            const copyFrom = newObj || {};

            const keys = new Set(Object.keys(copyFrom || {}).concat(Object.keys(currentValue || {})));
            for (const key of keys) {
                if (!Object.prototype.hasOwnProperty.call(copyFrom, key)) {
                    if (Object.prototype.hasOwnProperty.call(currentValue, key)) {
                        delete currentValue![key];
                    }
                }
                else {
                    if (!Object.prototype.hasOwnProperty.call(currentValue, key)) {
                        currentValue![key] = copyFrom[key];
                    }
                }
            }

            return currentValue!;
        }),
    });

    const proxyObject = new Proxy({}, {
        set(target: UnknownObject, property: string, value: any): boolean {
            const newKey = !Object.prototype.hasOwnProperty.call(deltaMergeables, property);
            if (newKey) {
                // then we need to create this new child we've never seen before

                let type: ISanitizableType | undefined;
                if (args.childTypes && Object.prototype.hasOwnProperty.call(args.childTypes, property)) {
                    type = args.childTypes[property] as ISanitizableType;
                }
                else if (args.childType) {
                    type = args.childType as ISanitizableType;
                }

                if (!type) {
                    throw new Error(`Cannot set property ${property} of ${target} because it is an unknown type`);
                }

                deltaMergeables[property] = createDeltaMergeable({
                    key: property,
                    type,
                    initialValue: value,
                    parent: container,
                });
            }

            if (!deltaMergeables[property]!.getParent() || deltaMergeables[property]!.get() !== value) {
                deltaMergeables[property]!.set(value, newKey);
            }

            return Reflect.set(target, property, deltaMergeables[property]!.get());
        },
        deleteProperty(target: UnknownObject, property: string): boolean {
            if (!Object.prototype.hasOwnProperty.call(deltaMergeables, property)) {
                return false;
            }

            deltaMergeables[property]!.delete();

            Reflect.deleteProperty(target, property);

            return true;
        },
    });

    container.wrapper = proxyObject;

    return container;
}

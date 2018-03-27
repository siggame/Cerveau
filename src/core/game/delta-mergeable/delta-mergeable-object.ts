import { ISanitizableType } from "src/core/type-sanitizer";
import { IAnyObject, ITypedObject } from "src/utils";
import { createDeltaMergeable } from "./create-delta-mergeable";
import { DeltaMergeable } from "./delta-mergeable";

export function createObject(args: {
    key: string,
    parent?: DeltaMergeable,
    childTypes?: ITypedObject<ISanitizableType>,
    childType?: ISanitizableType,
    transform?: (val?: any, currentVal?: any) => any,
}): DeltaMergeable<IAnyObject> {
    const deltaMergeables: ITypedObject<DeltaMergeable> = {};
    const container = new DeltaMergeable<object>({
        key: args.key,
        parent: args.parent,
        initialValue: {},
        transform: args.transform || ((newObj?: any, currentValue?: IAnyObject): IAnyObject => {
            if (!newObj) {
                newObj = {};
            }

            const keys = new Set(Object.keys(newObj || {}).concat(Object.keys(currentValue || {})));
            for (const key of keys) {
                if (!Object.prototype.hasOwnProperty.call(newObj, key)) {
                    if (Object.prototype.hasOwnProperty.call(currentValue, key)) {
                        delete currentValue![key];
                    }
                }
                else {
                    if (!Object.prototype.hasOwnProperty.call(currentValue, key)) {
                        currentValue![key] = newObj[key];
                    }
                }
            }
            return currentValue!;
        }),
    });

    const proxyObject = new Proxy({}, {
        set(target: IAnyObject, property: string, value: any): boolean {
            if (!Object.prototype.hasOwnProperty.call(deltaMergeables, property)) {
                // then we need to create this new child we've never seen before

                let type: ISanitizableType | undefined;
                if (args.childTypes && Object.prototype.hasOwnProperty.call(args.childTypes, property)) {
                    type = args.childTypes[property];
                }
                else if (args.childType) {
                    type = args.childType;
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
                deltaMergeables[property]!.set(value);
            }

            return Reflect.set(target, property, deltaMergeables[property]!.get());
        },
        deleteProperty(target: IAnyObject, property: string): boolean {
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

import { createDeltaMergeable, DeltaMergeable } from "~/core/game/delta-mergeable";
import { ISanitizableType } from "~/core/type-sanitizer";
import { IAnyObject, ITypedObject } from "~/utils";

export class BaseGameDeltaMergeables {
    private readonly deltaMergeable: DeltaMergeable;

    constructor(args: {
        key: string;
        parent?: DeltaMergeable;
        attributesSchema: ITypedObject<ISanitizableType>;
        initialValues: IAnyObject;
    }) {
        this.deltaMergeable = createDeltaMergeable({
            key: args.key,
            initialValue: this,
            parent: args.parent,
            childTypes: args.attributesSchema,
            type: {
                typeName: "gameObject",
                gameObjectClass: Object.getPrototypeOf(this).constructor,
            },
        });

        // setup initial values
        for (const key of Object.keys(args.attributesSchema)) {
            const initialValue = Object.prototype.hasOwnProperty.call(args.initialValues, key)
                ? args.initialValues[key]
                : undefined; // else they send us some key/value pair that is not a child delta mergeable we care about

            (this.deltaMergeable.wrapper as any)[key] = initialValue;
        }

        for (const property of Object.keys(args.attributesSchema)) {
            Object.defineProperty(this, property, {
                enumerable: true, // show up in for of loops
                configurable: false, // can't be deleted
                // writable: true, // allow reassignment DOES NOT WORK WITH GETTER/SETTERS
                get: () => this.deltaMergeable.child(property)!.get(),
                set: (val: any) => this.deltaMergeable.child(property)!.set(val),
            });
        }
    }
}

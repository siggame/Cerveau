import { createDeltaMergeable, DeltaMergeable } from "~/core/game/delta-mergeable";
import { ISanitizableType } from "~/core/type-sanitizer";
import { IAnyObject, ITypedObject, objectHasProperty } from "~/utils";

/**
 * The base class all delta mergeable instances in (and of) the game inherit
 * from.
 */
export class BaseGameDeltaMergeables {
    /** Our actual DeltaMergeable instance */
    private readonly deltaMergeable: DeltaMergeable;

    /**
     * Initializes our delta mergeable, and sets any initial values.
     * @param args - The data needed to hookup our DeltaMergeable.
     */
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
                nullable: false,
            },
        });

        // setup initial values
        for (const key of Object.keys(args.attributesSchema)) {
            const initialValue = objectHasProperty(args.initialValues, key)
                ? args.initialValues[key]
                : undefined; // Else they send us some key/value pair that is
                             // not a child delta mergeable we care about.

            (this.deltaMergeable.wrapper as any)[key] = initialValue;
        }

        for (const [property, schema] of Object.entries(args.attributesSchema)) {
            const dm = this.deltaMergeable.child(property)!;

            Object.defineProperty(this, property, {
                enumerable: true, // Show up in for of loops
                configurable: false, // Can't be deleted
                get: schema!.typeName === "list" // Lists are behind Proxies
                    ? () => dm.wrapper
                    : () => dm.get(),
                set: (val: any) => dm.set(val),
            });
        }
    }
}

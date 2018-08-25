import { createDeltaMergeable, DeltaMergeable } from "~/core/game/delta-mergeable";
import { ISanitizableType } from "~/core/sanitize/sanitizable-interfaces";
import { ITypedObject, objectHasProperty, UnknownObject } from "~/utils";

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
        initialValues: UnknownObject;
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
        for (const [ key, schema ] of Object.entries(args.attributesSchema)) {
            if (!schema) {
                throw new Error(`Schema must exist for property ${key}`);
            }

            let initialValue = objectHasProperty(schema, "defaultValue")
                // TODO: objectHasProperty should infer this
                ? (schema as ISanitizableType & { defaultValue: unknown }).defaultValue
                : undefined;

            if (objectHasProperty(args.initialValues, key)) {
                initialValue = args.initialValues[key];
            }

            const dm = this.deltaMergeable.child(key);
            if (dm) {
                dm.set(initialValue, true);
            }
            else {
                (this.deltaMergeable.wrapper as UnknownObject)[key] = initialValue;
            }
        }

        for (const [property, schema] of Object.entries(args.attributesSchema)) {
            const dm = this.deltaMergeable.child(property);

            if (!dm || !schema) {
                throw new Error(`Delta mergeable attribute expected for ${property}!`);
            }

            Object.defineProperty(this, property, {
                enumerable: true, // Show up in for of loops
                configurable: false, // Can't be deleted
                get: schema.typeName === "list" // Lists are behind Proxies
                    ? () => dm.wrapper
                    : () => dm.get(),
                set: (val: unknown) => dm.set(val),
            });
        }
    }
}

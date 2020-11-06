import {
    createDeltaMergeable,
    DeltaMergeable,
} from "~/core/game/delta-mergeable";
import { SanitizableType } from "~/core/sanitize/sanitizable-interfaces";
import {
    Immutable,
    objectHasProperty,
    TypedObject,
    UnknownObject,
} from "~/utils";

/**
 * The base class all delta mergeable instances in (and of) the game inherit
 * from.
 */
export class BaseGameDeltaMergeables {
    /** Our actual DeltaMergeable instance. */
    private readonly deltaMergeable: DeltaMergeable;

    /**
     * Initializes our delta mergeable, and sets any initial values.
     *
     * @param args - The data needed to hookup our DeltaMergeable.
     * @param args.key - The key representing this node.
     * @param args.parent - The parent delta mergable, if null then this is the root.
     * @param args.attributesSchema - Schema about the attributes to follow for this entry.
     * @param args.initialValues - Initial value(s) to set to upon creation.
     */
    constructor(args: {
        /** The key representing this node. */
        key: string;
        /** The parent delta mergable, if null then this is the root. */
        parent?: DeltaMergeable; // will mutate as it gets a new child
        /** Schema about the attributes to follow for this entry. */
        attributesSchema: Immutable<TypedObject<SanitizableType>>;
        /** Initial value(s) to set to upon creation. */
        initialValues: Immutable<{ [key: string]: unknown }>;
    }) {
        this.deltaMergeable = createDeltaMergeable({
            key: args.key,
            initialValue: this,
            parent: args.parent,
            childTypes: args.attributesSchema,
            type: {
                typeName: "gameObject",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                gameObjectClass: Object.getPrototypeOf(this).constructor,
                nullable: false,
            },
        });

        // setup initial values
        for (const [key, schema] of Object.entries(args.attributesSchema)) {
            if (!schema) {
                throw new Error(`Schema must exist for property ${key}`);
            }

            let initialValue = objectHasProperty(schema, "defaultValue")
                ? schema.defaultValue
                : undefined;

            if (objectHasProperty(args.initialValues, key)) {
                initialValue = args.initialValues[key];
            }

            const dm = this.deltaMergeable.child(key);
            if (dm) {
                dm.set(initialValue, true);
            } else {
                (this.deltaMergeable.wrapper as UnknownObject)[
                    key
                ] = initialValue;
            }
        }

        for (const [property, schema] of Object.entries(
            args.attributesSchema,
        )) {
            const dm = this.deltaMergeable.child(property);

            if (!dm || !schema) {
                throw new Error(
                    `Delta mergeable attribute expected for ${property}!`,
                );
            }

            Object.defineProperty(this, property, {
                enumerable: true, // Show up in for of loops
                configurable: false, // Can't be deleted
                get:
                    schema.typeName === "list" // Lists are behind Proxies
                        ? () => dm.wrapper
                        : // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                          () => dm.get(),
                set: (val: unknown) => {
                    dm.set(val);
                },
            });
        }
    }
}

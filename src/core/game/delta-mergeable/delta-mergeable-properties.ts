import { ISanitizableType, sanitizeType } from "src/core/type-sanitizer";
import { IAnyObject, ITypedObject } from "src/utils";
import { DeltaMergeable } from "./delta-mergeable";

// tslint:disable:variable-name
// we need to underscore these variables to prevent collisions with sub classes

/**
 * A class that has a collection of delta mergeable properties
 */
export class DeltaMergeableProperties {
    /**
     * The mapping of string (property names) to their delta mergeable
     * NOTE: it is marked private, but that is because it should not be used
     * outside of Creer written code
     */
    private _properties: ITypedObject<DeltaMergeable> = {};

    constructor(args: {
        parent: DeltaMergeable;
        accessor: object;
        schema: ITypedObject<ISanitizableType>;
        initialValues?: IAnyObject;
    }) {
        for (const key of Object.keys(args.schema)) {
            const type = args.schema[key]!;
            // let initialValue: any;

            // TODO: if the initial value is a container type (array, dict) then
            // we need to build a delta mergeable type of that to proxy it
            if (type.typeName === "list") {
                // pass?
            }
            else {
                sanitizeType(type, args.initialValues && args.initialValues[key]);
            }

            this._properties[key] = new DeltaMergeable({
                key,
                // initialValue, // default value for that type
                transform: (val) => sanitizeType(type, val),
            });

            Object.defineProperty(this, key, {
                enumerable: true, // show up in for of loops
                configurable: false, // can't be deleted
                // writable: true, // allow reassignment
                get: () => this._properties[key]!.get(),
                set: (val: any) => this._properties[key]!.set(val),
            });
        }
    }
}

import { ISanitizableType, sanitizeType } from "~/core/type-sanitizer";
import { ITypedObject } from "~/utils";
import { DeltaMergeable } from "./delta-mergeable";
import { createArray } from "./delta-mergeable-array";
import { createObject } from "./delta-mergeable-object";
import { validateDeltaMergeable } from "./validate-delta-mergeable";

/**
 * Creates a delta mergeable given a type.
 * @param args - The data about the delta mergeable to create
 * @returns A newly created DeltaMergeable instance of the given type.
 */
export function createDeltaMergeable(args: {
    key: string;
    type: ISanitizableType;
    childTypes?: ITypedObject<ISanitizableType>;
    parent?: DeltaMergeable;
    initialValue?: any;
}): DeltaMergeable {
    const validate = validateDeltaMergeable[args.type.typeName];
    switch (args.type.typeName) {
        case "list":
            return createArray({
                key: args.key,
                parent: args.parent,
                childType: args.type.valueType,
                validate: validate({}),
            });
        case "dictionary":
            return createObject({
                key: args.key,
                parent: args.parent,
                childType: args.type.valueType,
                validate: validate({}),
            });
        case "gameObject":
            return createObject({
                key: args.key,
                initialValue: args.initialValue,
                parent: args.parent,
                childTypes: args.childTypes,
                transform: (val) => sanitizeType(args.type, val),
                validate: validate({
                    nullable: args.type.nullable,
                    gameObjectClass: args.type.gameObjectClass,
                }),
            });
        default:
            return new DeltaMergeable({
                key: args.key,
                initialValue: args.initialValue,
                parent: args.parent,
                transform: (val) => sanitizeType(args.type, val),
                validate: validate({ literals: args.type.literals }),
            });
    }
}

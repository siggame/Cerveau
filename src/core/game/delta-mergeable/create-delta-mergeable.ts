import { ISanitizableType, sanitizeType } from "~/core/type-sanitizer";
import { ITypedObject } from "~/utils";
import { DeltaMergeable } from "./delta-mergeable";
import { createArray } from "./delta-mergeable-array";
import { createObject } from "./delta-mergeable-object";

export function createDeltaMergeable(args: {
    key: string;
    type: ISanitizableType;
    childTypes?: ITypedObject<ISanitizableType>;
    parent?: DeltaMergeable;
    initialValue?: any;
}): DeltaMergeable {
    let container: DeltaMergeable | undefined;
    switch (args.type.typeName) {
        case "list":
            container = createArray({
                key: args.key,
                parent: args.parent,
                childType: args.type.valueType,
            });
            break;
        case "dictionary":
            container = createObject({
                key: args.key,
                parent: args.parent,
                childType: args.type.valueType,
            });
            break;
        case "gameObject":
            container = createObject({
                key: args.key,
                initialValue: args.initialValue,
                parent: args.parent,
                childTypes: args.childTypes,
                transform: (val) => sanitizeType(args.type, val),
            });
            break;
        default:
            return new DeltaMergeable({
                key: args.key,
                initialValue: args.initialValue,
                parent: args.parent,
                transform: (val) => sanitizeType(args.type, val),
            });
    }

    return container;
}

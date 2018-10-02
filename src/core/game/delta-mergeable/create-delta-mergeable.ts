// tslint:disable:no-any no-non-null-assertion
// ^ as DeltaMergeables are black magic anyways

import { ISanitizableType, sanitizeType } from "~/core/sanitize/";
import { TypedObject } from "~/utils";
import { DeltaMergeable } from "./delta-mergeable";
import { createArray } from "./delta-mergeable-array";
import { createObject } from "./delta-mergeable-object";

/**
 * Creates a sanitization transform function for delta mergeables.
 *
 * @param type They type to sanitize.
 * @returns a function that will accept a value and try to sanitize it.
 */
function sanitize(type: Readonly<ISanitizableType>): (
    val: unknown,
    current: any,
    forceSet: boolean,
) => any {
    return function transformSanitize(
        val: unknown,
        current: any,
        forceSet: boolean,
    ): any {
        const sanitized = sanitizeType(type, val, !forceSet); // if we are force settings, don't allow errors
        if (sanitized instanceof Error) {
            /*
             * If an error is thrown here you broke the type system.
             *
             * Whenever you set a variable in a game Cerveau type checks it,
             * and if it can't figure out how to convert it (e.g. "0" -> 0),
             * then it blows up here. We must do this as statically typed
             * programming languages like C++ MUST have the right types or we
             * will blow them up accidentally.
             *
             * To debug this read the stack trace and find where in the game
             * code you set a variable to the wrong type. The best candidate is
             * looking for code where you use the dangerous `any` type.
             */
            throw sanitized;
        }

        return sanitized;
    };
}

/**
 * Creates a delta mergeable given a type.
 * @param args - The data about the delta mergeable to create
 * @returns A newly created DeltaMergeable instance of the given type.
 */
export function createDeltaMergeable(args: {
    key: string;
    type: Readonly<ISanitizableType>;
    childTypes?: Readonly<TypedObject<ISanitizableType>>;
    parent?: DeltaMergeable;
    initialValue?: any;
}): DeltaMergeable {
    switch (args.type.typeName) {
        case "list":
            return createArray({
                key: args.key,
                parent: args.parent,
                childType: args.type.valueType,
            });
        case "dictionary":
            return createObject({
                key: args.key,
                parent: args.parent,
                childType: args.type.valueType,
            });
        case "gameObject":
            return createObject({
                key: args.key,
                initialValue: args.initialValue,
                parent: args.parent,
                childTypes: args.childTypes,
                transform: sanitize(args.type),
            });
        default:
            return new DeltaMergeable({
                key: args.key,
                initialValue: args.initialValue,
                parent: args.parent,
                transform: sanitize(args.type),
            });
    }
}

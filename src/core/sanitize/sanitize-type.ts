import { isNil } from "~/utils";
import { ISanitizableType } from "./sanitizable-interfaces";
import { sanitizeArray } from "./sanitize-array";
import { sanitizeBoolean } from "./sanitize-boolean";
import { sanitizeGameObject } from "./sanitize-game-object";
import { sanitizeInteger } from "./sanitize-integer";
import { sanitizeNumber } from "./sanitize-number";
import { sanitizeObject } from "./sanitize-object";
import { sanitizeString } from "./sanitize-string";

/**
 * Sanitizes a value to a specified type. If it does not match at all, then the
 * default value for that type is returned.
 *
 * @param type The type to coerce to.
 * @param obj The value to coerce from.
 * @param allowError - If errors should be allowed to be returned if they
 * cannot be reasonable sanitized.
 * @returns A value now sanitized and guaranteed to be of that type.
 */
export function sanitizeType(
    type: ISanitizableType,
    obj: unknown,
    allowError: boolean = true,
): unknown {
    let value: unknown;

    if (type.nullable && isNil(obj)) {
        return undefined;
    }

    switch (type.typeName) {
        case "void":
            return undefined;
        case "boolean":
            value = sanitizeBoolean(obj, allowError);
            break;
        case "float":
            value = sanitizeNumber(obj, allowError);
            break;
        case "int":
            value = sanitizeInteger(obj, allowError);
            break;
        case "string":
            value = sanitizeString(obj, allowError);
            break;
        case "dictionary":
            const asObj = sanitizeObject(obj, allowError);
            if (asObj instanceof Error) {
                return asObj;
            }

            for (const key of Object.keys(asObj)) {
                asObj[key] = sanitizeType(type.valueType, asObj[key], allowError);
            }
            value = asObj;
            break;
        case "list":
            const asArray = sanitizeArray(obj, allowError);
            if (asArray instanceof Error) {
                return asArray;
            }

            // re-use the array because it may be one of our Proxy wrapped arrays, otherwise map() would be prefered
            for (let i = 0; i < asArray.length; i++) {
                asArray[i] = sanitizeType(type.valueType, asArray[i], allowError);
            }
            break;
        case "gameObject": // assume game object
            value = sanitizeGameObject(obj, type.gameObjectClass, allowError);
            break;
        default:
            throw new Error(`Sanitizing unknown type ${type}.`);
    }

    if ((
        type.typeName === "string" ||
        type.typeName === "float" ||
        type.typeName === "int" ||
        type.typeName === "boolean"
    ) && type.literals) {
        const literals = type.literals;
        let found = literals.includes(value as (boolean | number | string));

        if (!found && type.typeName === "string") {
            // Try to see if the string is found via a case-insensitive
            // search.
            const lowered = (value as string).toLowerCase();
            const matchingLiteral = literals.find((literal) => (literal as string).toLowerCase() === lowered);
            if (matchingLiteral !== undefined) { // we found it!
                found = true;
                value = matchingLiteral;
            }
        }

        if (!found) {
            if (allowError) {
                // the value they sent was not one of the literals
                return new Error(`${value} is not an expected value from literals [${literals.join(", ")}]`);
            }
            else {
                // Couldn't be found at all, default to first literal value.
                return literals[0];
            }
        }
    }

    if (allowError && !type.nullable && value === undefined) {
        return new Error("Value cannot be undefined.");
    }

    return value;
}

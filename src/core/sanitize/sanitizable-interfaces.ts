import { BaseGameObject } from "~/core/game/base/base-game-object";

/** The base interface for all sanitizable types. */
interface SanitizableBaseType {
    /**
     * If null/undefined are allowed values for this type.
     * Common for objects.
     */
    nullable?: boolean;
}

/** The various types we can sanitize. */
export type SanitizableType = (
    | SanitizableTypePrimitive
    | SanitizableTypeList
    | SanitizableTypeDictionary
    | SanitizableTypeGameObject
) &
    SanitizableBaseType;

/** Primitive types we can sanitize. */
export interface SanitizableTypePrimitive {
    /** Name of a primitive type. */
    typeName: "string" | "float" | "int" | "boolean" | "void";
    /** Literal values, can be an array of any of them. */
    literals?: Array<string | boolean | number>;
}

/** A list (array) that can be sanitized. */
export interface SanitizableTypeList {
    /** When the type is a list. */
    typeName: "list";
    /** It has a value type for its children. */
    valueType: SanitizableType;
}

/** A dictionary (object/map) that can be sanitized. */
export interface SanitizableTypeDictionary {
    /** When the type is a dictionary. */
    typeName: "dictionary";
    /** All values must be of this type. */
    valueType: SanitizableType;
    /** All keys must be of this type. */
    keyType: SanitizableType;
}

/** A game object in a game that can be sanitized. */
export interface SanitizableTypeGameObject {
    /** When the type is a game object. */
    typeName: "gameObject";
    /** There MUST be a game object class all instantiate off of. */
    gameObjectClass: typeof BaseGameObject;
    /** And it may or may not be nullable. */
    nullable: boolean;
}

import { BaseGameObject } from "~/core/game/base/base-game-object";

/** The base interface for all sanitizable types */
interface ISanitizableBaseType {
    /**
     * if null/undefined are allowed values for this type.
     * Common for objects
     */
    nullable?: boolean;
}

/** The various types we can sanitize. */
export type ISanitizableType = (
    ISanitizableTypePrimitive |
    ISanitizableTypeList |
    ISanitizableTypeDictionary |
    ISanitizableTypeGameObject
) & ISanitizableBaseType;

/** Primitive types we can sanitize. */
export interface ISanitizableTypePrimitive {
    typeName: "string" | "float" | "int" | "boolean" | "void";
    literals?: Array<string | boolean | number>;
}

/** A list (array) that can be sanitized. */
export interface ISanitizableTypeList {
    typeName: "list";
    valueType: ISanitizableType;
}

/** A dictionary (object/map) that can be sanitized. */
export interface ISanitizableTypeDictionary {
    typeName: "dictionary";
    valueType: ISanitizableType;
    keyType: ISanitizableType;
}

/** A game object in a game that can be sanitized. */
export interface ISanitizableTypeGameObject {
    typeName: "gameObject";
    gameObjectClass: typeof BaseGameObject;
    nullable: boolean;
}

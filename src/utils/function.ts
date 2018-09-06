// tslint:disable:no-any = required for TS mixin logic

/**
 * Extracts a constructor for a given type.
 *
 * Useful for mixins.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Extracts the first type for a given class constructor
 */
export type FirstArgumentFromConstructor<T> = T extends new (
    arg1: infer U,
    ...args: any[]
) => any ? U : any;

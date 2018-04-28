/**
 * Extracts a constructor for a given type.
 *
 * Useful for mixins.
 */
export type Constructor<T> = new (...args: any[]) => T;

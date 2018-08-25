/**
 * Extracts a constructor for a given type.
 *
 * Useful for mixins.
 */
// tslint:disable-next-line:no-any - required for constructor signature
export type Constructor<T> = new (...args: any[]) => T;

import { isObject } from "~/utils/object";

/**
 * Wraps an index around a given range.
 *
 * @param index - The number to wrap within 0 to length, so if this was -1 the
 * result would be length-1.
 * @param length - The right bound to wrap around back to 0 from.
 * @returns The index "wrapped around" 0 to length. 0 <= result < length.
 */
export function wrapAround(index: number, length: number): number {
    return (index % length + length) % length;
}

/**
 * Clamps a number between a given min and max.
 *
 * @param value - The value to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A value now clamped between [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/** A simple 2D point. */
export interface IPoint {
    /** The X-Coordinate. */
    x: number;

    /** The Y-Coordinate. */
    y: number;
}

/**
 * Make points from a loose collection of point like objects.
 *
 * @param args - The point like things to create from.
 * @returns An array of points from what we could determine.
 */
export function makePoints(...args: Array<unknown>): IPoint[] {
    const points: IPoint[] = [];
    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (isObject(arg)) {
            if (Array.isArray(arg)) {
                const x = Number(arg[0]);
                const y = Number(arg[1]);
                points.push({ x, y });
            }
            else {
                if (!arg.x || !arg.y) {
                    throw new Error(`arg ${arg} does not have point like structure!`);
                }
                points.push({
                    x: Number(arg.x),
                    y: Number(arg.y),
                });
            }
        }
        else if (typeof arg === "number" && typeof args[i + 1] === "number") {
            i += 1;
            points.push({
                x: arg,
                y: Number(args[i]),
            });
        }
        else {
            throw new Error(`Unexpected point to parse: ${arg} at index ${i}`);
        }
    }

    return points;
}

/**
 * Gets the Manhattan distance between two points (x1, y1) and (x2, y2);
 * the distance between two points measured along axes at right angles.
 *
 * @param point1 - { x, y } point 1
 * @param point2 - { x, y } point 2
 * @returns The manhattan distance between the two points.
 */
export function manhattanDistance(point1: IPoint, point2: IPoint): number;

/**
 * Gets the Manhattan distance between two points (x1, y1) and (x2, y2);
 * the distance between two points measured along axes at right angles.
 *
 * @param point1 - [ x, y ] point 1
 * @param point2 - [ x, y ] point 2
 * @returns The manhattan distance between the two points.
 */
export function manhattanDistance(
    point1: [number, number],
    point2: [number, number],
): number;

/**
 * Gets the Manhattan distance between two points (x1, y1) and (x2, y2);
 * the distance between two points measured along axes at right angles.
 *
 * @param x1 - point 1's x
 * @param y1 - point 1's y
 * @param x2 - point 2's x
 * @param y2 - point 2's y
 * @returns The manhattan distance between the two points.
 */
export function manhattanDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
): number;

/**
 * Gets the Manhattan distance between two points (x1, y1) and (x2, y2);
 * the distance between two points measured along axes at right angles.
 *
 * @param args - Points either in the format [x1, y1, x2, y2],
 * [{x1, y1}, {x1, y2}], or [ [x1, y1], [x1, y2] ].
 * @returns The manhattan distance between the two points.
 */
export function manhattanDistance(...args: Array<unknown>): number {
    const points = makePoints(...args);

    const dx = Math.abs(points[0].x - points[1].x);
    const dy = Math.abs(points[0].y - points[1].y);

    return dx + dy;
}

/**
 * Gets the Euclidean distance between two points (x1, y1) and (x2, y2);
 * Pythagorean theorem: The distance between two points is the length of the
 * path connecting them.
 *
 * @param point1 - { x, y } point 1
 * @param point2 - { x, y } point 2
 * @returns The euclidean distance between the two points.
 */
export function euclideanDistance(point1: IPoint, point2: IPoint): number;

/**
 * Gets the Euclidean distance between two points (x1, y1) and (x2, y2);
 * Pythagorean theorem: The distance between two points is the length of the
 * path connecting them.
 *
 * @param point1 - [ x, y ] point 1
 * @param point2 - [ x, y ] point 2
 * @returns The euclidean distance between the two points.
 */
export function euclideanDistance(
    point1: [number, number],
    point2: [number, number],
): number;

/**
 * Gets the Euclidean distance between two points (x1, y1) and (x2, y2);
 * Pythagorean theorem: The distance between two points is the length of the
 * path connecting them.
 *
 * @param x1 - point 1's x
 * @param y1 - point 1's y
 * @param x2 - point 2's x
 * @param y2 - point 2's y
 * @returns The euclidean distance between the two points.
 */
export function euclideanDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
): number;

/**
 * Gets the Euclidean distance between two points (x1, y1) and (x2, y2);
 * Pythagorean theorem: The distance between two points is the length of the
 * path connecting them.
 *
 * @param args - Points either in the format [x1, y1, x2, y2],
 * [{x1, y1}, {x1, y2}], or [ [x1, y1], [x1, y2] ]
 * @returns The euclidean distance between the two points.
 */
export function euclideanDistance(...args: Array<unknown>): number {
    const points = makePoints(...args);

    return Math.sqrt(
        ((points[1].x - points[0].x) ** 2)
        +
        ((points[1].y - points[0].y) ** 2),
    );
}

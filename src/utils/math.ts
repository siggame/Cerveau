/**
 * wraps an index around a given range
 *
 * @param index - the number to wrap within 0 to length, so if this was -1 the result would be length-1
 * @param length - the right bound to wrap around back to 0 from
 * @returns the index "wrapped around" 0 to length. 0 <= result < length
 */
export function wrapAround(index: number, length: number): number {
    return (index % length + length) % length;
}

/**
 * Clamps a number between a given min and max
 * @param value the value to clamp
 * @param min the minimum value
 * @param max the maximum value
 * @returns value now clamped [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export interface IPoint {
    x: number;
    y: number;
}

export function makePoints(...args: any[]): IPoint[] {
    const points: IPoint[] = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (typeof(arg) === "object") {
            if (Array.isArray(arg)) {
                points.push({x: arg[0], y: arg[1]});
            }
            else {
                points.push({x: arg.x, y: arg.y});
            }
        }
        else if (typeof(arg) === "number" && typeof(args[i + 1] === "number")) {
            points.push({x: arg, y: args[++i]});
        }
        else {
            throw new Error(`Unexpected point to parse: ${arg} at index ${i}`);
        }
    }

    return points;
}

export function manhattanDistance(point1: IPoint, point2: IPoint): number;
export function manhattanDistance(point1: [number, number], point2: [number, number]): number;
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number;

/**
 * Gets the Manhattan distance between two points (x1, y1) and (x2, y2);
 * the distance between two points measured along axes at right angles.
 *
 * @param args - points either in the format [x1, y1, x2, y2], [{x1, y1}, {x1, y2}], or [ [x1, y1], [x1, y2] ]
 * @returns the manhattan distance between the two points.
 */
export function manhattanDistance(...args: any[]): number {
    const points = makePoints(...args);
    return Math.abs(points[0].x - points[1].x) + Math.abs(points[0].y - points[1].y);
}

export function euclideanDistance(point1: IPoint, point2: IPoint): number;
export function euclideanDistance(point1: [number, number], point2: [number, number]): number;
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number;

/**
 * Gets the Euclidean distance between two points (x1, y1) and (x2, y2);
 * Pythagorean theorem: The distance between two points is the length of the path connecting them.
 *
 * @param args - points either in the format [x1, y1, x2, y2], [{x1, y1}, {x1, y2}], or [ [x1, y1], [x1, y2] ]
 * @returns the euclidean distance between the two points
 */
export function euclideanDistance(...args: any[]): number {
    const points = makePoints(...args);
    return Math.sqrt(Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2));
}

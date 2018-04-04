import * as random from "seedrandom";
import { shuffle } from "~/utils";

/** A simple class wrapper for generating random numbers */
export class RandomNumberGenerator {
    private readonly random: random.prng;

    constructor(seed?: string) {
        this.random = random(seed);
    }

    /**
     * returns a random integer within the range of upper to lower (inclusive). lower defaults to 0.
     *
     * @param {number} upper - the upper range, this number is NOT valid as a random return value
     * @param {number} [lower] - the lower range, defaults to 0
     * @returns {number} a random integer within the range lower to upper
     */
    public int(upper: number = 1, lower: number = 0): number {
        const max = Math.round(Math.max(upper, lower));
        const min = Math.round(Math.min(upper, lower));
        return Math.abs(this.random.int32() % max) + min;
    }

    /**
     * returns a random floating point number within the range of upper to lower (inclusive). lower defaults to 0.
     *
     * @param {number} upper - the upper range, this number is NOT valid as a random return value
     * @param {number} lower - the lower range, defaults to 0
     * @returns {number} a random integer within the range lower to upper
     */
    public float(upper: number = 1, lower: number = 0): number {
        const max = Math.max(upper, lower);
        const min = Math.min(upper, lower);
        return this.random.double() * (max - min) + min;
    }

    public shuffle<T>(array: T[]): T[] {
        return shuffle(array, () => this.float());
    }

    public element<T>(array: T[]): T {
        return array[Math.floor(this.float() * array.length)];
    }

    public fromWeights<T>(map: Map<T, number>): T {
        let sum = 0;
        for (const [_, num] of map) {
            sum += num;
        }

        const choice = this.float(sum);
        let upTo = 0;
        for (const [item, weight] of map) {
            upTo += weight;
            if (upTo >= choice) {
                return item;
            }
        }

        throw new Error("Could not chose item for fromWeights");
    }

    public dataSetFrom<T>(count: number, map: Map<T, {
        min?: number;
        max?: number;
        weight?: number;
    }>): Map<T, number> {
        return new Map();
    }
}

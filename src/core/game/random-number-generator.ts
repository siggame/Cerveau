import * as random from "seedrandom";
import { shuffle, ArrayWithOneOrMore } from "~/utils";

/** A simple class wrapper for generating random numbers */
export class RandomNumberGenerator {
    /** The random library interface we are wrapping around. */
    private readonly random: random.prng;

    /**
     * Creates a random number generator that can be seeded with useful
     * methods for games to leverage.
     * @param seed - The optional rng seed to use.
     */
    constructor(seed?: string) {
        this.random = random(seed);
    }

    /**
     * Returns a random integer within the range of upper to lower (inclusive).
     *
     * @param upper - The upper range, this number is NOT valid as a random
     * return value.
     * @param lower - The lower range, defaults to 0.
     * @returns A random integer within the range lower to upper.
     */
    public int(upper: number = 1, lower: number = 0): number {
        const max = Math.round(Math.max(upper, lower));
        const min = Math.round(Math.min(upper, lower));
        return Math.abs(this.random.int32() % max) + min;
    }

    /**
     * Returns a random floating point number within the range of upper to
     * lower (inclusive).
     *
     * @param upper - The upper range, this number is NOT valid as a random
     * return value.
     * @param lower - The lower range, defaults to 0.
     * @returns A random integer within the range lower to upper.
     */
    public float(upper: number = 1, lower: number = 0): number {
        const max = Math.max(upper, lower);
        const min = Math.min(upper, lower);
        return this.random.double() * (max - min) + min;
    }

    /**
     * Shuffles an array IN PLACE using the PRNG.
     *
     * @param array - The array to shuffle in place.
     * @returns The same array, now shuffled.
     */
    public shuffle<T>(array: T[]): void {
        shuffle(array, () => this.float());
    }

    /**
     * Selects a random element from an array using the PRNG.
     *
     * @param array - The array to select from.
     * @returns An element from the array, or undefined if the array was empty.
     */
    public element<T>(array: ArrayWithOneOrMore<T>): T;

    /**
     * Selects a random element from an array using the PRNG.
     *
     * @param array - The array to select from.
     * @returns An element from the array, or undefined if the array was empty.
     */
    public element<T>(array: T[]): T | undefined;

    /**
     * Selects a random element from an array using the PRNG.
     *
     * @param array - The array to select from.
     * @returns An element from the array, or undefined if the array was empty.
     */
    public element<T>(array: ArrayWithOneOrMore<T>): T {
        return array[Math.floor(this.float() * array.length)];
    }

    /**
     * Selects a random element from an array using the PRNG, and pops it
     * (removes it from the array and returns it)
     *
     * @param array - The array to select from.
     * @returns An element from the array, or undefined if the array was empty.
     * The array is mutated if it contained elements, as the return value is
     * removed.
     */
    public pop<T>(array: T[]): T | undefined {
        const index = Math.floor(this.float() * array.length);
        const popped = array[index];

        // remove that element, mutating the array
        array.splice(index, 1);

        return popped;
    }

    /**
     * Selects a random element from a map of weights.
     *
     * @param map - The map. Where keys are the elements you want to choose
     * from, and their values are their weights.
     *
     * Weights do not need to be uniform, or sum up to 1.00. Any values will
     * work and will all be relative to the rest.
     * @returns An element (key) from the map.
     * @example
     * const map = new Map<string, number>();
     * map.add("half", 0.5);
     * map.add("quarter", 0.25);
     * map.add("rarely", 0.01);
     * map.add("never", 0.00);
     *
     * const chosen: string = rng.fromWeights(map);
     */
    public fromWeights<T>(map: Map<T, number>): T {
        let sum = 0;
        for (const num of map.values()) {
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

        throw new Error(`Could not chose item for fromWeights.
Ensure your Map has entries`);
    }
}

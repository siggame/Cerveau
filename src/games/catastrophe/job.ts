import { BaseGameObjectRequiredData } from "~/core/game";
import { JobConstructorArgs } from "./";
import { GameObject } from "./game-object";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The Job title.
 */
export type JobTitle = "fresh human" | "cat overlord" | "soldier" | "gatherer" | "builder" | "missionary";

/**
 * Information about a Unit's job.
 */
export class Job extends GameObject {
    /**
     * The amount of energy this Job normally uses to perform its actions.
     */
    public readonly actionCost!: number;

    /**
     * How many combined resources a Unit with this Job can hold at once.
     */
    public readonly carryLimit!: number;

    /**
     * The number of moves this Job can make per turn.
     */
    public readonly moves!: number;

    /**
     * The amount of energy normally regenerated when resting at a shelter.
     */
    public readonly regenRate!: number;

    /**
     * The Job title.
     */
    public readonly title!: "fresh human" | "cat overlord" | "soldier" | "gatherer" | "builder" | "missionary";

    /**
     * The amount of food per turn this Unit consumes. If there isn't enough
     * food for every Unit, all Units become starved and do not consume food.
     */
    public readonly upkeep!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Job is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: JobConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
                // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

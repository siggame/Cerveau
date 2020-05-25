import { BaseGameObjectRequiredData } from "~/core/game";
import { JobConstructorArgs } from "./";
import { GameObject } from "./game-object";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The Job title. 'intern', 'manager', or 'physicist'.
 */
export type JobTitle = "intern" | "manager" | "physicist";

/**
 * Information about a unit's job.
 */
export class Job extends GameObject {
    /**
     * How many combined resources a unit with this Job can hold at once.
     */
    public readonly carryLimit!: number;

    /**
     * The amount of damage this Job does per attack.
     */
    public readonly damage!: number;

    /**
     * The amount of starting health this Job has.
     */
    public readonly health!: number;

    /**
     * The number of moves this Job can make per turn.
     */
    public readonly moves!: number;

    /**
     * The Job title. 'intern', 'manager', or 'physicist'.
     */
    public readonly title!: "intern" | "manager" | "physicist";

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

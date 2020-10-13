import { BaseGameObjectRequiredData } from "~/core/game";
import { JobConstructorArgs } from "./";
import { GameObject } from "./game-object";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The Job title. 'miner' or 'bomb'.
 */
export type JobTitle = "miner" | "bomb";

/**
 * Information about a Unit's job.
 */
export class Job extends GameObject {
    /**
     * The amount of cargo capacity this Unit starts with per level.
     */
    public readonly cargoCapacity!: number[];

    /**
     * The amount of starting health this Job has per level.
     */
    public readonly health!: number[];

    /**
     * The amount of mining power this Unit has per turn per level.
     */
    public readonly miningPower!: number[];

    /**
     * The number of moves this Job can make per turn per level.
     */
    public readonly moves!: number[];

    /**
     * The Job title. 'miner' or 'bomb'.
     */
    public readonly title!: "miner" | "bomb";

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

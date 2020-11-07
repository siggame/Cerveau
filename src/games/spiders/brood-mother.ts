import { BaseGameObjectRequiredData } from "~/core/game";
import {
    BroodMotherConstructorArgs,
    BroodMotherConsumeArgs,
    BroodMotherSpawnArgs,
} from "./";
import { Player } from "./player";
import { Spider } from "./spider";
import { Spiderling } from "./spiderling";

// <<-- Creer-Merge: imports -->>
import { Nest } from "./nest";
// <<-- /Creer-Merge: imports -->>

/**
 * The Spider Queen. She alone can spawn Spiderlings for each Player, and if
 * she dies the owner loses.
 */
export class BroodMother extends Spider {
    /**
     * How many eggs the BroodMother has to spawn Spiderlings this turn.
     */
    public eggs!: number;

    /**
     * How much health this BroodMother has left. When it reaches 0, she dies
     * and her owner loses.
     */
    public health!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a BroodMother is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: BroodMotherConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
            /** The Nest this BroodMother exists upon. */
            nest: Nest;
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

    /**
     * Invalidation function for consume. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param spiderling - The Spiderling to consume. It must be on the
     * same Nest as this BroodMother.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateConsume(
        player: Player,
        spiderling: Spiderling,
    ): void | string | BroodMotherConsumeArgs {
        // <<-- Creer-Merge: invalidate-consume -->>
        // Check all the arguments for consume here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined;
        // <<-- /Creer-Merge: invalidate-consume -->>
    }

    /**
     * Consumes a Spiderling of the same owner to regain some eggs to spawn
     * more Spiderlings.
     *
     * @param player - The player that called this.
     * @param spiderling - The Spiderling to consume. It must be on the
     * same Nest as this BroodMother.
     * @returns True if the Spiderling was consumed. False otherwise.
     */
    protected async consume(
        player: Player,
        spiderling: Spiderling,
    ): Promise<boolean> {
        // <<-- Creer-Merge: consume -->>

        // Add logic here for consume.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: consume -->>
    }

    /**
     * Invalidation function for spawn. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param spiderlingType - The string name of the Spiderling class you want
     * to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawn(
        player: Player,
        spiderlingType: "Spitter" | "Weaver" | "Cutter",
    ): void | string | BroodMotherSpawnArgs {
        // <<-- Creer-Merge: invalidate-spawn -->>
        // Check all the arguments for spawn here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined;
        // <<-- /Creer-Merge: invalidate-spawn -->>
    }

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming
     * an egg.
     *
     * @param player - The player that called this.
     * @param spiderlingType - The string name of the Spiderling class you want
     * to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @returns The newly spawned Spiderling if successful. Undefined otherwise.
     */
    protected async spawn(
        player: Player,
        spiderlingType: "Spitter" | "Weaver" | "Cutter",
    ): Promise<Spiderling | undefined> {
        // <<-- Creer-Merge: spawn -->>

        // Add logic here for spawn.

        // TODO: replace this with actual logic
        return undefined;

        // <<-- /Creer-Merge: spawn -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

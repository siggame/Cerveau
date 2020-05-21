import { BaseGameObjectRequiredData } from "~/core/game";
import { IMachineProperties } from "./";
import { GameObject } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * What type of ore the machine takes it. Also determines the type of material
 * it outputs. (redium or blueium).
 */
export type MachineOreType = "redium" | "blueium";

/**
 * A machine in the game. Used to refine ore.
 */
export class Machine extends GameObject {
    /**
     * What type of ore the machine takes it. Also determines the type of
     * material it outputs. (redium or blueium).
     */
    public readonly oreType!: "redium" | "blueium";

    /**
     * The amount of ore that needs to be inputted into the machine for it to
     * be worked.
     */
    public readonly refineInput!: number;

    /**
     * The amount of refined ore that is returned after the machine has been
     * fully worked.
     */
    public readonly refineOutput!: number;

    /**
     * The number of times this machine needs to be worked to refine ore.
     */
    public readonly refineTime!: number;

    /**
     * The Tile this Machine is on.
     */
    public readonly tile: Tile;

    /**
     * Tracks how many times this machine has been worked. (0 to refineTime).
     */
    public worked!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Machine is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<
            IMachineProperties & {
                // <<-- Creer-Merge: constructor-args -->>
                /** The Tile to spawn this Machine upon. */
                tile: Tile;
                // You can add more constructor args in here
                // <<-- /Creer-Merge: constructor-args -->>
            }
        >,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.tile = args.tile;
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

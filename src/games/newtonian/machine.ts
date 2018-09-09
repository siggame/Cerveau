import { IBaseGameObjectRequiredData } from "~/core/game";
import { IMachineProperties } from "./";
import { GameObject } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * What type of ore the machine takes it, also determins the type of material
 * it outputs.
 */
export type MachineOreType = "redium" | "blueium";

/**
 * A machine on a tile.
 */
export class Machine extends GameObject {
    /**
     * The amount of ore that is in the machine. Cannot be higher than the
     * refineInput value.
     */
    public input!: number;

    /**
     * What type of ore the machine takes it, also determins the type of
     * material it outputs.
     */
    public readonly oreType!: "redium" | "blueium";

    /**
     * The amount of material that is waiting to be collected in the machine.
     */
    public output!: number;

    /**
     * The amount of ore that needs to be inputted into the machine.
     */
    public readonly refineInput!: number;

    /**
     * The amount of material that out of the machine after running.
     */
    public readonly refineOutput!: number;

    /**
     * The amount of turns this machine takes to refine the ore.
     */
    public readonly refineTime!: number;

    /**
     * The Tile this Machine is on.
     */
    public readonly tile: Tile;

    /**
     * Time till the machine finishes running.
     */
    public timeLeft!: number;

    /**
     * Tracks how many times this machine has been worked.
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
        args: IMachineProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            tile: Tile;
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        },
        required: IBaseGameObjectRequiredData,
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

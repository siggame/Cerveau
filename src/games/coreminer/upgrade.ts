import { BaseGameObjectRequiredData } from "~/core/game";
import { UpgradeConstructorArgs } from "./";
import { GameObject } from "./game-object";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Information about a Miner's Upgrade module.
 */
export class Upgrade extends GameObject {
    /**
     * The amount of cargo capacity this Upgrade has.
     */
    public readonly cargoCapacity!: number;

    /**
     * The maximum amount of health this Upgrade has.
     */
    public readonly health!: number;

    /**
     * The amount of mining power this Upgrade has per turn.
     */
    public readonly miningPower!: number;

    /**
     * The number of moves this Upgrade can make per turn.
     */
    public readonly moves!: number;

    /**
     * The Upgrade title.
     */
    public readonly title!: string;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Upgrade is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: UpgradeConstructorArgs<{
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

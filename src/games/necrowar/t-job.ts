import { IBaseGameObjectRequiredData } from "~/core/game";
import { ItJobProperties } from "./";
import { GameObject } from "./game-object";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The type title. 'arrow', 'aoe', 'ballista', or 'cleansing'.
 */
export type tJobTitle = "arrow" | "aoe" | "ballista" | "cleansing";

/**
 * Information about a tower's job/type.
 */
export class tJob extends GameObject {
    /**
     * Whether this tower type hits all of the units on a tile (true) or one at
     * a time (false).
     */
    public allUnits!: boolean;

    /**
     * The amount of damage this type does per attack.
     */
    public readonly damage!: number;

    /**
     * How much does this type cost in gold.
     */
    public readonly goldCost!: number;

    /**
     * The amount of starting health this type has.
     */
    public readonly health!: number;

    /**
     * How much does this type cost in mana.
     */
    public readonly manaCost!: number;

    /**
     * The number of tiles this type can attack from.
     */
    public readonly range!: number;

    /**
     * The type title. 'arrow', 'aoe', 'ballista', or 'cleansing'.
     */
    public readonly title!: "arrow" | "aoe" | "ballista" | "cleansing";

    /**
     * How many turns have to take place between this type's attacks.
     */
    public readonly turnsBetweenAttacks!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a tJob is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<ItJobProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
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

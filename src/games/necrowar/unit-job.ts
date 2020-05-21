import { BaseGameObjectRequiredData } from "~/core/game";
import { IUnitJobProperties } from "./";
import { GameObject } from "./game-object";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The type title. 'worker', 'zombie', 'ghoul', 'hound', 'abomination',
 * 'wraith' or 'horseman'.
 */
export type UnitJobTitle =
    | "worker"
    | "zombie"
    | "ghoul"
    | "hound"
    | "abomination"
    | "wraith"
    | "horseman";

/**
 * Information about a unit's job/type.
 */
export class UnitJob extends GameObject {
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
     * The number of moves this type can make per turn.
     */
    public readonly moves!: number;

    /**
     * How many of this type of unit can take up one tile.
     */
    public readonly perTile!: number;

    /**
     * Amount of tiles away this type has to be in order to be effective.
     */
    public readonly range!: number;

    /**
     * The type title. 'worker', 'zombie', 'ghoul', 'hound', 'abomination',
     * 'wraith' or 'horseman'.
     */
    public readonly title!:
        | "worker"
        | "zombie"
        | "ghoul"
        | "hound"
        | "abomination"
        | "wraith"
        | "horseman";

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a UnitJob is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<
            IUnitJobProperties & {
                // <<-- Creer-Merge: constructor-args -->>
                // You can add more constructor args in here
                // <<-- /Creer-Merge: constructor-args -->>
            }
        >,
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

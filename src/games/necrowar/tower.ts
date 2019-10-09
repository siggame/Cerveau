import { IBaseGameObjectRequiredData } from "~/core/game";
import { ITowerAttackArgs, ITowerProperties } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A tower in the game. Used to combat enemy waves.
 */
export class Tower extends GameObject {
    /**
     * Whether this tower has attacked this turn or not.
     */
    public attacked!: boolean;

    /**
     * How much remaining health this tower has.
     */
    public health!: number;

    /**
     * The player that built / owns this tower.
     */
    public owner?: Player;

    /**
     * The Tile this Tower is on.
     */
    public readonly tile: Tile;

    /**
     * What type of tower this is (it's job).
     */
    public readonly type!: tJob;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Tower is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<ITowerProperties & {
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

    /**
     * Invalidation function for attack. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateAttack(
        player: Player,
        tile: Tile,
    ): void | string | ITowerAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>

        // Check all the arguments for attack here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-attack -->>
    }

    /**
     * Attacks an enemy unit on an tile within it's range.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        // Add logic here for attack.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: attack -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

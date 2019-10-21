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
    
    /*
     * Returns the distance between the points
     *
     * @param x1: the first x coordinate.
     * @param y1: the first y coordinate.
     * @param x2: the second x coordinate.
     * @param y2: the second y coordinate.
     *
     * @returns the distance between the points.
     */
    private distance(x1: int, y1: int, x2: int, y2: int): number {
        // grab the differences.
        const xDif = (x1 - x2);
        const yDif = (y1 - y2);

        // return the distance.
        return Math.sqrt((xDif ** 2) + (yDif ** 2));
    }

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
        
        const float range = 2.3;
        
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }
        
        // Check if tile exists
        if (!tile) {
            return `${this}, is trying to act on a tile that doesn't exist`;
        }
        
        if (!tile.unit) {
            return `${this}, cannot attack because the tile has no unit`;
        }
        
        if (this.attcked) {
            return `${this}, has already attacked this turn`;
        }
        
        /*
         * Shape of the Tower range:
         *         _ x x x _ 
         *         x x x x x
         *         x x T x x
         *         x x x x x
         *         _ x x x _
         */
        
        if (range < this.distance(this.tile.x, this.tile.y, tile.x , tile.y)) {
            return `${this}, cannot attack because target is out of range`;
        }
        
        // Notes: 
        
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

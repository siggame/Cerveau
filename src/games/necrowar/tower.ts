import { IBaseGameObjectRequiredData } from "~/core/game";
import { ITowerAttackArgs, ITowerProperties } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { TowerJob } from "./tower-job";

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
     * What type of tower this is (it's job).
     */
    public readonly job!: TowerJob;

    /**
     * The player that built / owns this tower.
     */
    public owner?: Player;

    /**
     * The Tile this Tower is on.
     */
    public readonly tile!: Tile;

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
        const range = 2.3; // Attack range

        // Check if tower already attacked
        if (this.attacked) {
            return `${this}, cannot attack becuase has already attacked this turn`;
        }

        // Check if any unit belongs to the player
        if ((tile.unit) && (tile.unit.owner === player))
        {
            return `${this}, cannot attack allied units!`;
        }

        // Check if tile exists
        if (!tile) {
            return `${this}, cannot attack a tile that doesn't exist!`;
        }

        // Check if tile has no units
        if (!tile.unit) {
            return `${this}, cannot attack a tile with no units!`;
        }

        // Check if tower has zero health
        if (this.health <= 0)
        {
            return `${this}, cannot attack because it has been destroyed!`;
        }

        /*
         * Shape of the Tower range:
         *         _ x x x _
         *         x x x x x
         *         x x T x x
         *         x x x x x
         *         _ x x x _
         */

        // Check if tile is in range
        if (range < this.distance(this.tile.x, this.tile.y, tile.x , tile.y)) {
            return `${this}, cannot attack because target tile is out of range`;
        }

        // Check if job is valid
        if (!this.job) {
            return `${this}, has an unknown job`;
        }
        else {
            if (!this.job.title) {
                return `${this}, has an unknown job name`;
            }
        }

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

        /*
         * Damage That Towers Do To Units
         * Castle | Arrow | Ballista | Cleansing | AOE
         * -------+-------+----------+-----------+-----
         *    5   |   5   |    20    |     5     |  3
         */

        // Get all units on target tile
        let tileUnits = [];
        for (let unit of this.game.units) {
            if (unit.tile === tile) {
                tileUnits.push(unit);
            }
        }

        if (!tile.unit) {
            return false;
        }

        if (this.job.title === "aoe") {
            for (let unit of tileUnits) {
                unit.health = Math.max(0, unit.health - this.job.damage);
            }
        }
        else {
            tile.unit.health = Math.max(0, tile.unit.health - this.job.damage);
        }

        // Handle killed units
        for (let unit of tileUnits) {
            if (unit.health === 0) {
                if (unit.job.title !== "zombie") {
                    tile.corpses += 1;
                }
                unit.tile = undefined;

                if (tile.unit && tile.unit.health === 0) {
                    tile.unit = undefined;
                }
            }
        }

        // Remove units in game with zero health
        for (let i: number = 0; i < this.game.units.length; i++) {
            if (this.game.units[i].health <= 0) {
                this.game.units.splice(i, 1); // Remove unit from array
                i = Math.max(0, i - 1);
            }
        }

        return true;
        // <<-- /Creer-Merge: attack -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

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
    private distance(x1: number, y1: number, x2: number, y2: number): number {
        // Calculate differences
        const xDif: number = (x1 - x2);
        const yDif: number = (y1 - y2);

        return Math.sqrt((xDif ** 2) + (yDif ** 2));
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

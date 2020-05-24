import { BaseGameObjectRequiredData } from "~/core/game";
import { TowerAttackArgs, TowerConstructorArgs } from "./";
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
     * How many turns are left before it can fire again.
     */
    public cooldown!: number;

    /**
     * How much remaining health this tower has.
     */
    public health!: number;

    /**
     * What type of tower this is (it's job).
     */
    public readonly job: TowerJob;

    /**
     * The player that built / owns this tower.
     */
    public owner?: Player;

    /**
     * The Tile this Tower is on.
     */
    public readonly tile: Tile;

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
        args: TowerConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
                /** The TowerJob to assign this tower to */
                job: TowerJob;
                /** The starting tile */
                tile: Tile;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.job = args.job;
        this.tile = args.tile;
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
    ): void | string | TowerAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>
        const range = 2.2; // Attack range

        // Check if tower already attacked
        if (this.attacked) {
            return `${this}, cannot attack becuase has already attacked this turn`;
        }

        // Check if any unit belongs to the player
        if (tile.unit && tile.unit.owner === player) {
            return `${this}, cannot attack allied units!`;
        }

        // Check if tile exists
        if (!tile) {
            return `${this}, cannot attack a tile that doesn't exist!`;
        }

        if (this.cooldown > 0) {
            return `${this} is not ready to attack yet!`;
        }

        // Check if tile has no units
        if (!tile.unit) {
            return `${this}, cannot attack a tile with no units!`;
        }

        if (tile.unit.job.title === "worker") {
            return `Towers may not attack workers!`;
        }

        if (this.job.title === "cleansing") {
            if (
                tile.unit.job.title !== "wraith" &&
                tile.unit.job.title !== "abomination"
            ) {
                return `Cleansing towers can only attack wraiths and abominations!`;
            }
        } else if (
            this.job.title !== "castle" &&
            tile.unit.job.title === "wraith"
        ) {
            return `${this} cannot attack wraiths! They are incorporeal!`;
        }

        // Check if tower has zero health
        if (this.health <= 0) {
            return `${this}, cannot attack because it has been destroyed!`;
        }

        /*
         * Shape of the tower range:
         *         _   x   _
         *           x x x
         *         x x T x x
         *           x x x
         *         _   x   _
         */

        if (this.tile === undefined) {
            return `${this} is not on a tile!`;
        }

        // Check if tile is in range
        if (range < this.distance(this.tile.x, this.tile.y, tile.x, tile.y)) {
            return `${this}, cannot attack because target tile is out of range`;
        }

        // Check if job is valid
        if (!this.job) {
            return `${this}, has an unknown job`;
        } else {
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

        this.cooldown = this.job.turnsBetweenAttacks;

        // Get all units on target tile
        const tileUnits = [];
        for (const unit of this.game.units) {
            if (unit.tile === tile) {
                tileUnits.push(unit);
            }
        }

        if (!tile.unit) {
            return false;
        }

        if (this.job.title === "aoe" || this.job.title === "castle") {
            for (const unit of tileUnits) {
                unit.health = Math.max(0, unit.health - this.job.damage);
            }
        } else {
            tile.unit.health = Math.max(0, tile.unit.health - this.job.damage);
        }

        return true;
        // <<-- /Creer-Merge: attack -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
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
        const xDif: number = x1 - x2;
        const yDif: number = y1 - y2;

        return Math.sqrt(xDif ** 2 + yDif ** 2);
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

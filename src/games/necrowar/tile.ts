import { BaseGameObjectRequiredData } from "~/core/game";
import { BaseTile } from "~/core/game/mixins/tiled";
import {
    TileConstructorArgs,
    TileResArgs,
    TileSpawnUnitArgs,
    TileSpawnWorkerArgs,
} from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tower } from "./tower";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject implements BaseTile {
    /**
     * The amount of corpses on this tile.
     */
    public corpses!: number;

    /**
     * Whether or not the tile is a castle tile.
     */
    public isCastle!: boolean;

    /**
     * Whether or not the tile is considered to be a gold mine or not.
     */
    public isGoldMine!: boolean;

    /**
     * Whether or not the tile is considered grass or not (Workers can walk on
     * grass).
     */
    public isGrass!: boolean;

    /**
     * Whether or not the tile is considered to be the island gold mine or not.
     */
    public isIslandGoldMine!: boolean;

    /**
     * Whether or not the tile is considered a path or not (Units can walk on
     * paths).
     */
    public isPath!: boolean;

    /**
     * Whether or not the tile is considered a river or not.
     */
    public isRiver!: boolean;

    /**
     * Whether or not the tile is considered a tower or not.
     */
    public isTower!: boolean;

    /**
     * Whether or not the tile is the unit spawn.
     */
    public isUnitSpawn!: boolean;

    /**
     * Whether or not the tile can be moved on by workers.
     */
    public isWall!: boolean;

    /**
     * Whether or not the tile is the worker spawn.
     */
    public isWorkerSpawn!: boolean;

    /**
     * The amount of Ghouls on this tile.
     */
    public numGhouls!: number;

    /**
     * The amount of Hounds on this tile.
     */
    public numHounds!: number;

    /**
     * The amount of Zombies on this tile.
     */
    public numZombies!: number;

    /**
     * Which player owns this tile, only applies to grass tiles for workers,
     * NULL otherwise.
     */
    public owner?: Player;

    /**
     * The Tile to the 'East' of this one (x+1, y). Undefined if out of bounds
     * of the map.
     */
    public readonly tileEast?: Tile;

    /**
     * The Tile to the 'North' of this one (x, y-1). Undefined if out of bounds
     * of the map.
     */
    public readonly tileNorth?: Tile;

    /**
     * The Tile to the 'South' of this one (x, y+1). Undefined if out of bounds
     * of the map.
     */
    public readonly tileSouth?: Tile;

    /**
     * The Tile to the 'West' of this one (x-1, y). Undefined if out of bounds
     * of the map.
     */
    public readonly tileWest?: Tile;

    /**
     * The Tower on this Tile if present, otherwise undefined.
     */
    public tower?: Tower;

    /**
     * The Unit on this Tile if present, otherwise undefined.
     */
    public unit?: Unit;

    /**
     * The x (horizontal) position of this Tile.
     */
    public readonly x!: number;

    /**
     * The y (vertical) position of this Tile.
     */
    public readonly y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Tile is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        // never directly created by game developers
        args: TileConstructorArgs,
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
     * Gets the adjacent direction between this Tile and an adjacent Tile
     * (if one exists).
     *
     * @param adjacentTile - A tile that should be adjacent to this Tile.
     * @returns "North", "East", "South", or "West" if the tile is adjacent to
     * this Tile in that direction. Otherwise undefined.
     */
    public getAdjacentDirection(
        adjacentTile: Tile | undefined,
    ): "North" | "South" | "East" | "West" | undefined {
        return BaseTile.prototype.getAdjacentDirection.call(
            this,
            adjacentTile,
        );
    }

    /**
     * Gets a list of all the neighbors of this Tile.
     *
     * @returns An array of all adjacent tiles. Should be between 2 to 4 tiles.
     */
    public getNeighbors(): Tile[] {
        return BaseTile.prototype.getNeighbors.call(this) as Tile[];
    }

    /**
     * Gets a neighbor in a particular direction
     *
     * @param direction - The direction you want, must be
     * "North", "East", "South", or "West".
     * @returns The Tile in that direction, or undefined if there is none.
     */
    public getNeighbor(
        direction: "North" | "East" | "South" | "West",
    ): Tile | undefined {
        return BaseTile.prototype.getNeighbor.call(this, direction) as
            | Tile
            | undefined;
    }

    /**
     * Checks if a Tile has another Tile as its neighbor.
     *
     * @param tile - The Tile to check.
     * @returns True if neighbor, false otherwise.
     */
    public hasNeighbor(tile: Tile | undefined): boolean {
        return BaseTile.prototype.hasNeighbor.call(this, tile);
    }

    /**
     * toString override.
     *
     * @returns A string representation of the Tile.
     */
    public toString(): string {
        return BaseTile.prototype.toString.call(this);
    }

    /**
     * Invalidation function for res. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param num - Number of zombies to resurrect.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateRes(
        player: Player,
        num: number,
    ): void | string | TileResArgs {
        // <<-- Creer-Merge: invalidate-res -->>

        // Player invalidation
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        // Ensure tile exists
        if (!this) {
            return `This tile does not exist!`;
        }

        // Ensure number isn't too large
        if (this.corpses < num) {
            return `${this} doesn't have ${num} corpses, it only has ${this.corpses}!`;
        }

        // Ensure num is positive
        if (num <= 0) {
            return `Why are you trying to resurrect ${num} corpses?!`;
        }

        // Ensure the player has enough mana
        const cost = num * this.game.unitJobs[1].manaCost;
        if (this.game.currentPlayer.mana < cost) {
            return `You do not have enough mana to resurrect ${num} corpses!`;
        }

        let spawnTile;
        for (const tile of this.game.tiles) {
            if (tile.owner === player && tile.isUnitSpawn) {
                spawnTile = tile;
            }
        }

        if (!spawnTile) {
            return `You do not have a unit spawn tile. This is probably a bug.`;
        }

        // Ensure there isn't another unit currently on this tile
        const unitCount = Math.max(spawnTile.numGhouls, spawnTile.numHounds);
        if (
            unitCount > 0 ||
            (spawnTile.unit !== undefined &&
                spawnTile.unit.job.title !== "zombie")
        ) {
            return `Your unit spawn tile is already occupied by another unit!`;
        }

        // Ensure there wouldn't be too many zombies
        if (spawnTile.numZombies + num > this.game.unitJobs[1].perTile) {
            return `Your spawn tile cannot fit an additional ${num} zombies!`;
        }

        // <<-- /Creer-Merge: invalidate-res -->>
    }

    /**
     * Resurrect the corpses on this tile into Zombies.
     *
     * @param player - The player that called this.
     * @param num - Number of zombies to resurrect.
     * @returns True if successful res, false otherwise.
     */
    protected async res(player: Player, num: number): Promise<boolean> {
        // <<-- Creer-Merge: res -->>

        // Reduce player mana
        this.game.currentPlayer.mana -= num * this.game.unitJobs[1].manaCost;

        // Find spawn tile
        let spawnTile;
        for (const tile of this.game.tiles) {
            if (tile.owner === player && tile.isUnitSpawn) {
                spawnTile = tile;
            }
        }

        if (!spawnTile) {
            throw new Error(`${player} has no spawn unit tile!`);
        }

        // Create stack of zombies
        let unit;
        for (let i = 0; i < num; i++) {
            unit = this.manager.create.unit({
                acted: false,
                health: this.game.unitJobs[1].health,
                owner: this.game.currentPlayer,
                tile: spawnTile,
                job: this.game.unitJobs[1],
                moves: this.game.unitJobs[1].moves,
            });
            if (!spawnTile.unit) {
                spawnTile.unit = unit;
            }
            this.game.units.push(unit);
            player.units.push(unit);
        }

        // Add zombies to the spawn tile
        spawnTile.numZombies += num;

        // Remove corpses from tile
        this.corpses -= num;

        return true;

        // <<-- /Creer-Merge: res -->>
    }

    /**
     * Invalidation function for spawnUnit. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param title - The title of the desired unit type.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawnUnit(
        player: Player,
        title: string,
    ): void | string | TileSpawnUnitArgs {
        // <<-- Creer-Merge: invalidate-spawnUnit -->>

        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        let unitIndex = -1;

        if (title === "ghoul") {
            unitIndex = 2;
        } else if (title === "abomination") {
            unitIndex = 3;
        } else if (title === "hound") {
            unitIndex = 4;
        } else if (title === "wraith") {
            unitIndex = 5;
        } else if (title === "horseman") {
            unitIndex = 6;
        }

        if (unitIndex === -1) {
            return `Invalid unit type!`;
        }

        if (
            player.gold < this.game.unitJobs[unitIndex].goldCost ||
            player.mana < this.game.unitJobs[unitIndex].manaCost
        ) {
            return `You cannot afford to spawn this unit.`;
        }

        if (!this) {
            return `This tile does not exist!`;
        }

        if (!this.isUnitSpawn) {
            return `This tile cannot spawn units!`;
        }

        if (this.unit) {
            if (
                this.unit.job.title === "zombie" ||
                this.unit.job.title === "horseman" ||
                this.unit.job.title === "abomination" ||
                this.unit.job.title === "wraith" ||
                this.unit.job.title !== title
            ) {
                return `You cannot fit another unit on this tile!`;
            }

            if (
                this.unit.job.title === "ghoul" &&
                this.numGhouls >= this.game.unitJobs[2].perTile
            ) {
                return `The maximum number of ghouls are already on this tile!`;
            }

            if (
                this.unit.job.title === "hound" &&
                this.numHounds >= this.game.unitJobs[4].perTile
            ) {
                return `The maximum number of hounds are already on this tile!`;
            }
        }

        // <<-- /Creer-Merge: invalidate-spawnUnit -->>
    }

    /**
     * Spawns a fighting unit on the correct tile.
     *
     * @param player - The player that called this.
     * @param title - The title of the desired unit type.
     * @returns True if successfully spawned, false otherwise.
     */
    protected async spawnUnit(
        player: Player,
        title: string,
    ): Promise<boolean> {
        // <<-- Creer-Merge: spawnUnit -->>

        let unitIndex = -1;

        if (title === "ghoul") {
            unitIndex = 2;
        } else if (title === "abomination") {
            unitIndex = 3;
        } else if (title === "hound") {
            unitIndex = 4;
        } else if (title === "wraith") {
            unitIndex = 5;
        } else if (title === "horseman") {
            unitIndex = 6;
        }

        const goldCost = this.game.unitJobs[unitIndex].goldCost;
        const manaCost = this.game.unitJobs[unitIndex].manaCost;

        player.gold -= goldCost;
        player.mana -= manaCost;

        const unit = this.game.manager.create.unit({
            acted: false,
            health: this.game.unitJobs[unitIndex].health,
            owner: player,
            tile: this,
            job: this.game.unitJobs[unitIndex],
            title,
            moves: this.game.unitJobs[unitIndex].moves,
        });
        this.game.units.push(unit);
        player.units.push(unit);

        if (this.unit) {
            if (this.numGhouls !== 0) {
                this.numGhouls += 1;
            } else {
                this.numHounds += 1;
            }
        } else {
            this.unit = unit;
            if (title === "hound") {
                this.numHounds = 1;
            } else if (title === "ghoul") {
                this.numGhouls = 1;
            }
        }

        return true;

        // <<-- /Creer-Merge: spawnUnit -->>
    }

    /**
     * Invalidation function for spawnWorker. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawnWorker(
        player: Player,
    ): void | string | TileSpawnWorkerArgs {
        // <<-- Creer-Merge: invalidate-spawnWorker -->>

        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (
            player.gold < this.game.unitJobs[0].goldCost ||
            player.mana < this.game.unitJobs[0].manaCost
        ) {
            return `You cannot afford to spawn a worker.`;
        }

        if (!this) {
            return `This tile does not exist!`;
        }

        if (!this.isWorkerSpawn) {
            return `This tile cannot spawn workers!`;
        }

        if (this.unit) {
            return `You cannot fit another worker on this tile!`;
        }

        // <<-- /Creer-Merge: invalidate-spawnWorker -->>
    }

    /**
     * Spawns a worker on the correct tile.
     *
     * @param player - The player that called this.
     * @returns True if successfully spawned, false otherwise.
     */
    protected async spawnWorker(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: spawnWorker -->>

        const goldCost = this.game.unitJobs[0].goldCost;
        const manaCost = this.game.unitJobs[0].manaCost;

        player.gold -= goldCost;
        player.mana -= manaCost;

        const unit = this.game.manager.create.unit({
            acted: false,
            health: this.game.unitJobs[0].health,
            owner: player,
            tile: this,
            job: this.game.unitJobs[0],
            title: "worker",
            moves: this.game.unitJobs[0].moves,
        });

        this.unit = unit;
        this.game.units.push(unit);
        player.units.push(unit);

        return true;

        // <<-- /Creer-Merge: spawnWorker -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

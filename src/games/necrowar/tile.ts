import { IBaseGameObjectRequiredData } from "~/core/game";
import { BaseTile } from "~/core/game/mixins/tiled";
import { ITileProperties, ITileResArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tower } from "./tower";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The type of Tile this is ('normal', 'path', 'river', 'mine', 'castle',
 * 'pathSpawn', or 'workerSpawn').
 */
export type TileType = "normal" | "path" | "river" | "mine" | "castle" | "pathSpawn" | "workerSpawn";

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject implements BaseTile {
    /**
     * The amount of corpses on this tile.
     */
    public corpses!: number;

    /**
     * Whether or not the tile is considered to be a gold mine or not.
     */
    public isGoldMine!: boolean;

    /**
     * Whether or not the tile is considered to be the island gold mine or not.
     */
    public isIslandGoldMine!: boolean;

    /**
     * Whether or not the tile is considered a path or not.
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
     * Whether or not the tile can be moved on by workers.
     */
    public isWall!: boolean;

    /**
     * The amount of Ghouls on this tile at the moment.
     */
    public numOfGhouls!: number;

    /**
     * The amount of Hell Hounds on this tile at the moment.
     */
    public numOfHounds!: number;

    /**
     * The amount of animated zombies on this tile at the moment.
     */
    public numOfZombies!: number;

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
     * The type of Tile this is ('normal', 'path', 'river', 'mine', 'castle',
     * 'pathSpawn', or 'workerSpawn').
     */
    public readonly type!: "normal" | "path" | "river" | "mine" | "castle" | "pathSpawn" | "workerSpawn";

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
        args: Readonly<ITileProperties>,
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
     * Invalidation function for res. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param number - Number of zombies on the tile that are being
     * resurrected.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateRes(
        player: Player,
        number: number,
    ): void | string | ITileResArgs {
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
        if (this.corpses < number) {
            return `${this} doesn't have ${number} corpses, it only has ${this.corpses}!`;
        }

        // Ensure number is positive
        if (number <= 0) {
            return `Why are you trying to ressurrect ${number} corpses?!`;
        }

        // Ensure the player has enough mana
        let cost = number * this.game.
        if (this.game.currentPlayer.mana < )

        // Ensure there isn't another unit currently on this tile


        // <<-- /Creer-Merge: invalidate-res -->>
    }

    /**
     * Resurrect the corpses on this tile into zombies.
     *
     * @param player - The player that called this.
     * @param number - Number of zombies on the tile that are being
     * resurrected.
     * @returns True if Unit was created successfully, false otherwise.
     */
    protected async res(player: Player, number: number): Promise<boolean> {
        // <<-- Creer-Merge: res -->>

        // Reduce player mana
        // Create stack of zombies
        // Remove corpses from tile

        // <<-- /Creer-Merge: res -->>
    }

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
        // tslint:disable-next-line:no-unsafe-any
        return BaseTile.prototype.getAdjacentDirection.call(this, adjacentTile);
    }

    /**
     * Gets a list of all the neighbors of this Tile.
     *
     * @returns An array of all adjacent tiles. Should be between 2 to 4 tiles.
     */
    public getNeighbors(): Tile[] {
        // tslint:disable-next-line:no-unsafe-any
        return BaseTile.prototype.getNeighbors.call(this);
    }

    public getNeighbor(direction: "North" | "South" | "East" | "West"): Tile;
    public getNeighbor(direction: string): Tile | undefined;

    /**
     * Gets a neighbor in a particular direction
     *
     * @param direction - The direction you want, must be
     * "North", "East", "South", or "West".
     * @returns The Tile in that direction, or undefined if there is none.
     */
    public getNeighbor(direction: string): Tile | undefined {
        // tslint:disable-next-line:no-unsafe-any
        return BaseTile.prototype.getNeighbor.call(this, direction);
    }

    /**
     * Checks if a Tile has another Tile as its neighbor.
     *
     * @param tile - The Tile to check.
     * @returns True if neighbor, false otherwise.
     */
    public hasNeighbor(tile: Tile | undefined): boolean {
        // tslint:disable-next-line:no-unsafe-any
        return BaseTile.prototype.hasNeighbor.call(this, tile);
    }

    /**
     * toString override.
     *
     * @returns A string representation of the Tile.
     */
    public toString(): string {
        // tslint:disable-next-line:no-unsafe-any
        return BaseTile.prototype.toString.call(this);
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

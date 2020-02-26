import { IBaseGameObjectRequiredData } from "~/core/game";
import { BaseTile } from "~/core/game/mixins/tiled";
import { ITileProperties, ITileSpawnMinerArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject implements BaseTile {
    /**
     * The amount of dirt on this Tile.
     */
    public dirt!: number;

    /**
     * Whether or not the tile is an indestructible base Tile.
     */
    public isBase!: boolean;

    /**
     * Whether or not this tile is about to fall.
     */
    public isFalling!: boolean;

    /**
     * Whether or not a hopper is placed on this Tile.
     */
    public isHopper!: boolean;

    /**
     * Whether or not a ladder is built on this Tile.
     */
    public isLadder!: boolean;

    /**
     * Whether or not a support is built on this Tile.
     */
    public isSupport!: boolean;

    /**
     * The amount of ore on this Tile.
     */
    public ore!: number;

    /**
     * The owner of this Tile, or undefined if owned by no-one. Only for bases
     * and hoppers.
     */
    public owner?: Player;

    /**
     * The amount of shielding on this Tile.
     */
    public shielding!: number;

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
     * An array of the Units on this Tile.
     */
    public units!: Unit[];

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
     * Invalidation function for spawnMiner. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawnMiner(
        player: Player,
    ): void | string | ITileSpawnMinerArgs {
        // <<-- Creer-Merge: invalidate-spawnMiner -->>

        // Check all the arguments for spawnMiner here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-spawnMiner -->>
    }

    /**
     * Spawns a Miner Unit on this Tile - Must be on the surface on their side
     * of the map.
     *
     * @param player - The player that called this.
     * @returns True if successfully spawned, false otherwise.
     */
    protected async spawnMiner(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: spawnMiner -->>

        // Add logic here for spawnMiner.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: spawnMiner -->>
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
        return BaseTile.prototype.getNeighbors.call(this) as Tile[];
    }

    /**
     * Gets a neighbor in a particular direction
     *
     * @param direction - The direction you want, must be
     * "North", "East", "South", or "West".
     * @returns The Tile in that direction, or undefined if there is none.
     */
    public getNeighbor(direction: "North" | "East" | "South" | "West"): Tile | undefined {
        // tslint:disable-next-line:no-unsafe-any
        return BaseTile.prototype.getNeighbor.call(this, direction) as Tile | undefined;
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

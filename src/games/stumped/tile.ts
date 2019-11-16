import { IBaseGameObjectRequiredData } from "~/core/game";
import { BaseTile } from "~/core/game/mixins/tiled";
import { ITileProperties } from "./";
import { Beaver } from "./beaver";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Spawner } from "./spawner";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The cardinal direction water is flowing on this Tile ('North', 'East',
 * 'South', 'West').
 */
export type TileFlowDirection = "North" | "East" | "South" | "West" | "";

/**
 * What type of Tile this is, either 'water' or 'land'.
 */
export type TileType = "land" | "water";

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject implements BaseTile {
    /**
     * The Beaver on this Tile if present, otherwise undefined.
     */
    public beaver?: Beaver;

    /**
     * The number of branches dropped on this Tile.
     */
    public branches!: number;

    /**
     * The cardinal direction water is flowing on this Tile ('North', 'East',
     * 'South', 'West').
     */
    public readonly flowDirection!: "North" | "East" | "South" | "West" | "";

    /**
     * The number of food dropped on this Tile.
     */
    public food!: number;

    /**
     * The owner of the Beaver lodge on this Tile, if present, otherwise
     * undefined.
     */
    public lodgeOwner?: Player;

    /**
     * The resource Spawner on this Tile if present, otherwise undefined.
     */
    public spawner?: Spawner;

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
     * What type of Tile this is, either 'water' or 'land'.
     */
    public readonly type!: "land" | "water";

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

    /**
     * Checks if a tile is in flow with another tile
     *
     * @param tile - the tile to check in flow with
     * @returns boolean if this tile is in flow with the provided tile
     */
    public isInFlowDirection(tile: Tile): boolean {
        return Boolean(
            tile &&
            this.flowDirection !== "" &&
            this.getNeighbor(this.flowDirection) === tile,
        );
    }

    /**
     * Checks if a tile is in flow with another tile
     *
     * @param tile - the tile to check in flow with
     * @returns boolean if this tile is in flow with the provided tile
     */
    public isAgainstFlowDirection(tile: Tile): boolean {
        if (!tile.flowDirection) {
            return false;
        }

        return Boolean(
            tile &&
            this.getNeighbor(
                this.game.invertTileDirection(tile.flowDirection) || "",
            ) === tile,
        );
    }

    /**
     * Gets the cost to move from this tile to another tile
     *
     * @param tile - other tile to check against
     * @returns  NaN if this Tile and the passed in ones are not neighbors and
     * thus can never have a bonus. 2 if flow direction does not matter, 1 if
     * same direction bonus, 3 if against direction bonus.
     */
    public getMovementCost(tile: Tile): number {
        if (this.hasNeighbor(tile)) {
            if (this.isInFlowDirection(tile)) {
                return 1; // same direction, bonus -1
            }
            else if (this.isAgainstFlowDirection(tile)) {
                return 3; // against direction, bonus +1
            }
            else {
                return 2; // neighbor with no flow, so no bonus +0
            }
        }

        return NaN;
    }

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

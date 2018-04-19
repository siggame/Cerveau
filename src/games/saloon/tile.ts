import { IBaseGameObjectRequiredData } from "~/core/game";
import { ITileProperties } from "./";
import { Bottle } from "./bottle";
import { Cowboy } from "./cowboy";
import { Furnishing } from "./furnishing";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { YoungGun } from "./young-gun";

import { BaseTile } from "~/core/game/mixins/tiled";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface ITileConstructorArgs
extends IGameObjectConstructorArgs, ITileProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject implements BaseTile {
    /**
     * The beer Bottle currently flying over this Tile, null otherwise.
     */
    public bottle?: Bottle;

    /**
     * The Cowboy that is on this Tile, null otherwise.
     */
    public cowboy?: Cowboy;

    /**
     * The furnishing that is on this Tile, null otherwise.
     */
    public furnishing?: Furnishing;

    /**
     * If this Tile is pathable, but has a hazard that damages Cowboys that path
     * through it.
     */
    public hasHazard!: boolean;

    /**
     * If this Tile is a balcony of the Saloon that YoungGuns walk around on,
     * and can never be pathed through by Cowboys.
     */
    public isBalcony!: boolean;

    /**
     * The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the
     * map.
     */
    public readonly tileEast?: Tile;

    /**
     * The Tile to the 'North' of this one (x, y-1). Null if out of bounds of
     * the map.
     */
    public readonly tileNorth?: Tile;

    /**
     * The Tile to the 'South' of this one (x, y+1). Null if out of bounds of
     * the map.
     */
    public readonly tileSouth?: Tile;

    /**
     * The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the
     * map.
     */
    public readonly tileWest?: Tile;

    /**
     * The x (horizontal) position of this Tile.
     */
    public readonly x!: number;

    /**
     * The y (vertical) position of this Tile.
     */
    public readonly y!: number;

    /**
     * The YoungGun on this tile, null otherwise.
     */
    public youngGun?: YoungGun;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Tile is created.
     *
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: ITileConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * gets the adjacent direction between this tile and an adjacent tile (if one exists)
     *
     * @param adjacentTile A tile that should be adjacent to this tile
     * @returns The string direction, or undefined if the
     * tile is invalid, or there is no adjacent direction between this tile
     * and that tile
     * ("North", "East", "South", or "West") if found in that direction,
     * undefined otherwise
     */
    public getAdjacentDirection(adjacentTile: Tile | undefined): string | undefined {
        return BaseTile.prototype.getAdjacentDirection.call(this, adjacentTile);
    }

    /**
     * Gets a list of all the neighbors of this tile
     *
     * @returns An array of all adjacent tiles. Should be between 2 to 4 tiles.
     */
    public getNeighbors(): Tile[] {
        return BaseTile.prototype.getNeighbors.call(this);
    }

    public getNeighbor(direction: "North" | "South" | "East" | "West"): Tile;
    public getNeighbor(direction: string): Tile | undefined;

    /**
     * Gets a neighbor in a particular direction
     *
     * @param direction The direction you want, must be "North", "East", "South", or "West"
     * @returns The Tile in that direction, null if none
     */
    public getNeighbor(direction: string): Tile | undefined {
        return BaseTile.prototype.getNeighbor.call(this, direction);
    }

    /**
     * Checks if a Tile has another tile as its neighbor
     *
     * @param tile - tile to check
     * @returns true if neighbor, false otherwise
     */
    public hasNeighbor(tile: Tile | undefined): boolean {
        return BaseTile.prototype.hasNeighbor.call(this, tile);
    }

    /**
     * toString override
     *
     * @returns a string representation of the Tile
     */
    public toString(): string {
        return BaseTile.prototype.toString.call(this);
    }

    // <<-- Creer-Merge: functions -->>

    /**
     * Checks if this tile would cause a Bottle moving to it to break
     *
     * @return True if bottle break on this tile, false otherwise
     */
    public isPathableToBottles(): boolean {
        return Boolean(!this.isBalcony && !this.furnishing && !this.cowboy);
    }

    // <<-- /Creer-Merge: functions -->>
}

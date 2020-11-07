import { BaseGameObjectRequiredData } from "~/core/game";
import { BaseTile } from "~/core/game/mixins/tiled";
import { TileConstructorArgs } from "./";
import { Bomb } from "./bomb";
import { GameObject } from "./game-object";
import { Miner } from "./miner";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
import { removeElements } from "@cadre/ts-utils";
// <<-- /Creer-Merge: imports -->>

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject implements BaseTile {
    /**
     * An array of Bombs on this Tile.
     */
    public bombs!: Bomb[];

    /**
     * The amount of dirt on this Tile.
     */
    public dirt!: number;

    /**
     * Whether or not the Tile is a base Tile.
     */
    public isBase!: boolean;

    /**
     * Whether or not this Tile is about to fall after this turn.
     */
    public isFalling!: boolean;

    /**
     * Whether or not a hopper is on this Tile.
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
     * An array of the Miners on this Tile.
     */
    public miners!: Miner[];

    /**
     * The amount of ore on this Tile.
     */
    public ore!: number;

    /**
     * The owner of this Tile, or undefined if owned by no-one.
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

    /**
     * Function to set a tile to isFalling if necessary.
     */
    public checkFalling(): void {
        if (this.dirt + this.ore <= 0) {
            return;
        }

        const tileBelow = this.tileSouth;

        // Check that the tile is floating, with no dirt or ore below
        if (tileBelow && tileBelow.ore + tileBelow.dirt <= 0) {
            const supportEast = tileBelow.tileEast;
            const supportSouth = tileBelow;
            const supportWest = tileBelow.tileWest;

            // Check that there is not support below, directly or to the side
            // Or that there is a ladder directly below
            if (
                (supportEast && supportEast.isSupport) ||
                (supportSouth && supportSouth.isSupport) ||
                (supportWest && supportWest.isSupport) ||
                (supportSouth && supportSouth.isLadder)
            ) {
                return;
            }

            this.isFalling = true;
        }
    }

    /**
     * Helper function to apply gravity to a tile.
     */
    public applyGravity(): void {
        if (this.isLadder) {
            return;
        }
        
        let southTile = this.tileSouth;
        let toMove = this as Tile;
        let distance = 0;
        while (
            southTile &&
            southTile.dirt + southTile.ore <= 0 &&
            !southTile.isLadder &&
            !southTile.isSupport
        ) {
            if (this.ore + this.dirt > 0) {
                // Filled tiles are caught by supports on their sides
                if (
                    (southTile.tileEast && southTile.tileEast.isSupport) ||
                    (southTile.tileWest && southTile.tileWest.isSupport)
                ) {
                    break;
                }
            }
            toMove = southTile;
            southTile = southTile.tileSouth;
            distance++;
        }

        if (distance > 0) {
            toMove.dirt = this.dirt;
            toMove.ore = this.ore;
            this.dirt = 0;
            this.ore = 0;
            toMove.isSupport = this.isSupport;
            this.isSupport = false;
            toMove.shielding = this.shielding;
            this.shielding = 0;

            this.miners.forEach((m) => {
                m.takeFallDamage(distance);
                m.tile = toMove;
            });
            toMove.miners.push(...this.miners);
            removeElements(this.miners, ...this.miners);

            this.bombs.forEach((b) => {
                b.tile = toMove;
            });
            toMove.bombs.push(...this.bombs);
            removeElements(this.bombs, ...this.bombs);
        }

        this.isFalling = false;
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
     * Gets a neighbor in a particular direction.
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
     * Override for `toString` for easier debugging.
     *
     * @returns A string representation of the Tile.
     */
    public toString(): string {
        return BaseTile.prototype.toString.call(this);
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

// tslint:disable:max-classes-per-file = because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface = because the some mixins have nothing to add

import { BaseGameObject, IBasePlayer } from "~/core/game";
import { IAnyObject } from "~/utils";
import * as Base from "./base";

export const TILE_DIRECTIONS: [ "North", "South", "East", "West" ] = [ "North", "South", "East", "West" ];

export interface ITiledPlayer extends IBasePlayer {}

export abstract class BaseTile extends BaseGameObject {
    public readonly x!: number;
    public readonly y!: number;

    public readonly tileNorth?: BaseTile;
    public readonly tileEast?: BaseTile;
    public readonly tileSouth?: BaseTile;
    public readonly tileWest?: BaseTile;

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
    public getAdjacentDirection(adjacentTile: BaseTile | undefined): string | undefined {
        if (adjacentTile) {
            for (const direction of TILE_DIRECTIONS) {
                if (this.getNeighbor(direction) === adjacentTile) {
                    return direction;
                }
            }
        }
    }

    /**
     * Gets a list of all the neighbors of this tile
     *
     * @returns An array of all adjacent tiles. Should be between 2 to 4 tiles.
     */
    public getNeighbors(): BaseTile[] {
        const neighbors = new Array<BaseTile>();

        for (const direction of TILE_DIRECTIONS) {
            const neighbor = this.getNeighbor(direction);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * Gets a neighbor in a particular direction
     *
     * @param direction The direction you want, must be "North", "East", "South", or "West"
     * @returns The Tile in that direction, null if none
     */
    public getNeighbor(direction: "North" | "South" | "East" | "West"): BaseTile {
        return (this as any)[`tile${direction}`];
    }

    /**
     * Checks if a Tile has another tile as its neighbor
     *
     * @param tile - tile to check
     * @returns true if neighbor, false otherwise
     */
    public hasNeighbor(tile: BaseTile | undefined): boolean {
        return Boolean(this.getAdjacentDirection(tile));
    }
}

/**
 * A game that has a grid based map of tiles. This handles creating that initial
 * map and hooking it up. That's it
 * @param base The BaseGame (or sub BaseGame) to mix in tiled logic
 * @returns a new BaseGame class with Tiled logic mixed in
 */
// tslint:disable-next-line:typedef - because it will be a weird mixin type inferred from the return statement
export function mixTiled<
    TBaseAI extends Base.BaseAIConstructor,
    TBaseGame extends Base.BaseGameConstructor,
    TBaseGameManager extends Base.BaseGameManagerConstructor,
    TBaseGameObject extends Base.BaseGameObjectConstructor,
    TBaseGameSettings extends Base.BaseGameSettingsManagerConstructor
>(base: {
    AI: TBaseAI,
    Game: TBaseGame,
    GameManager: TBaseGameManager,
    GameObject: TBaseGameObject,
    GameSettings: TBaseGameSettings,
}) {
    class TiledGameSettings extends base.GameSettings {
        public schema = this.makeSchema({
            ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it
            mapWidth: {
                default: 32,
                min: 2,
                description: "The width (in Tiles) for the game map to be initialized to.",
            },
            mapHeight: {
                default: 16,
                min: 2,
                description: "The height (in Tiles) for the game map to be initialized to.",
            },
        });

        public values = this.initialValues(this.schema);

        protected invalidate(someSettings: IAnyObject): IAnyObject | Error {
            const invalidated = super.invalidate(someSettings);
            if (invalidated instanceof Error) {
                return invalidated;
            }

            const settings = { ...this.values, ...someSettings, ...invalidated };

            if (settings.mapWidth < 1) {
                return new Error(`Map height invalid: ${settings.mapWidth}. Must be > 1`);
            }

            if (settings.mapHeight < 1) {
                return new Error(`Map width invalid: ${settings.mapHeight}. Must be > 1`);
            }

            return settings;
        }
    }

    class TiledGame extends base.Game {
        // client <--> server properties
        public readonly tiles!: BaseTile[];
        public readonly mapWidth!: number;
        public readonly mapHeight!: number;

        // server-side only
        public readonly tileDirections = TILE_DIRECTIONS;

        constructor(...args: any[]) {
            super(...args);

            this.tiles.length = this.mapWidth * this.mapHeight;

            // create each tile
            for (let x = 0; x < this.mapWidth; x++) {
                for (let y = 0; y < this.mapHeight; y++) {
                    this.tiles[x + y * this.mapWidth] = (this.manager.create as any).Tile({x, y});
                                                        // any because we don't mix a new BaseGameObject Factory,
                                                        // however all managers will have a Tile so no worries (I hope)
                }
            }

            // now hook up their neighbors
            for (let x = 0; x < this.mapWidth; x++) {
                for (let y = 0; y < this.mapHeight; y++) {
                    const tile = this.getTile(x, y) as any;

                    tile.tileNorth = this.getTile(x, y - 1);
                    tile.tileEast = this.getTile(x + 1, y);
                    tile.tileSouth = this.getTile(x, y + 1);
                    tile.tileWest = this.getTile(x - 1, y);
                }
            }
        }

        /**
         * Gets the tile at (x, y), or undefined if the co-ordinates are off-map
         *
         * @param x the x position of the desired tile
         * @param y the y position of the desired tile
         * @returns the Tile at (x, y) if valid, null otherwise
         */
        public getTile(x: number, y: number): BaseTile | undefined {
            return this.tiles[x + y * this.mapWidth];
        }

        /**
         * Inverts a direction string, e.g. "North" -> "South"
         *
         * @param direction - the direction string to invert
         * @returns the direction inverted,
         * e.g. "East" -> "West", undefined if the direction was not a valid direction string
         */
        public invertTileDirection(
            direction: "North" | "South" | "East" | "West",
        ): "North" | "South" | "East" | "West" {
            switch (direction) {
                case "North": return "South";
                case "East": return "West";
                case "South": return "North";
                case "West": return "East";
            }
        }
    }

    return {
        ...base,
        Game: TiledGame,
        GameSettings: TiledGameSettings,
    };
}

// tslint:disable:max-classes-per-file = because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface = because the some mixins have nothing to add

import { IBaseGameSettings, IBasePlayer, IGameSettingsDescriptions } from "~/core/game";
import * as Base from "./base";

export const TILE_DIRECTIONS: [ "North", "South", "East", "West" ] = [ "North", "South", "East", "West" ];

export interface ITiledPlayer extends IBasePlayer {}

export interface ITiledGameSettings extends IBaseGameSettings {
    mapWidth: number;
    mapHeight: number;
}

// TODO: map width/height game setting

/**
 * A game that has a grid based map of tiles. This handles creating that initial
 * map and hooking it up. That's it
 * @mixin
 * @param base The BaseGame (or sub BaseGame) to mix in tiled logic
 * @returns a new BaseGame class with Tiled logic mixed in
 */
// tslint:disable-next-line:typedef - because it will be a weird mixin type inferred from the return statement
export function mixTiled<
    TBaseAI extends Base.BaseAIConstructor,
    TBaseGame extends Base.BaseGameConstructor,
    TBaseGameManager extends Base.BaseGameManagerConstructor,
    TBaseGameObject extends Base.BaseGameObjectConstructor,
    TBaseGameSettings extends Base.BaseGameSettingsConstructor
>(base: {
    AI: TBaseAI,
    Game: TBaseGame,
    GameManager: TBaseGameManager,
    GameObject: TBaseGameObject,
    GameSettings: TBaseGameSettings,
}) {
    class TiledGameSettings extends base.GameSettings {
        public get defaults(): ITiledGameSettings {
            return {
                ...super.defaults,
                mapWidth: 32,
                mapHeight: 16,
            };
        }

        public get descriptions(): IGameSettingsDescriptions<ITiledGameSettings> {
            return {
                ...super.descriptions,
                mapWidth: "The width (in Tiles) for the game map to be initialized to.",
                mapHeight: "The height (in Tiles) for the game map to be initialized to.",
            };
        }

        public invalidate(settings: ITiledGameSettings): string | undefined {
            const invalid = super.invalidate(settings);
            if (invalid) {
                return invalid;
            }

            for (const dim of ["Width", "Height"]) {
                const size = Number((settings as any)[`map${dim}`]);
                if (isNaN(size) || size < 0) {
                    return `${size} is not a valid size for the map's ${dim.toLowerCase()}.`;
                }
            }
        }
    }

    class TiledTile extends base.GameObject {
        public x: number = 0;
        public y: number = 0;

        public tileNorth?: TiledTile;
        public tileEast?: TiledTile;
        public tileSouth?: TiledTile;
        public tileWest?: TiledTile;

        /**
         * gets the adjacent direction between this tile and an adjacent tile (if one exists)
         *
         * @param {Tile} adjacentTile - A tile that should be adjacent to this tile
         * @returns {string|undefined} The string direction, or undefined if the
         * tile is invalid, or there is no adjacent direction between this tile
         * and that tile
         * ("North", "East", "South", or "West") if found in that direction,
         * undefined otherwise
         */
        public getAdjacentDirection(adjacentTile: TiledTile | undefined): string | undefined {
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
         * @returns {Array.<Tile>} array of all adjacent tiles. Should be between 2 to 4 tiles.
         */
        public getNeighbors(): TiledTile[] {
            const neighbors = new Array<TiledTile>();

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
         * @param {string} direction - the direction you want, must be "North",
         * "East", "South", or "West"
         * @returns {Tile|null} The Tile in that direction, null if none
         */
        public getNeighbor(direction: "North" | "South" | "East" | "West"): TiledTile | undefined {
            return (this as any)["tile" + direction];
        }

        /**
         * Checks if a Tile has another tile as its neighbor
         * @param {Tile} tile - tile to check
         * @returns {Boolean} true if neighbor, false otherwise
         */
        public hasNeighbor(tile: TiledTile | undefined): boolean {
            return Boolean(this.getAdjacentDirection(tile));
        }

        /**
         * toString() override
         * @returns {string} a string representation of the tile
         */
        public toString(): string {
            return `${this.gameObjectName} (${this.x}, ${this.y}) #${this.id}`;
        }
    }

    class TiledGame extends base.Game {
        // client <--> server properties
        public readonly tiles: TiledTile[] = [];
        public readonly mapWidth: number = 40;
        public readonly mapHeight: number = 20;

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
                    const tile = this.getTile(x, y) as TiledTile;

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
         * @param {number} x the x position of the desired tile
         * @param {number} y the y position of the desired tile
         * @returns {Tile|undefined} the Tile at (x, y) if valid, null otherwise
         */
        public getTile(x: number, y: number): TiledTile | undefined {
            return this.tiles[x + y * this.mapWidth];
        }

        /**
         * Inverts a direction string, e.g. "North" -> "South"
         *
         * @param {string} direction - the direction string to invert
         * @returns {string|undefined} the direction inverted,
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
        Tile: TiledTile,
    };
}

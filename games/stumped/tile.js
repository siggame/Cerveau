// Tile: A Tile in the game that makes up the 2D map grid.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const TiledTile = require(`${__basedir}/gameplay/shared/tiledTile`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Tile: A Tile in the game that makes up the 2D map grid.
let Tile = Class(GameObject, TiledTile, {
    /**
     * Initializes Tiles.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The beaver on this tile if present, otherwise null.
         *
         * @type {Beaver}
         */
        this.beaver = this.beaver || null;

        /**
         * The number of branches dropped on this tile.
         *
         * @type {number}
         */
        this.branches = this.branches || 0;

        /**
         * The number of fish dropped on this tile.
         *
         * @type {number}
         */
        this.fish = this.fish || 0;

        /**
         * The cardinal direction water is flowing on this tile ('North', 'East', 'South', 'West').
         *
         * @type {string}
         */
        this.flowDirection = this.flowDirection || "";

        /**
         * The owner of the beaver lodge on this tile, if present, otherwise null.
         *
         * @type {Player}
         */
        this.lodgeOwner = this.lodgeOwner || null;

        /**
         * The resource spawner on this tile if present, otherwise null.
         *
         * @type {Spawner}
         */
        this.spawner = this.spawner || null;

        /**
         * The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the map.
         *
         * @type {Tile}
         */
        this.tileEast = this.tileEast || null;

        /**
         * The Tile to the 'North' of this one (x, y-1). Null if out of bounds of the map.
         *
         * @type {Tile}
         */
        this.tileNorth = this.tileNorth || null;

        /**
         * The Tile to the 'South' of this one (x, y+1). Null if out of bounds of the map.
         *
         * @type {Tile}
         */
        this.tileSouth = this.tileSouth || null;

        /**
         * The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the map.
         *
         * @type {Tile}
         */
        this.tileWest = this.tileWest || null;

        /**
         * What type of Tile this is, either 'Water' or 'Land'.
         *
         * @type {string}
         */
        this.type = this.type || "";

        /**
         * The x (horizontal) position of this Tile.
         *
         * @type {number}
         */
        this.x = this.x || 0;

        /**
         * The y (vertical) position of this Tile.
         *
         * @type {number}
         */
        this.y = this.y || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Tile",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Checks if a tile is in flow with another tile
     *
     * @param {Tile} tile - the tile to ceck in flow with
     * @returns {bool} boolean if this tile is in flow with the provided tile
     */
    isInFlowDirection: function(tile) {
        return Boolean(tile && this.getNeighbor(this.flowDirection) === tile);
    },

    /**
     * Checks if a tile is in flow with another tile
     *
     * @param {Tile} tile - the tile to ceck in flow with
     * @returns {bool} boolean if this tile is in flow with the provided tile
     */
    isAgainstFlowDirection: function(tile) {
        return Boolean(tile && this.getNeighbor(this.game.invertTileDirection(tile.flowDirection) === tile));
    },

    /**
     * Gets the cost to move from this tile to another tile
     *
     * @param {Tile} tile - other tile to check against
     * @return {number} NaN if this Tile and the passed in ones are not neighbors and thus can never have a bonus. 2 if flow direction does not matter, 1 if same direction bonus, 3 if against direction bonus
     */
    getMovementCost: function(tile) {
        if(this.hasNeighbor(tile)) {
            if(this.isInFlowDirection(tile)) {
                return 1; // same direction, bonus -1
            }
            else if(this.isAgainstFlowDirection(tile)) {
                return 3; // against direction, bonus +1
            }
            else {
                return 2; // neighbor with no flow, so no bonus +0
            }
        }

        return NaN;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Tile;

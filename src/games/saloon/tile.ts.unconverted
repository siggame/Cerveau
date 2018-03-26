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
         * The beer Bottle currently flying over this Tile.
         *
         * @type {Bottle}
         */
        this.bottle = this.bottle || null;

        /**
         * The Cowboy that is on this Tile, null otherwise.
         *
         * @type {Cowboy}
         */
        this.cowboy = this.cowboy || null;

        /**
         * The furnishing that is on this Tile, null otherwise.
         *
         * @type {Furnishing}
         */
        this.furnishing = this.furnishing || null;

        /**
         * If this Tile is pathable, but has a hazard that damages Cowboys that path through it.
         *
         * @type {boolean}
         */
        this.hasHazard = this.hasHazard || false;

        /**
         * If this Tile is a balcony of the Saloon that YoungGuns walk around on, and can never be pathed through by Cowboys.
         *
         * @type {boolean}
         */
        this.isBalcony = this.isBalcony || false;

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

        /**
         * The YoungGun on this tile, null otherwise.
         *
         * @type {YoungGun}
         */
        this.youngGun = this.youngGun || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Tile",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Checks if this tile would cause a Bottle moving to it to break
     *
     * @return {Boolean} true if bottle break on this tile, false otherwise
     */
    isPathableToBottles: function() {
        return Boolean(!this.isBalcony && !this.furnishing && !this.cowboy);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Tile;

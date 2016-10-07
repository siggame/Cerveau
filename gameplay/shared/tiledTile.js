// The base Tile for TiledGames, basically helpful server side functions for Tiles

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");

var TiledTile = Class({
    /**
     * gets the adjacent direction between this tile and an adjacent tile (if one exists)
     *
     * @param {Tile} adjacentTile - A tile that should be adjacent to this tile
     * @returns {string|undefined} The string direction ("North", "East", "South", or "West") if found in that direction, undefined otherwise
     */
    adjacentDirection: function(adjacentTile) {
        for(var i = 0; i < this.game.tileDirections.length; i++) {
            var dir = this.game.tileDirections[i];
            if(this.getNeighbor(dir) === adjacentTile) {
                return dir;
            }
        }
    },

    /**
     * Gets a list of all the neighbors of this tile
     *
     * @returns {Array.<Tile>} array of all adjacent tiles. Should be between 2 to 4 tiles.
     */
    getNeighbors: function() {
        var neighbors = [];

        for(var i = 0; i < this.game.tileDirections.length; i++) {
            var neighbor = this.getNeighbor(this.game.tileDirections[i]);
            if(neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    },

    /**
     * Gets a neighbor in a particular direction
     *
     * @param {string} direction - the direction you want, must be "North", "East", "South", or "West"
     * @returns {Tile|null} The Tile in that directiom, null if none
     */
    getNeighbor: function(direction) {
        return this["tile" + direction];
    },

    /**
     * String coercion override
     *
     * @override
     */
    toString: function() {
        return "{gameObjectName} ({x}, {y}) #{id}".format(this);
    },
});

module.exports = TiledTile;

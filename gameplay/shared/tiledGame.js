var Class = require(__basedir + "/utilities/class");
var BaseGame = require("./baseGame");

/**
 * @class TiledGame - a game that has a grid based map of tiles. This handles creating that initial map and hooking it up. That's it
 */
var TiledGame = Class(BaseGame, {
    init: function() {
        BaseGame.init.apply(this, arguments);

        this._addProperty("mapWidth", 0);
        this._addProperty("mapHeight", 0);
        this._addProperty("tiles", []);
    },

    /**
     * Initialized the map, which means all the Tiles. Call this once you've set mapWidth and mapHeight. If you wish to add data to Tiles on their creation override _createTile(data).
     */
    _initMap: function() {
        this._tilesMap = []; // TODO: should probably expose the map as a 2D array once all client support multi-dimensional objects
        for(var x = 0; x < this.mapWidth; x++) {
            this._tilesMap[x] = [];
            for(var y = 0; y < this.mapHeight; y++) {
                var tile = this._createTile({
                    x: x,
                    y: y,
                });

                this._tilesMap[x][y] = tile;
                this.tiles.push(tile);
            }
        }

        // now all the tiles are created, so hook up their neighbors. Ideally neightbors never change so a delta is never sent after the initial state so this doesn't impact performance much, but it super handy for competitors.
        for(var x = 0; x < tile.mapWidth; x++) {
            for(var y = 0; y < this.mapHeight; y++) {
                var tile = this._tilesMap[x][y];
                tile.tileAbove = this._getTile(x, y - 1);
                tile.tileRight = this._getTile(x + 1, y);
                tile.tileBelow = this._getTile(x, y + 1);
                tile.tileLeft = this._getTile(x - 1, y);
            }
        }
    },

    /**
     * gets the tile at (x, y), or null if the co-ordinates are off-map
     *
     * @param {number} x - x position of the desired tile
     * @param {number} y - y position of the desired tile
     * @returns {Tile|null} the Tile at (x, y) if valid, null otherwise
     */
    _getTile: function(x, y) {
        if(x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            return this._tilesMap[x][y];
        }

        return null;
    },

    /**
     * Exposed so sub classes can override this to add any initialization data as needed.
     *
     * @param {Object} data - the initialization data for the new tile. Feel free to dump values into it.
     * @returns {Tile} the newly created tile in the game.
     */
    _createTile: function(data) {
        return this.create("Tile", data);
    },
});

module.exports = TiledGame;

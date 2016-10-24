// Game: Use cowboys to have a good time and play some music on a Piano, while brawling with enemy Cowboys.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var TwoPlayerGame = require(__basedir + "/gameplay/shared/twoPlayerGame");
var TurnBasedGame = require(__basedir + "/gameplay/shared/turnBasedGame");
var TiledGame = require(__basedir + "/gameplay/shared/tiledGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Game: Use cowboys to have a good time and play some music on a Piano, while brawling with enemy Cowboys.
var Game = Class(TwoPlayerGame, TurnBasedGame, TiledGame, {
    /**
     * Initializes Games.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        TiledGame.init.apply(this, arguments);
        TurnBasedGame.init.apply(this, arguments);
        TwoPlayerGame.init.apply(this, arguments);

        /**
         * All the beer Bottles currently flying across the saloon in the game.
         *
         * @type {Array.<Bottle>}
         */
        this.bottles = this.bottles || [];

        /**
         * How much damage is applied to neighboring things bit by the Sharpshooter between turns.
         *
         * @type {number}
         */
        this.brawlerDamage = this.brawlerDamage || 0;

        /**
         * Every Cowboy in the game.
         *
         * @type {Array.<Cowboy>}
         */
        this.cowboys = this.cowboys || [];

        /**
         * The player whose turn it is currently. That player can send commands. Other players cannot.
         *
         * @type {Player}
         */
        this.currentPlayer = this.currentPlayer || null;

        /**
         * The current turn number, starting at 0 for the first player's turn.
         *
         * @type {number}
         */
        this.currentTurn = this.currentTurn || 0;

        /**
         * Every furnishing in the game.
         *
         * @type {Array.<Furnishing>}
         */
        this.furnishings = this.furnishings || [];

        /**
         * A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
         *
         * @type {Object.<string, GameObject>}
         */
        this.gameObjects = this.gameObjects || {};

        /**
         * All the jobs that Cowboys can be called in with.
         *
         * @type {Array.<string>}
         */
        this.jobs = this.jobs || [];

        /**
         * The number of Tiles in the map along the y (vertical) axis.
         *
         * @type {number}
         */
        this.mapHeight = this.mapHeight || 0;

        /**
         * The number of Tiles in the map along the x (horizontal) axis.
         *
         * @type {number}
         */
        this.mapWidth = this.mapWidth || 0;

        /**
         * The maximum number of Cowboys a Player can bring into the saloon of each specific job.
         *
         * @type {number}
         */
        this.maxCowboysPerJob = this.maxCowboysPerJob || 0;

        /**
         * The maximum number of turns before the game will automatically end.
         *
         * @type {number}
         */
        this.maxTurns = this.maxTurns || 0;

        /**
         * List of all the players in the game.
         *
         * @type {Array.<Player>}
         */
        this.players = this.players || [];

        /**
         * When a player's rowdyness reaches or exceeds this number their Cowboys take a collective siesta.
         *
         * @type {number}
         */
        this.rowdynessToSiesta = this.rowdynessToSiesta || 0;

        /**
         * A unique identifier for the game instance that is being played.
         *
         * @type {string}
         */
        this.session = this.session || "";

        /**
         * How much damage is applied to things hit by Sharpshooters when they act.
         *
         * @type {number}
         */
        this.sharpshooterDamage = this.sharpshooterDamage || 0;

        /**
         * How long siestas are for a player's team.
         *
         * @type {number}
         */
        this.siestaLength = this.siestaLength || 0;

        /**
         * All the tiles in the map, stored in Row-major order. Use `x + y * mapWidth` to access the correct index.
         *
         * @type {Array.<Tile>}
         */
        this.tiles = this.tiles || [];


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // map dimensions used for tile generation
        this.mapWidth = 22;
        this.mapHeight = 12;

        // game constants
        this.rowdynessToSiesta = 8;
        this.siestaLength = 8;
        this.maxCowboysPerJob = 2;
        this.sharpshooterDamage = 4;
        this.brawlerDamage = 1;

        this.jobs.push(
            "Sharpshooter",
            "Bartender",
            "Brawler"
        );

        // these settings are all per side
        this._minFurnishings = 0;
        this._maxFurnishings = 5;
        this._minPianos = 1;
        this._maxPianos = this.jobs.length; // the max number of pianos is the same as the number of jobs, therefore at least half the cowboys spawned can't play pianos as there will always be more possible cowboys than pianos
        this._minHazards = 0;
        this._maxHazards = 6;

        // list of cowboys to add to their cowboy lists between turns (so we don't resize arrays during players turns)
        this.spawnedCowboys = [];

        //<<-- /Creer-Merge: init -->>
    },

    name: "Saloon",

    aliases: [
        //<<-- Creer-Merge: aliases -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        "MegaMinerAI-18-Saloon",
        //<<-- /Creer-Merge: aliases -->>
    ],



    /**
     * This is called when the game begins, once players are connected and ready to play, and game objects have been initialized. Anything in init() may not have the appropriate game objects created yet..
     */
    begin: function() {
        TiledGame.begin.apply(this, arguments);
        TurnBasedGame.begin.apply(this, arguments);
        TwoPlayerGame.begin.apply(this, arguments);

        //<<-- Creer-Merge: begin -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        TiledGame._initMap.call(this);

        // make top and bottom sides walls
        for(var x = 0; x < this.mapWidth; x++) {
            this.getTile(x, 0).isBalcony = true;
            this.getTile(x, this.mapHeight - 1).isBalcony = true;
        }

        // make left and right sides walls
        for(var y = 0; y < this.mapHeight; y++) {
            this.getTile(0, y).isBalcony = true;
            this.getTile(this.mapWidth - 1, y).isBalcony = true;
        }

        // spawn some random furnishings in quadrants
        var numFurnishings = Math.randomInt(this._maxFurnishings, this._minFurnishings)*2; // *2 for each side
        var numPianos = Math.randomInt(this._maxPianos, this._minPianos)*2;
        var numHazards = Math.randomInt(this._maxHazards, this._minHazards)*2;
        while(numFurnishings > 0 || numPianos > 0 || numHazards > 0) { // while there is stuff to spawn
            while(true) { // get a random tile on this side that is empty
                x = Math.randomInt(this.mapWidth/2 - 1, 1);
                y = Math.randomInt(this.mapHeight - 2, 1);

                if(!this.getTile(x, y).furnishing) {
                    break; // because we found a tile that does not have a furnishing to spawn one on, else we continue our random search
                }
            }

            for(var side = 0; side < 2; side++) { // for each side (left and right)
                if(side === 1) { // if the right side, invert the x, y coordinate
                    x = this.mapWidth - x - 1;
                    y = this.mapHeight - y - 1;
                }

                if(numHazards > 0) { // if there are hazards to spawn
                    numHazards--;
                    this.getTile(x, y).hasHazard = true; // "spawn" it by setting that tile's hasHazard to true
                }
                else { // need to spawn a furnishing
                    this.create("Furnishing", {
                        tile: this.getTile(x, y),
                        isPiano: numPianos > 0, // if there are pianos to spawn make it one, else false and thus it is not a piano
                    });

                    if(numPianos > 0) { // decrement whatever we spawned
                        numPianos--;
                    }
                    else {
                        numFurnishings--;
                    }
                }
            }
        }

        // create the players' Young Guns
        for(var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            x = 0;
            y = 0;
            var dy = 1;
            if(i > 0) { // then change x, y for the second player
                x = this.mapWidth - 1;
                y = this.mapHeight - 1;
                dy = -1;
            }

            player.youngGun = this.create("YoungGun", {
                owner: player,
                tile: this.getTile(x, y + dy),
                canCallIn: true,
            });

            player.youngGun.previousTile = this.getTile(x, y + dy*2); // used for moving the young guns around the map, but not a property exposed to clients

            this._doYoungGun(player);
        }

        //<<-- /Creer-Merge: begin -->>
    },

    /**
     * This is called when the game has started, after all the begin()s. This is a good spot to send orders.
     */
    _started: function() {
        TiledGame._started.apply(this, arguments);
        TurnBasedGame._started.apply(this, arguments);
        TwoPlayerGame._started.apply(this, arguments);

        //<<-- Creer-Merge: _started -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // any logic for _started can be put here
        //<<-- /Creer-Merge: _started -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Invoked when the current player ends their turn. Perform in between game logic here
     *
     * @override
     * @returns {*} passes through the default return value
     */
    nextTurn: function() {
        // before we go to the next turn, reset variables and do end of turn logic

        this._updateSpawnedCowboys();

        this._updateCowboys();
        this._advanceBottles();
        this._damagePianos();
        this._applyHazardDamage();

        this._cleanupArray("cowboys");
        this._cleanupArray("furnishings");
        this._cleanupArray("bottles");

        this._doYoungGun(this.currentPlayer);

        if(this._checkForWinner()) {
            return;
        }
        // else continue to the next player (normal next turn logic)
        return TurnBasedGame.nextTurn.apply(this, arguments);
    },

    /**
     * Take all the cowboys spawned during the turn and put them in the appropriate arrays
     */
    _updateSpawnedCowboys: function() {
        while(this.spawnedCowboys.length > 0) {
            var cowboy = this.spawnedCowboys.pop();

            this.cowboys.push(cowboy);
            cowboy.owner.cowboys.push(cowboy);
        }
    },

    /**
     * Updates all Cowboys (for the current player) between turns, reset variables and such
     */
    _updateCowboys: function() {
        for(var i = 0; i < this.currentPlayer.cowboys.length; i++) {
            var cowboy = this.currentPlayer.cowboys[i];

            if(cowboy.isDead) {
                continue; // don't update dead dudes, they won't come back
            }

            if(cowboy.isDrunk) { // move him!
                var next = cowboy.tile.getNeighbor(cowboy.drunkDirection);
                if(!next || next.isBalcony || next.cowboy || next.furnishing) { // then something is in the way
                    if(next) {
                        if(next.cowboy) {
                            next.cowboy.focus = 0;
                        }

                        if(next.isBalcony || next.furnishing) {
                            cowboy.damage(1);
                            if(cowboy.isDead) { // RIP he died from that
                                continue; // don't update dead dudes, they won't come back
                            }
                        }
                    }
                }
                else { // the next tile is valid
                    cowboy.tile.cowboy = null;
                    cowboy.tile = next;
                    next.cowboy = cowboy;
                }

                cowboy.turnsBusy = Math.max(0, cowboy.turnsBusy - 1);
                cowboy.isDrunk = (cowboy.turnsBusy !== 0);
                cowboy.canMove = !cowboy.isDrunk;
            }
            else { // they are not drunk, so update them for use next turn
                if(cowboy.job === "Sharpshooter" && cowboy.canMove) { // then the sharpshooter didn't move, so increase his focus
                    cowboy.focus++;
                }

                cowboy.canMove = true;
            }

            cowboy.turnsBusy = Math.max(0, cowboy.turnsBusy - 1);

            if(cowboy.job === "Brawler") { // damage surroundings
                var neighbors = cowboy.tile.getNeighbors();
                for(var j = 0; j < neighbors.length; j++) { // for each neighbor
                    var neighbor = neighbors[j];
                    if(neighbor.cowboy) { // if there is a cowboy, damage them
                        neighbor.cowboy.damage(this.brawlerDamage);
                    }
                    if(neighbor.furnishing) { // if there is a furnishing, damage it
                        neighbor.furnishing.damage(this.brawlerDamage);
                    }
                }
            }
        }
    },

    /**
     * Moves all bottles currently in the game
     */
    _advanceBottles: function() {
        for(var i = 0; i < this.bottles.length; i++) {
            var bottle = this.bottles[i];
            if(bottle.isDestroyed) {
                continue;
            }

            bottle.advance();
        }
    },

    /**
     * Damages all pianos 1 damage, accelerating the game
     */
    _damagePianos: function() {
        for(var i = 0; i < this.furnishings.length; i++) {
            var furnishing = this.furnishings[i];

            if(furnishing.isDestroyed || !furnishing.isPiano) {
                continue;
            }
            // else it's a non destroyed piano, so damage it
            furnishing.isPlaying = false;
            furnishing.damage(1);
        }
    },

    /**
     * Damages all cowboys which are standing on a hazard
     */
    _applyHazardDamage: function() {
        for(var i = 0; i < this.cowboys.length; i++) {
            var cowboy = this.cowboys[i];

            if(cowboy.tile && cowboy.tile.hasHazard) {
                cowboy.damage(1);
            }
        }
    },

    /**
     * Cleans up an array of dead game objects, done between turns so AIs don't have arrays resizing too much during gameplay
     *
     * @param {string} arrayKey - key to the array in this game instance
     */
    _cleanupArray: function(arrayKey) {
        var list = this[arrayKey];
        var clone = list.clone();
        for(var i = 0; i < clone.length; i++) {
            var item = clone[i];
            if(item.isDestroyed || item.isDead) {
                list.removeElement(item);

                if(item.owner) {
                    item.owner[arrayKey].removeElement(item);
                }
            }
        }
    },

    /**
     * Does Young Gun related logic: moving them clockwise
     *
     * @param {Player} player - the player to apply Young Gun logic to
     */
    _doYoungGun: function(player) {
        var youngGun = player.youngGun; // shorthand
        youngGun.canCallIn = true; // they can call in a cowboy on their next turn

        // find the adjacent tile that they were not on last turn,
        //   this way all YoungGuns continue walking clockwise
        var tiles = youngGun.tile.getNeighbors();
        var moveTo;
        for(var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];

            if(tile.isBalcony && youngGun.previousTile !== tile) { // then this is the tile the young gun needs to be moved to to
                moveTo = tile;
                break;
            }
        }

        // do a quick BFS to find the callInTile
        var searchTiles = [ moveTo ];
        var searched = {};
        while(searchTiles.length > 0) {
            var searchTile = searchTiles.shift();

            if(!searched[searchTile.id]) {
                searched[searchTile.id] = true;

                if(searchTile.isBalcony) { // add its neighbors to be searched
                    searchTiles = searchTiles.concat(searchTile.getNeighbors());
                }
                else {
                    youngGun.callInTile = searchTile;
                    break; // we found it
                }
            }
        }

        youngGun.previousTile = youngGun.tile;
        youngGun.tile.youngGun = null;
        youngGun.tile = moveTo;
        moveTo.youngGun = youngGun;
    },

    /**
     * Checks if someone won, and if so declares a winner
     *
     * @returns {boolean} true if there was a winner and the game is over, false otherwise
     */
    _checkForWinner: function() {
        var numberOfPianos = 0;
        for(var i = 0; i < this.furnishings.length; i++) {
            if(this.furnishings[i].isPiano) {
                numberOfPianos++;
            }
        }

        if(numberOfPianos === 0) { // game over
            this._makeSomeoneWin("all pianos destroyed.");
            return true;
        }

        return false;
    },

    /**
     * Makes someone win the game, and the rest lose
     *
     * @param {string} reason - reason we are making someone win the game
     * @returns {boolean} true if victory by game conditions, false otherwise (random winner)
     */
    _makeSomeoneWin: function(reason) {
        var players = this.players.clone();
        if(players[0].score !== players[1].score) { // someone won with a higher score
            players.sortDescending("score");

            this.declareWinner(players.shift(), "Has highest score ({}) once {}".format(players[0].score, reason));
            this.declareLosers(players, "Lower score than winner");
            return true;
        }

        if(players[0].kills > players[1].kills) { // someone won with a higher kill count
            players.sortDescending("kills");

            this.declareWinner(players.shift(), "Has most kills ({}) once {}".format(players[0].kills, reason));
            this.declareLosers(players, "Less kills than winner");
            return true;
        }

        return this._endGameViaCoinFlip(); // if we got here primary and secondary win conditions failed, so win via coin flip
    },

    /**
     * Invoked when the maximum number of turns is reached, and a winner must be declared
     *
     * @override
     * @returns {*} passes through the default return value
     */
    _maxTurnsReached: function() {
        // When max turns are reached invoke primary/secondary win conditions
        this._makeSomeoneWin("max turns reached ({})".format(this.maxTurns));

        return TurnBasedGame._maxTurnsReached.apply(this, arguments);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

// Game: Use cowboys to have a good time and play some music on a Piano, while brawling with enemy Coyboys.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var TwoPlayerGame = require(__basedir + "/gameplay/shared/twoPlayerGame");
var TurnBasedGame = require(__basedir + "/gameplay/shared/turnBasedGame");
var TiledGame = require(__basedir + "/gameplay/shared/tiledGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Game: Use cowboys to have a good time and play some music on a Piano, while brawling with enemy Coyboys.
var Game = Class(TwoPlayerGame, TurnBasedGame, TiledGame, {
    /**
     * Initializes Games.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        TiledGame.init.apply(this, arguments);
        TurnBasedGame.init.apply(this, arguments);
        TwoPlayerGame.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // these settings are all per side
        this._minFurnishings = 0;
        this._maxFurnishings = 5;
        this._minPianos = 2;
        this._maxPianos = 5;
        this._minHazards = 0;
        this._maxHazards = 6;

        // map dimensions used for tile generation
        this.mapWidth = 22;
        this.mapHeight = 12;

        // game constants
        this.rowdynessToSiesta = 20;
        this.maxCowboysPerJob = 2;

        this.jobs.push(
            "Sharpshooter",
            "Bartender",
            "Brawler"
        );

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
                tile: this.getTile(x, y),
                canCallIn: true,
            });

            player.youngGun.previousTile = this.getTile(x, y + dy); // used for moving the young guns around the map, but not a property exposed to clients
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

        this._updateCowboys();
        this._advanceBottles();
        this._damagePianos();

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
                        }
                    }
                }
                else { // the next tile is valid
                    cowboy.tile.cowboy = null;
                    cowboy.tile = next;
                    next.cowboy = cowboy;
                }

                cowboy.isDrunk = (cowboy.turnsBusy === 0);
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
                        neighbor.cowboy.damage(1);
                    }
                    if(neighbor.furnishing) { // if there is a furnishing, damage it
                        neighbor.furnishing.damage(1);
                    }
                }
            }
        }
    },

    /**
     * Moves all bottles currenly in the game
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
            furnishing.damage(1);
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
        youngGun.canCallIn = true;

        var tiles = youngGun.tile.getNeighbors();
        for(var t = 0; t < tiles.length; t++) {
            var tile = tiles[t];

            if(tile.isBalcony && youngGun.previousTile !== tile) { // this is the tile the young gun needs to talk to
                youngGun.previousTile = youngGun.tile;

                if(youngGun) { // move them
                    youngGun.tile.youngGun = null;
                    youngGun.tile = tile;
                    tile.youngGun = youngGun;
                }

                break;
            }
        }
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

            this.declareWinner(players.shift(), "Has highest score after " + reason);
            this.declareLosers(players, "Lower score than winner");
            return true;
        }

        if(players[0].kills > players[1].kills) { // someone won with a higher kill count
            players.sortDescending("kills");

            this.declareWinner(players.shift(), "Has most kills after " + reason);
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

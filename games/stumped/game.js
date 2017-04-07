// Game: Gather branches and build up your lodge as beavers fight to survive.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const TwoPlayerGame = require(`${__basedir}/gameplay/shared/twoPlayerGame`);
const TurnBasedGame = require(`${__basedir}/gameplay/shared/turnBasedGame`);
const TiledGame = require(`${__basedir}/gameplay/shared/tiledGame`);

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

const mathjs = require("mathjs");
const JobStats = require("./jobStats.json");

//<<-- /Creer-Merge: requires -->>

// @class Game: Gather branches and build up your lodge as beavers fight to survive.
let Game = Class(TwoPlayerGame, TurnBasedGame, TiledGame, {
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
         * Every Beaver in the game.
         *
         * @type {Array.<Beaver>}
         */
        this.beavers = this.beavers || [];

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
         * When a Player has less Beavers than this number, then recruiting other Beavers is free.
         *
         * @type {number}
         */
        this.freeBeaversCount = this.freeBeaversCount || 0;

        /**
         * A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
         *
         * @type {Object.<string, GameObject>}
         */
        this.gameObjects = this.gameObjects || {};

        /**
         * All the Jobs that Beavers can have in the game.
         *
         * @type {Array.<Job>}
         */
        this.jobs = this.jobs || [];

        /**
         * Constant number used to calculate what it costs to spawn a new lodge.
         *
         * @type {number}
         */
        this.lodgeCostConstant = this.lodgeCostConstant || 0;

        /**
         * How many lodges must be owned by a Player at once to win the game.
         *
         * @type {number}
         */
        this.lodgesToWin = this.lodgesToWin || 0;

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
         * A unique identifier for the game instance that is being played.
         *
         * @type {string}
         */
        this.session = this.session || "";

        /**
         * Every Spawner in the game.
         *
         * @type {Array.<Spawner>}
         */
        this.spawner = this.spawner || [];

        /**
         * Constant number used to calculate how many breanches/food Beavers harvest from Spawners.
         *
         * @type {number}
         */
        this.spawnerHarvestConstant = this.spawnerHarvestConstant || 0;

        /**
         * All the types of Spawners in the game.
         *
         * @type {Array.<string>}
         */
        this.spawnerTypes = this.spawnerTypes || [];

        /**
         * All the tiles in the map, stored in Row-major order. Use `x + y * mapWidth` to access the correct index.
         *
         * @type {Array.<Tile>}
         */
        this.tiles = this.tiles || [];


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // initialize all the constants in this game
        this.mapWidth = this.mapWidth || 32;
        this.mapHeight = this.mapHeight || 20;

        this.maxTurns = this.maxTurns || 500;

        this.spawnerHarvestConstant = this.spawnerHarvestConstant || 2;
        this.lodgeCostConstant = this.lodgeCostConstant || mathjs.phi;

        this.freeBeaversCount = this.freeBeaversCount || 10;
        this.lodgesToWin = this.lodgesCompleteToWin || 10;

        this.maxSpawnerHealth = this.maxSpawnerHealth || 5;

        this.spawnerTypes.push("food", "branches");

        this.newBeavers = [];

        //<<-- /Creer-Merge: init -->>
    },

    name: "Stumped",

    aliases: [
        //<<-- Creer-Merge: aliases -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        "MegaMinerAI-19-Stumped",
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

        // read in all the jobs in the `jobStats.json` file and initialize a Job instance for it.
        for(const title of Object.keys(JobStats.jobs).sort()) {
            this.jobs.push(
                this.create("Job", {title})
            );
        }

        // creates the 2D map based off the mapWidth/mapHeight set in the init function
        TiledGame._initMap.call(this);

        /* Generate the map */
        // TODO: actual map generation
        for(let x = 0; x < this.mapWidth; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                let tile = this.getTile(x, y);
                tile.type = Math.random() < 0.2 ? "water" : "land";
                if(Math.random() < 0.05) {
                    this.create("Spawner", {
                        tile: tile,
                        type: tile.type === "water" ? "food" : "branches",
                    });
                }
            }
        }

        // give each player a starting beaver
        for(const player of this.players) {
            let tile = null;
            while(!tile) {
                tile = this.tiles.randomElement();
                if(tile.spawner || tile.beaver) {
                    tile = null;
                }
            }

            this.create("Beaver", {
                owner: player,
                tile: tile,
                job: this.jobs[0],
                recruited: true,
                branches: 1,
            });
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
     * Invoked before the current player starts their turn
     *
     * @override
     * @returns {*} passes through the default return value
     */
    beforeTurn: function() {
        // before they start their turn, cleanup the arrays
        this.cleanupArrays();

        // finish recruiting any new beavers
        for(const beaver of this.currentPlayer.beavers) {
            beaver.recruited = true;
        }

        // else continue to the next player (normal next turn logic)
        return TurnBasedGame.beforeTurn.apply(this, arguments);
    },

    /**
     * Invoked when the current player ends their turn. Perform in between game logic here
     *
     * @override
     * @returns {*} passes through the default return value
     */
    nextTurn: function() {
        // before we go to the next turn, reset variables and do end of turn logic
        this.cleanupArrays();
        this.updateBeavers();
        this.updateResources();

        if(this.checkForWinner()) {
            // we found a winner, no need to proceed to the next turn
            return;
        }

        // else continue to the next player (normal next turn logic)
        return TurnBasedGame.nextTurn.apply(this, arguments);
    },

    checkForWinner: function(force) {
        // Check if a player has created 10 lodges (they are built instantly)
        // Check if this.maxTurns turns have passed, and if so, in this order:
        // - Player with most lodges wins
        // - Player with most branches wins
        // - Player with most food wins
        // - Random player wins

        // Get player info
        let playerInfo = [];

        for(let i = 0; i < this.players.length; i++) {
            let player = this.players[i];

            playerInfo[i] = {
                "lodges": player.lodges.length,
                "branches": 0,
                "food": 0,
            };

            for(let j = 0; j < player.beavers.length; j++) {
                let beaver = player.beavers[j];

                playerInfo[i]["branches"] += beaver.branches;
                playerInfo[i]["food"] += beaver.food;
            }
        }

        let checkSecondaryConditions = this.currentTurn >= this.maxTurns - 1;
        if(this.currentTurn % this.players.length === this.players.length - 1) {
            // Check if a player has created the required number lodges
            let max = 0;
            let playerWithMax = -1;
            for(let player = 0; player < playerInfo.length; player++) {
                let playerLodges = playerInfo[player]["lodges"];

                if(playerLodges > max) {
                    max = playerLodges;
                    playerWithMax = player;
                }
                else if(playerLodges === max) {
                    playerWithMax = -1;
                }
            }

            if(max >= this.lodgesCompleteToWin && playerWithMax >= 0) {
                let losers = this.players.clone();
                this.declareWinner(losers[playerWithMax], "Player has won because they have the most lodges.");
                losers.splice(playerWithMax, 1);
                this.declareLosers(losers, "Player does not have most lodges.");
                return true;
            }
            else if(max >= this.lodgesCompleteToWin) {
                checkSecondaryConditions = true;
            }
        }

        // Check if the maximum number of turns have passed
        if(checkSecondaryConditions) {
            // Find the player with the most lodges
            let max = 0;
            let playerWithMax = -1;
            for(let player = 0; player < playerInfo.length; player++) {
                let playerLodges = playerInfo[player]["lodges"];

                if(playerLodges > max) {
                    max = playerLodges;
                    playerWithMax = player;
                }
                else if(playerLodges === max) {
                    playerWithMax = -1;
                }
            }

            if(playerWithMax >= 0) {
                let losers = this.players.clone();
                this.declareWinner(losers[playerWithMax], "Player has won because they have the most lodges.");
                losers.splice(playerWithMax, 1);
                this.declareLosers(losers, "Player does not have most lodges.");
                return true;
            }

            // Find the player with the most branches
            max = 0;
            playerWithMax = -1;
            for(let player = 0; player < playerInfo.length; player++) {
                let playerLodges = playerInfo[player]["branches"];

                if(playerLodges > max) {
                    max = playerLodges;
                    playerWithMax = player;
                }
                else if(playerLodges === max) {
                    playerWithMax = -1;
                }
            }

            if(playerWithMax >= 0) {
                let losers = this.players.clone();
                this.declareWinner(losers[playerWithMax], "Player has won because they have the most branches.");
                losers.splice(playerWithMax, 1);
                this.declareLosers(losers, "Player does not have most branches.");
                return true;
            }

            // Find the player with the most food
            max = 0;
            playerWithMax = -1;
            for(let player = 0; player < playerInfo.length; player++) {
                let playerLodges = playerInfo[player]["food"];

                if(playerLodges > max) {
                    max = playerLodges;
                    playerWithMax = player;
                }
                else if(playerLodges === max) {
                    playerWithMax = -1;
                }
            }

            if(playerWithMax >= 0) {
                let losers = this.players.clone();
                this.declareWinner(losers[playerWithMax], "Player has won because they have the most food.");
                losers.splice(playerWithMax, 1);
                this.declareLosers(losers, "Player does not have most food.");
                return true;
            }

            // Pick a random player
            this._endGameViaCoinFlip();
            return true;
        }

        return false;
    },

    updateBeavers: function() {
        for(const beaver of this.beavers) {
            // if they are distracted
            if(beaver.turnsDistracted > 0) {
                beaver.turnsDistracted--; // decrement the turns count
            }

            // reset their actions/moves for next turn
            beaver.actions = beaver.job.actions;
            beaver.moves = beaver.job.moves;
        }
    },

    updateResources: function() {
        let tilesChecked = new Set();
        for(const tile of this.tiles) {
            // Move branches downstream
            this.moveResources(tile, tilesChecked);

            // Spawn new resources
            if(tile.spawner) {
                if(!tile.spawner.hasBeenHarvested && tile.spawner.health < this.maxSpawnerHealth) {
                    tile.spawner.health += 1;
                }

                tile.spawner.hasBeenHarvested = false;
            }
        }
    },

    moveResources: function(tile, tilesChecked) {
        // if the tile we are checking:
        //  - is a water tile
        //  - has no lodge owner (resources don't flow out of lodges)
        //  - has a flow direction (water flows through it)
        //  - has not already been checked
        // then we need to flow resources off it
        if(tile.type === "Water" && !tile.lodgeOwner && tile.flowDirection && !tilesChecked.has(tile)) {
            tilesChecked.add(tile);
            const nextTile = tile.getNeighbor(tile.flowDirection);
            // if there is a tile to flow to, the move all the branches and food to that tile
            if(nextTile && !nextTile.lodgeOwner) {
                // recursively move the next tile's resources, this way the furthest down steam tile gets updated first, so we don't update resources on top of each other.
                this.moveResources(nextTile, tilesChecked);

                nextTile.food += tile.food;
                tile.food = 0;

                nextTile.branches += tile.branches;
                tile.branches = 0;
            }
        }
    },

    cleanupArrays: function() {
        // add all the new beavers to this.beavers
        this.beavers.push.apply(this.beavers, this.newBeavers);

        // and empty out the `this.newBeavers` array as they are no longer new and have been added above
        this.newBeavers.length = 0;

        let allBeavers = this.beavers.slice(); // clone of array so we can remove them from the actual array and not fuck up loop iteration
        for(const beaver of allBeavers) {
            if(beaver.health <= 0) {
                // poor beaver died, remove it from arrays
                this.beavers.removeElement(beaver);
                beaver.owner.beavers.removeElement(beaver);
            }
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

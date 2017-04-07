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
         * Constant number used to calculate how many branches/food Beavers harvest from Spawners.
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
        this.mapWidth = data.mapWidth || 32;
        this.mapHeight = data.mapHeight || 20;

        this.maxTurns = data.maxTurns || 500;

        this.spawnerHarvestConstant = data.spawnerHarvestConstant || 2;
        this.lodgeCostConstant = data.lodgeCostConstant || mathjs.phi;

        this.freeBeaversCount = data.freeBeaversCount || 10;
        this.lodgesToWin = data.lodgesCompleteToWin || 10;

        this.maxSpawnerHealth = data.maxSpawnerHealth || 5;

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
            player.calculateBranchesToBuildLodge();

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
                job: this.jobs[0], // Basic Beaver
                recruited: true,
                branches: 1,
            });
        }

        this.generateMap();

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

        for(const b of this.beavers) {
            for(const a of this.beavers) {
                if(a !== b && a.tile && a.tile === b.tile) {
                    throw new Error(`FUCK ${a} is on ${b} at ${a.tile}`);
                }
            }
        }

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
        // - Player has been made extinct (all beavers & lodges destroyed)
        // - Player with most lodges wins
        // - Player with most branches wins
        // - Player with most food wins
        // - Random player wins

        const extinctPlayers = this.players.filter((p) => p.beavers.length === 0 && p.lodges.length === 0);

        if(extinctPlayers.length > 0) {
            // someone lost via extermination
            if(extinctPlayers.length === this.players.length) {
                // they both somehow killed everything, so the board is empty. Win via coin flip
                this._endGameViaCoinFlip("Simultaneous Extinction");
                return true;
            }
            else {
                // all exterminated players lost
                const notExtinct = this.players.filter((p) => extinctPlayers.indexOf(p) === -1);
                if(notExtinct.length === 1) {
                    // that player won, all other players are extinct
                    this.declareWinner(notExtinct[0], "Drove opponent to extinction!");
                }
                // all extinct players have now lost
                this.declareLosers(extinctPlayers, "Extinct - All Beavers and lodges destroyed");
            }
        }

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
        for(const newBeaver of this.newBeavers) {
            this.beavers.push(newBeaver);
            newBeaver.owner.beavers.push(newBeaver);
        }

        // and empty out the `this.newBeavers` array as they are no longer new and have been added above
        this.newBeavers.length = 0;

        let allBeavers = this.beavers.slice(); // clone of array so we can remove them from the actual array and not fuck up loop iteration
        // remove all beavers from the game that died
        for(const beaver of allBeavers) {
            if(beaver.health <= 0) {
                // poor beaver died, remove it from arrays
                beaver.owner.beavers.removeElement(beaver);
                this.beavers.removeElement(beaver);
            }
            else {
                beaver.owner.beavers.push(beaver);
                beaver.tile.beaver = beaver;
            }
        }
    },

    generateMap: function() {
        /* Fill map with land */
        for(let x = 0; x < this.mapWidth; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                let tile = this.getTile(x, y);
                tile.type = "land";
            }
        }

        // Used for symmetry
        let horizontal = true || Math.random() < 0.5;
        let lake = 0;

        /* Generate lake */
        if(horizontal) {
            // Lake center
            lake = Math.floor(this.mapWidth / 2);

            // Generate random metaballs where the lake will be
            let balls = [];
            const minRadius = 0.5;
            const maxRadius = 5.0;
            const maxOffset = 2.0;
            const additionalBalls = 5;
            const gooeyness = 1.0;
            const threshold = 3.5;
            const radiusRange = maxRadius - minRadius;

            // Initial ball (lake center)
            balls.push({
                x: lake,
                y: this.mapHeight / 2,
                r: Math.random() * radiusRange + minRadius,
            });

            // Extra balls
            for(let i = 0; i < additionalBalls; i++) {
                balls.push({
                    x: lake + Math.random() * maxOffset * 2 - maxOffset,
                    y: this.mapHeight / 2 - Math.random() * maxOffset,
                    r: Math.random() * radiusRange + minRadius,
                });
            }

            // Generate lake from metaballs
            for(let x = 0; x < this.mapWidth; x++) {
                for(let y = 0; y < this.mapHeight / 2; y++) {
                    let tile = this.getTile(x, y);
                    let energy = 0;
                    for(const ball of balls) {
                        let r = ball.r;
                        let dist = Math.sqrt(Math.pow(ball.x - x, 2) + Math.pow(ball.y - y, 2));
                        let d = Math.max(0.0001, Math.pow(dist, gooeyness));
                        energy += r / d;
                    }

                    if(energy > threshold) {
                        tile.type = "water";
                    }
                }
            }
        }

        /* Generate rivers */
        const minTheta = Math.PI / 4;
        const maxTheta = 3 * Math.PI / 4;
        const minThetaDelta = Math.PI / 6;
        const maxThetaDelta = Math.PI / 4;
        const thetaDeltaRange = maxThetaDelta - minThetaDelta;

        let theta = minTheta - minThetaDelta;
        if(horizontal) {
            while(true) {
                theta += Math.random() * thetaDeltaRange + minThetaDelta;
                if(theta >= maxTheta) {
                    break;
                }
                // console.log(`Generating river at ${theta * 180 / Math.PI} degrees`);

                // Define the line segments
                let points = [];

                // Starting point - The center of lake, at (0, 0)
                points.push({
                    x: 0,
                    y: 0,
                });

                // Final point - Outside the edge of the map
                points.push({
                    x: this.mapWidth + this.mapHeight,
                    y: 0,
                });

                // Generate fractals
                // createFractal(points, 0, 1);

                // Transform points
                let offset = Math.PI;
                for(let p of points) {
                    let r = Math.sqrt(p.x * p.x + p.y * p.y);
                    let t = Math.atan2(p.y, p.x) + theta + offset;
                    p.x = lake + r * Math.cos(t);
                    p.y = this.mapHeight / 2 + r * Math.sin(t);
                }

                // console.log("Points:");
                // console.log(points);

                // Draw line segments
                let collided = false;
                for(let i = 1; !collided && i < points.length; i++) {
                    let a = points[i - 1];
                    let b = points[i];

                    // Useful values
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;
                    let steps = 0;
                    if(Math.abs(dx) > Math.abs(dy)) {
                        steps = Math.abs(dx);
                    }
                    else {
                        steps = Math.abs(dy);
                    }
                    let xInc = dx / steps;
                    let yInc = dy / steps;

                    let x = a.x;
                    let y = a.y;
                    let lastX = -1;
                    let lastY = -1;
                    let nextDir = null;
                    for(let step = 0; !collided && step < steps; step++) {
                        x += xInc;
                        y += yInc;
                        let realX = Math.floor(x);
                        let realY = Math.floor(y);
                        let nextX = Math.floor(x + xInc);
                        let nextY = Math.floor(y + yInc);

                        // Verify the current tile exists
                        if(realX >= 0 && realY >= 0 && realX < this.mapWidth && realY < this.mapHeight / 2) {
                            // Set tile to water
                            let tile = this.getTile(realX, realY);

                            // Don't go diagonal
                            if(realX !== nextX && realY !== nextY) {
                                y -= yInc;
                            }

                            // Flow direction
                            if(tile.type !== "water") {
                                if(nextDir === null) {
                                    if(realY > lastY) {
                                        tile.flowDirection = "North";
                                    }
                                    else if(realY < lastY) {
                                        tile.flowDirection = "South";
                                    }
                                    else if(realX < lastX) {
                                        tile.flowDirection = "East";
                                    }
                                    else if(realX > lastX) {
                                        tile.flowDirection = "West";
                                    }
                                }
                                else {
                                    tile.flowDirection = nextDir;
                                    nextDir = null;
                                }

                                tile.type = "water";
                            }
                            else if(tile.flowDirection !== "") {
                                collided = true;
                            }
                        }

                        // Update last coords
                        lastX = realX;
                        lastY = realY;
                    }
                }
            }
        }

        /* Generate resources */
        for(let x = 0; x < this.mapWidth; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                let tile = this.getTile(x, y);
                if(Math.random() < 0.05) {
                    this.create("Spawner", {
                        tile: tile,
                        type: tile.type === "water" ? "fish" : "branches",
                    });
                }
            }
        }

        /* Mirror map */
        if(horizontal) {
            for(let x = 0; x < this.mapWidth; x++) {
                for(let y = 0; y < this.mapHeight / 2; y++) {
                    let orig = this.getTile(x, y);
                    let target = this.getTile(x, this.mapHeight - y - 1);

                    // Copy data
                    target.type = orig.type;
                    target.spawner = orig.spawner;

                    switch(orig.flowDirection) {
                        case "North":
                            target.flowDirection = "South";
                            break;
                        case "South":
                            target.flowDirection = "North";
                            break;
                        case "East":
                            target.flowDirection = "East";
                            break;
                        case "West":
                            target.flowDirection = "West";
                            break;
                    }
                }
            }
        }

        /* Place starting beavers */
        if(horizontal) {
            let x = Math.floor(Math.random() * this.mapWidth);
            let y = Math.floor(Math.random() * this.mapHeight / 2);
            let p1 = this.getTile(x, y);
            let p2 = this.getTile(x, this.mapHeight - y - 1);

            // Player 1
            this.create("Beaver", {
                owner: this.players[0],
                tile: p1,
                job: this.jobs[0],
                recruited: true,
            });

            // Player 2
            this.create("Beaver", {
                owner: this.players[0].opponent,
                tile: p2,
                job: this.jobs[0],
                recruited: true,
            });
        }
    },

    /*createFractal: function(points, index, depth) {
        let a = points[index];
        let b = points[index + 1];
        let center = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        };

        // Modify center's y value
        let curVariance = 3 / depth;
        center.y += Math.random() * 2 * curVariance - curVariance;

        // Insert center point into the array
        points.splice(index, 0, center);

        // Offset for recursion
        return 1;
    }*/

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

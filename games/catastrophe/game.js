// Game: Convert as many humans to as you can to survive in this post-apocalyptic wasteland.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const TwoPlayerGame = require(`${__basedir}/gameplay/shared/twoPlayerGame`);
const TurnBasedGame = require(`${__basedir}/gameplay/shared/turnBasedGame`);
const TiledGame = require(`${__basedir}/gameplay/shared/tiledGame`);

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
const JobStats = require("./jobStats.json");
//<<-- /Creer-Merge: requires -->>

// @class Game: Convert as many humans to as you can to survive in this post-apocalyptic wasteland.
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
         * The multiplier for the amount of energy regenerated when resting in a shelter with the cat overlord.
         *
         * @type {number}
         */
        this.catEnergyMult = this.catEnergyMult || 0;

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
         * A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
         *
         * @type {Object.<string, GameObject>}
         */
        this.gameObjects = this.gameObjects || {};

        /**
         * The amount of turns it takes for a Tile that was just harvested to grow food again.
         *
         * @type {number}
         */
        this.harvestCooldown = this.harvestCooldown || 0;

        /**
         * All the Jobs that Units can have in the game.
         *
         * @type {Array.<Job>}
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
         * The multiplier for the amount of energy regenerated when resting while starving.
         *
         * @type {number}
         */
        this.starvingEnergyMult = this.starvingEnergyMult || 0;

        /**
         * Every Structure in the game.
         *
         * @type {Array.<Structure>}
         */
        this.structures = this.structures || [];

        /**
         * All the tiles in the map, stored in Row-major order. Use `x + y * mapWidth` to access the correct index.
         *
         * @type {Array.<Tile>}
         */
        this.tiles = this.tiles || [];

        /**
         * Every Unit in the game.
         *
         * @type {Array.<Unit>}
         */
        this.units = this.units || [];


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        this.maxTurns = data.maxTurns || 720;
        this.catEnergyMult = data.catEnergyMult || 2;
        this.harvestCooldown = data.harvestCooldown || 1;
        this.mapWidth = data.mapWidth || 26;
        this.mapHeight = data.mapHeight || 18;
        this.starvingEnergyMult = data.starvingEnergyMult || 0.5;

        // Variables that aren't in creer but could be added
        this.turnsToCreateHuman = 30;
        this.turnsToLowerHarvest = 60;
        this.lowerHarvestAmount = 10;
        this.turnsBetweenHarvests = 10;
        this.structureChance = 0.025;
        this.minFoodChance = 0.01;
        this.maxFoodChance = 0.1;
        this.minHarvestRate = 50;
        this.maxHarvestRate = 150;

        // For structures created during the turn
        this.newStructures = [];
        //<<-- /Creer-Merge: init -->>
    },

    name: "Catastrophe",

    aliases: [
        //<<-- Creer-Merge: aliases -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        "MegaMinerAI-##-Catastrophe",
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
        // Import jobs
        for(const title of Object.keys(JobStats.jobs)) {
            this.jobs.push(
                this.create("Job", {title})
            );
        }

        // Initialize the map and creates all the tiles
        TiledGame._initMap.call(this);

        // Generate the map and units
        this.generateMap();

        // Properly add all new structures
        for(let structure of this.newStructures) {
            this.structures.push(structure);
            if(structure.owner) {
                structure.owner.structures.push(structure);
            }
        }
        this.newStructures = [];

        // Calculate player upkeeps
        for(let player of this.players) {
            player.upkeep = 0;
            for(let unit of player.units) {
                player.upkeep += unit.job.upkeep;
            }

            player.food = 100;
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
        // Update all arrays
        this.updateArrays();

        // Call base class' beforeTurn function
        return TurnBasedGame.beforeTurn.apply(this, arguments);
    },

    /**
     * Invoked when the current player ends their turn. Perform in between game logic here
     *
     * @override
     * @returns {*} passes through the default return value
     */
    nextTurn: function() {
        // Update all arrays
        this.updateArrays();
        this.updateUnits();
        this.updateResources();

        if(this.checkForWinner(false)) {
            // If somebody won, don't continue to the next turn
            return;
        }

        // Continue to the next player (normal next turn logic)
        return TurnBasedGame.nextTurn.apply(this, arguments);
    },

    /**
     * invoked when max turns are reached
     *
     * @override
     */
    _maxTurnsReached: function() {
        this.checkForWinner("Max turns reached");
    },

    updateArrays: function() {
        // Properly add all new structures
        for(let structure of this.newStructures) {
            this.structures.push(structure);
            if(structure.owner) {
                structure.owner.structures.push(structure);
            }
        }
        this.newStructures = [];

        // Properly remove all destroyed structures
        for(let i = 0; i < this.structures.length; i++) {
            const structure = this.structures[i];
            if(!structure.tile) {
                if(structure.owner) {
                    // Remove this structure from the player's structures array
                    structure.owner.structures.removeElement(structure);
                }

                // Remove this structure from the game's structures array
                this.structures.splice(i, 1);
                i--; // Make sure we don't skip an element
            }
        }

        // Properly remove all killed units
        for(let i = 0; i < this.units.length; i++) {
            const unit = this.units[i];
            if(!unit.tile || unit.turnsToDie === 0) {
                if(unit.tile) {
                    unit.tile.unit = null;
                    unit.tile = null;
                }

                if(unit.owner) {
                    // Remove this unit from the player's units array
                    unit.owner.units.removeElement(unit);
                }

                // Remove this unit from the game's units array
                this.units.splice(i, 1);
                i--; // Make sure we don't skip an element
            }
        }
    },

    updateUnits: function() {
        // Reset all upkeeps
        for(let player of this.players) {
            player.upkeep = 0;

            // Remove all defeated units from their units list
            for(let unit of player.defeatedUnits) {
                player.units.removeElement(unit);
            }

            player.defeatedUnits = [];

            // Add all new units to their units list
            for(let unit of player.newUnits) {
                player.units.push(unit);
            }

            player.newUnits = [];
        }

        // Iterate through all units
        for(let unit of this.units) {
            if(!unit.owner || unit.owner === this.currentPlayer) {
                unit.acted = false;
                unit.moves = unit.job.moves;
                unit.starving = false;
            }

            if(unit.owner) {
                // Add this unit's upkeep to the player's total upkeep
                unit.owner.upkeep += unit.job.upkeep;
            }
            else {
                // Neutral fresh humans
                if(unit.turnsToDie > 0) {
                    unit.turnsToDie--;
                }

                const target = unit.movementTarget;
                if(target) {
                    // Move neutral fresh humans on the road
                    const nextTile = this.getTile(unit.tile.x + Math.sign(target.x - unit.tile.x), unit.tile.y);
                    if(nextTile && !nextTile.unit) {
                        unit.tile.unit = null;
                        nextTile.unit = unit;
                        unit.tile = nextTile;
                    }
                }
            }
        }

        // Check if new fresh humans should walk across the road
        if(this.currentTurn % this.turnsToCreateHuman === 0) {
            // Spawn two new fresh humans
            let tile;

            // Search for a valid spawning tile
            for(let x = 0; x < this.mapWidth; x++) {
                tile = this.getTile(x, this.mapHeight / 2 - 1);
                if(!tile.unit) {
                    break;
                }
            }

            // If one was found (as in, not a map-wide line of units), spawn a new fresh human
            if(!tile.unit) {
                let unit = this.create("Unit", {
                    job: this.jobs[0],
                    owner: null,
                    tile: tile,
                    turnsToDie: this.mapWidth - tile.x,
                    movementTarget: this.getTile(this.mapWidth - 1, this.mapHeight / 2 - 1),
                });
                unit.tile.unit = unit;
            }

            // Search for a valid spawning tile
            for(let x = this.mapWidth - 1; x >= 0; x--) {
                tile = this.getTile(x, this.mapHeight / 2);
                if(!tile.unit) {
                    break;
                }
            }

            // If one was found (as in, not a map-wide line of units), spawn a new fresh human
            if(!tile.unit) {
                let unit = this.create("Unit", {
                    job: this.jobs[0],
                    owner: null,
                    tile: tile,
                    turnsToDie: tile.x,
                    movementTarget: this.getTile(0, this.mapHeight / 2),
                });
                unit.tile.unit = unit;
            }
        }

        // Check if units are starving and update food
        if(this.currentPlayer.food >= this.currentPlayer.upkeep) {
            this.currentPlayer.food -= this.currentPlayer.upkeep;
        }
        else {
            for(let unit of this.currentPlayer.units) {
                unit.starving = true;
            }
        }
    },

    updateResources: function() {
        let lowerHarvests = this.currentTurn % this.turnsToLowerHarvest === 0;

        // Iterate through every tile
        for(let tile of this.tiles) {
            if(tile.turnsToHarvest > 0) {
                tile.turnsToHarvest--;
            }

            if(lowerHarvests && tile.harvestRate > 0) {
                tile.harvestRate -= this.lowerHarvestAmount;
            }
        }
    },

    structureCost: function(structure) {
        if(structure === "neutral") {
            return 75;
        }
        else if(structure === "road") {
            return 0;
        }
        else if(structure === "wall") {
            return 75;
        }
        else if(structure === "shelter") {
            return 50;
        }
        else if(structure === "monument") {
            return 150;
        }
    },

    structureRange: function(structure) {
        if(structure === "neutral") {
            return 0;
        }
        else if(structure === "road") {
            return 0;
        }
        else if(structure === "wall") {
            return 0;
        }
        else if(structure === "shelter") {
            return 1;
        }
        else if(structure === "monument") {
            return 3;
        }
    },

    checkForWinner: function(secondaryReason) {
        let players = this.players.slice();

        // Primary win conditions: defeat enemy cat or defeat all enemy humans
        const loseReasons = players.reduce((loseReasons, p) => {
            if(p.cat.energy <= 0) {
                loseReasons[p.id] = "Cat died";
            }
            else if(p.units.length === 1) {
                loseReasons[p.id] = "Humans died";
            }
            return loseReasons;
        }, {});

        const losers = Object.keys(loseReasons);
        if(losers.length === players.length) {
            // Both players lost
            secondaryReason = "Both players met a primary win condition";
        }
        else if(losers.length > 0) {
            // One player lost
            const loser = players.find(p => p.id === losers[0]);
            const reason = loseReasons[loser.id];
            this.declareWinner(loser.opponent, `Opponent lost: ${reason}`);
            this.declareLoser(loser, reason);
            return true;
        }

        if(secondaryReason) {
            // Secondary win conditions
            // 1. Most units
            players.sort((a, b) => b.units.length - a.units.length);
            if(players[0].units.length > players[1].units.length) {
                this.declareWinner(players[0], `${secondaryReason}: Had the most units`);
                this.declareLoser(players[1], `${secondaryReason}: Had the least units`);
                return true;
            }

            // 2. Most food
            players.sort((a, b) => b.food - a.food);
            if(players[0].food > players[1].food) {
                this.declareWinner(players[0], `${secondaryReason}: Had the most food`);
                this.declareLoser(players[1], `${secondaryReason}: Had the least food`);
                return true;
            }

            // 3. Most structures
            players.sort((a, b) => b.structures.length - a.structures.length);
            if(players[0].structures.length > players[1].structures.length) {
                this.declareWinner(players[0], `${secondaryReason}: Had the most structures`);
                this.declareLoser(players[1], `${secondaryReason}: Had the least structures`);
                return true;
            }

            // 4. Coin toss
            this._endGameViaCoinFlip(secondaryReason);
            return true;
        }

        return false;
    },

    /**
     * Generates the map and places the resources, players, and starting units
     */
    generateMap: function() {
        const halfWidth = Math.floor(this.mapWidth / 2);
        const halfHeight = Math.floor(this.mapHeight / 2);

        // Place structures and food spawners
        for(let x = 0; x < halfWidth; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                let tile = this.getTile(x, y);

                // Generate structures and spawners
                if(y === halfHeight - 1 || y === halfHeight) {
                    // Generate road
                    tile.structure = this.create("Structure", {
                        tile: tile,
                        type: "road",
                    });
                }
                else {
                    let cx = this.mapWidth / 2;
                    let cy = this.mapHeight / 2;
                    const exp = 2;

                    // Calculate max distances from center of map, raised to exp
                    let maxD = Math.pow(cx, exp) + Math.pow(cy, exp);

                    // This is a fancy function based on some easing functions
                    let factor = Math.abs(Math.pow(Math.abs(x - cx) - cx, exp) + Math.pow(Math.abs(y - cy) - cy, exp)) / maxD;

                    // Food chance increases toward center of map
                    let foodChanceRange = this.maxFoodChance - this.minFoodChance;
                    let foodChance = factor * foodChanceRange + this.minFoodChance;

                    // Try to place food or structure
                    if(Math.random() < foodChance) {
                        // Calculate the multiplier for the harvest rate, increasing food toward center
                        const maxDistFromCenter = Math.sqrt(cx * cx + cy * cy);
                        const dx = cx - x;
                        const dy = cy - y;
                        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                        const harvestRateMult = 1 - distFromCenter / maxDistFromCenter;
                        const harvestRateRange = this.maxHarvestRate - this.minHarvestRate;

                        // Generate food spawner
                        tile.harvestRate = this.minHarvestRate + harvestRateRange * Math.ceil(harvestRateMult);
                    }
                    else if(Math.random() < this.structureChance) {
                        // Generate neutral structures
                        tile.structure = this.create("Structure", {
                            tile: tile,
                            type: "neutral",
                        });
                    }
                }
            }
        }

        // Place cat and starting shelter
        let possibleTiles = this.tiles.filter(t => {
            // Check if tile is empty
            if(t.structure || t.unit || t.harvestRate > 0) {
                return false;
            }

            // Make sure tile is close enough to a corner of the map
            return t.x < halfWidth / 2 && (t.y < halfWidth / 2 || this.mapHeight - t.y < halfWidth / 2);
        });

        let selected = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];

        // Shelter
        selected.structure = this.create("Structure", {
            owner: this.players[0],
            tile: selected,
            type: "shelter",
        });

        // Cat
        this.players[0].cat = selected.unit = this.create("Unit", {
            owner: this.players[0],
            tile: selected,
            job: this.jobs.find(j => j.title === "cat overlord"),
        });

        // Place starting units
        const cat = this.players[0].cat;
        const increment = 2;
        let maxDist = 1 - increment;
        possibleTiles = [];

        for(let i = 0; i < 3; i++) {
            // Make sure there's valid tiles in range
            while(possibleTiles.length === 0) {
                // Expand the range a bit
                maxDist += increment;
                possibleTiles = this.tiles.filter(t => {
                    // Check if tile is empty
                    if(t.structure || t.unit || t.harvestRate > 0) {
                        return false;
                    }

                    // Make sure it's on the correct side of the map
                    if(t.x >= halfWidth) {
                        return false;
                    }

                    // Check if the tile is close enough to the cat
                    return Math.abs(cat.tile.x - t.x) <= maxDist && Math.abs(cat.tile.y - t.y) <= maxDist;
                });
            }

            // Choose a tile
            let selected = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];
            selected.unit = this.create("Unit", {
                owner: this.players[0],
                tile: selected,
                job: this.jobs[0],
            });
            possibleTiles.removeElement(selected);
        }

        // Mirror map
        for(let x = 0; x < halfWidth; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                let orig = this.getTile(x, y);
                let target = this.getTile(this.mapWidth - x - 1, this.mapHeight - y - 1);

                // Copy data
                target.harvestRate = orig.harvestRate;

                // Clone structure
                if(orig.structure) {
                    target.structure = this.create("Structure", {
                        tile: target,
                        type: orig.structure.type,
                        owner: orig.structure.owner && orig.structure.owner.opponent,
                    });
                }

                // Clone unit
                if(orig.unit) {
                    target.unit = this.create("Unit", {
                        tile: target,
                        owner: orig.unit.owner && orig.unit.owner.opponent,
                        job: orig.unit.job,
                    });

                    if(target.unit.job.title === "cat overlord") {
                        target.unit.owner.cat = target.unit;
                    }
                }
            }
        }
    },
    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

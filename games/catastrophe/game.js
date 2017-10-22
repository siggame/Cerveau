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
        this.maxTurns = data.maxTurns || 730;
        this.catEnergyMult = data.catEnergyMult || 2;
        this.harvestCooldown = data.harvestCooldown || 1;
        this.mapHeight = data.mapHeight || 30;
        this.mapWidth = data.mapWidth || 40;
        this.starvingEnergyMult = data.starvingEnergyMult || 0.5;

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
        // any logic after init can be put here
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
        // Properly add all new structures
        for(let structure of this.newStructures) {
            this.structures.push(structure);
            if(structure.owner) {
                structure.owner.structures.push(structure);
            }
        }

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
            if(!unit.tile) {
                if(unit.owner) {
                    // Remove this unit from the player's units array
                    unit.owner.units.removeElement(unit);
                }

                // Remove this unit from the game's units array
                this.units.splice(i, 1);
                i--; // Make sure we don't skip an element
            }
        }

        return TurnBasedGame.beforeTurn.apply(this, arguments);
    },
    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

// Beaver: A beaver in the game.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

//<<-- /Creer-Merge: requires -->>

// @class Beaver: A beaver in the game.
var Beaver = Class(GameObject, {
    /**
     * Initializes Beavers.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The number of actions remaining for the beaver this turn.
         *
         * @type {number}
         */
        this.actions = this.actions || 0;

        /**
         * The number of branches this beaver is holding.
         *
         * @type {number}
         */
        this.branches = this.branches || 0;

        /**
         * Number of turns this beaver is distracted for (0 means not distracted).
         *
         * @type {number}
         */
        this.distracted = this.distracted || 0;

        /**
         * The number of fish this beaver is holding.
         *
         * @type {number}
         */
        this.fish = this.fish || 0;

        /**
         * How much health this beaver has left.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * The Job this beaver was recruited to do.
         *
         * @type {Job}
         */
        this.job = this.job || null;

        /**
         * How many moves this beaver has left this turn.
         *
         * @type {number}
         */
        this.moves = this.moves || 0;

        /**
         * The Player that owns and can control this beaver.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The tile this beaver is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        for(var key of this.job) {
            this[key] = this.job[key];
        }

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Beaver",


    /**
     * Attacks another adjacent beaver.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The tile of the beaver you want to attack.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if successfully attacked, false otherwise.
     */
    attack: function(player, tile, asyncReturn) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Beaver's attack function here
        return false;

        // <<-- /Creer-Merge: attack -->>
    },

    /**
     * Builds a lodge on the Beavers current tile.
     *
     * @param {Player} player - the player that called this.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if successfully built a lodge, false otherwise.
     */
    buildLodge: function(player, asyncReturn) {
        // <<-- Creer-Merge: buildLodge -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Beaver's buildLodge function here
        return false;

        // <<-- /Creer-Merge: buildLodge -->>
    },

    /**
     * Drops some of the given resource on the beaver's tile. Fish dropped in water disappear instantly, and fish dropped on land die one per tile per turn.
     *
     * @param {Player} player - the player that called this.
     * @param {string} resource - The type of resource to drop ('branch' or 'fish').
     * @param {number} amount - The amount of the resource to drop, numbers <= 0 will drop all of that type.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if successfully dropped the resource, false otherwise.
     */
    drop: function(player, resource, amount, asyncReturn) {
        // <<-- Creer-Merge: drop -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Beaver's drop function here
        return false;

        // <<-- /Creer-Merge: drop -->>
    },

    /**
     * Harvests the branches or fish from a Spawner on an adjacent tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The tile you want to harvest.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if successfully harvested, false otherwise.
     */
    harvest: function(player, tile, asyncReturn) {
        // <<-- Creer-Merge: harvest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const neighbors = [this.tile.tileNorth, this.tile.tileEast,
                           this.tile.tileSouth, this.tile.tileWest];
        let gathered = 0;

        if(tile === null) {
            // set reason
            return false;
        }
        if(tile.spawner === null) {
            // set reason
            return false;
        }
        if(!(tile in neighbors)) {
            // set reason
            return false;
        }

        const load = this.fish + this.branches;

        if(load >= this.job.carryLimit) {
            // set reason
            return false;
        }

        const available = Math.pow(2, tile.spawner.health);
        const space = this.job.carryLimit - load;
        let skill = this.job.fishing;
        let container = this.fish;

        if(tile.spawner.type === "Branch") {
            skill = this.job.chopping;
            container = this.branches;
        }

        gathered = available < skill ? available : skill;
        gathered = gathered > space ? space : gathered;
        container += gathered;

        if(tile.spawner.health > 0) {
            tile.spawner.health--;
        }

        return gathered > 0;
        // <<-- /Creer-Merge: harvest -->>
    },

    /**
     * Moves this beaver from its current tile to an adjacent tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The tile this beaver should move to. Costs 2 moves normally, 3 if moving upstream, and 1 if moving downstream.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the move worked, false otherwise.
     */
    move: function(player, tile, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Beaver's move function here
        return false;

        // <<-- /Creer-Merge: move -->>
    },

    /**
     * Picks up some branches or fish on the beaver's tile.
     *
     * @param {Player} player - the player that called this.
     * @param {string} resource - The type of resource to pickup ('branch' or 'fish').
     * @param {number} amount - The amount of the resource to drop, numbers <= 0 will pickup all of that type.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if successfully picked up a resource, false otherwise.
     */
    pickup: function(player, resource, amount, asyncReturn) {
        // <<-- Creer-Merge: pickup -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Beaver's pickup function here
        return false;

        // <<-- /Creer-Merge: pickup -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Beaver;

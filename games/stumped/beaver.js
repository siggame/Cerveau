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

        if(!this.job) {
            this.job = this.game.jobs[0];
        }

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

        let reason;

        if(!player || player !== this.game.currentPlayer) {
            reason = `${player} it is not your turn.`;
        }
        else if(this.owner !== player) {
            reason = `${this} is not owned by you.`;
        }
        else if(this.health <= 0) {
            reason = `${this} is dead.`;
        }
        else if(!tile) {
            reason = `${tile} is not a valid Tile.`;
        }
        else if(!tile.beaver) {
            reason = `No beaver exists on tile ${tile}.`;
        }
        else if(!this.tile.hasNeighbor(tile)) {
            reason = `${tile} is not adjacent to beaver attacking.`;
        }
        else if(this.distracted) {
            reason = `${this} is distracted.`;
        }
        else if(!this.actions) {
            reason = `${this} does not have any actions left.`;
        }

        if(reason) {
            return this.game.logicError(false, reason);
        }

        // If no errors occur
        tile.beaver.health -= this.beaver.job.damage;
        this.actions--;
        tile.beaver.distracted = tile.beaver.distracted || this.jobs.distracts;

        if(tile.beaver.health <= 0) {
            tile.branches += tile.beaver.branches;
            tile.fish += tile.beaver.fish;
            tile.beaver.branches = -1;
            tile.beaver.fish = -1;
            tile.beaver.actions = -1;
            tile.beaver.moves = -1;
            tile.beaver.health = -1;
            tile.beaver.distracted = -1;
            tile.beaver.tile = null;
            tile.beaver = null;
        }
        return true;

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

        let reason = this._check(player, this.tile);
        if(reason) {
            // reason already exists, don't update with new reason
        }
        else if(this.actions <= 0) {
            reason = `${this} has no more actions.`;
        }
        else if((this.branches + this.tile.branches) < player.branchesToBuildLodge) {
            reason = `${this} does not have enough branches to build the lodge.`;
        }
        else if(this.tile.lodgeOwner !== null) {
            reason = `${this.tile} already has a lodge owned by ${this.tile.lodgeOwner}.`;
        }
        else if(this.tile.spawner !== null) {
            reason = `${this.tile} has a spawner which cannot be built over.`;
        }

        if(reason) {
            return this.game.logicError(false, reason);
        }

        // valid, build lodge

        // overcharge tile's branches
        this.tile.branches -= player.branchesToBuildLodge;
        if(this.tile.branches < 0) {
            // make up difference with this beaver's branches
            // NOTE tile has a debt, ie a negative value being added
            this.branches += this.tile.branches;
            this.tile.branches = 0;
        }
        this.actions--;
        this.tile.lodgeOwner = player;
        this.player.lodges.push(this.tile);

        return true;
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

        let reason;

        if(!player || player !== this.game.currentPlayer) {
            reason = `${player} it is not your turn.`;
        }
        else if(this.owner !== player) {
            reason = `${this} is not owned by you.`;
        }
        else if(this.health <= 0) {
            reason = `${this} is dead.`;
        }
        else if(this.distracted) {
            reason = `${this.distracted} turns til ${this} is not distracted and is able to drop resources.`;
        }
        else if(!this.actions) {
            reason = `${this} does not have any actions left.`;
        }
        else if(resource[0] === "f" && amount > this.fish) {
            reason = `${this} does not have ${amount} fish to drop.`;
        }
        else if(resource[0] === "b" && amount > this.branches) {
            reason = `${this} does not have ${amount} branch(es) to drop.`;
        }
        else if(resource[0] !== "f" && resource[0] !== "b") {
            reason = `${resource} is not a valid resource.`;
        }
        else if(amount < 0) {
            reason = `${this} can not drop a negative amount of ${resource}.`;
        }

        if(reason) {
            return this.game.logicError(false, reason);
        }

        // If no errors occur
        this.actions--;

        if(resource[0] === "f") {
            this.tile.fish += amount;
            this.fish -= amount;
        }
        else {  // (resource[0] === "b")
            this.tile.branches += amount;
            this.branches -= amount;
        }

        return true;
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
        let reason = this._check(player, tile);
        let gathered = 0;
        const load = this.fish + this.branches;

        if(reason) {
            // reason exists, don't update with new reason
        }
        else if(!this.tile.hasNeighbor(tile)) {
            reason = `${this} on tile ${this.tile} is not adjacent to ${tile}.`;
        }
        else if(this.actions <= 0) {
            reason = `${this} has no actions available.`;
        }
        else if(load >= this.job.carryLimit) {
            reason = `Beaver cannot carry more. Limit: (${load}/${this.job.carryLimit})`;
        }

        if(reason) {
            return this.game.logicError(false, reason);
        }

        const available = Math.pow(2 /* tbd */, tile.spawner.health);
        const space = this.job.carryLimit - load;
        let skill = this.job.fishing;
        let container = "fish";

        if(tile.spawner.type === "Branch") {
            skill = this.job.chopping;
            container = "branches";
        }

        gathered = available < skill ? available : skill;
        gathered = gathered > space ? space : gathered;
        this[container] += gathered;
        this.actions--;

        if(tile.spawner.health > 0) {
            tile.spawner.health--;
        }

        return true;
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

        let reason = this._check(player, tile);
        let moveCost = 2;

        if(reason) {
            // don't update to a new reason, use the first invalid reason
        }
        else if(this.moves <= 0) {
            reason = `${this} is out of movement.`;
        }
        else if(tile.beaver !== null) {
            reason = `${tile} is already occupied by ${tile.beaver}.`;
        }
        else if(tile.lodgeOwner !== null && tile.lodgeOwner !== player) {
            reason = `${tile} contains an enemy lodge!`;
        }
        else if(tile.spawner !== null) {
            reason = `${tile} contains ${tile.spawner}!`;
        }
        else {
            if(this.tile.tileAgainstFlow(tile)) {
                moveCost++;
            }

            if(this.tile.isInFlowDirection(tile)) {
                moveCost--;
            }

            if(moveCost > this.moves) {
                reason = `${tile} costs ${moveCost} to reach and ${this} has ${this.moves}.`;
            }
        }

        if(reason) {
            return this.game.logicError(false, reason);
        }

        // Here is valid!
        // remove me from the time I was on
        this.tile.beaver = null;
        // update target tile's beaver to this beaver
        tile.beaver = this;
        // update this beaver's tile to target tile
        this.tile = tile;
        // decrement this beaver's moves count by the move cost
        this.moves -= moveCost;

        return true;
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
        let tile = this.tile;
        // <<-- Creer-Merge: pickup -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Beaver's pickup function here
        let reason = this._check(player, tile);

        if(this.health <= 0 ) {
            reason = `${this} is dead.`;
        }
        else if(this.actions <= 0) {
            reason = `${this} can not take any more actions this turn.`;
        }
        else if(resource[0] !== "f" && resource[0] !== "b") {
            reason = `${resource} that is not a valid resource.`;
        }
        else if(resource[0] === "b" && this.tile.branches < amount) {
            reason = `${this.tile} does not have ${amount} branch(es).`;
        }
        else if(resource[0] === "f" && this.tile.fish < amount ) {
            reason = `${this.tile} does not have ${amount} fish.`;
        }
        else if((this.job.carryLimmit - (this.fish + this.branches)) < amount ) {
            reason = `${this} does not have the carry capicity for this amount.` ;
        }
        else if(this.distracted > 0) {
            reason = `${this.distracted} turns til ${this} is not distracted and is able to pick up resources.`;
        }
        else if(amount < 0) {
            reason = `${this} can not pick up a negative amount of ${resource}.`;
        }

        if(reason) {
            return this.game.logicError(false, reason);
        }

        // If no errors occur
        this.actions--;

        if(resource[0] === "b") {
            this.branches += amount;
            this.tile.branches -= amount;
        }
        else { // (resource[0] === "f") {
            this.fish += amount;
            this.tile.fish -= amount;
        }

        return true;

        // <<-- /Creer-Merge: pickup -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    /**
     * Checks if this Beaver can do things based on the player and tile (can move, attack, etc)
     * @param {Player} player - the player commanding this Beeaver
     * @param {Tile} tile - the tile trying to do something to
     * @returns {string|undefined} the reason this is invalid (still in need of formatting), undefined if valid
     */
    _check: function(player, tile) {
        if(!player || player !== this.game.currentPlayer) {
            return `${player} it is not your turn.`;
        }
        else if(this.owner !== player) {
            return `${this} is not owned by you.`;
        }
        else if(this.health <= 0) {
            return `${this} is dead.`;
        }
        else if(this.distracted > 0) {
            return `${this} is distracted for ${this.distracted} more turns.`;
        }
        else if(!tile) {
            return `${tile} is not a valid Tile.`;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Beaver;

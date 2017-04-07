// Beaver: A beaver in the game.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

//<<-- /Creer-Merge: requires -->>

// @class Beaver: A beaver in the game.
let Beaver = Class(GameObject, {
    /**
     * Initializes Beavers.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The number of actions remaining for the Beaver this turn.
         *
         * @type {number}
         */
        this.actions = this.actions || 0;

        /**
         * The amount of branches this Beaver is holding.
         *
         * @type {number}
         */
        this.branches = this.branches || 0;

        /**
         * The amount of food this Beaver is holding.
         *
         * @type {number}
         */
        this.food = this.food || 0;

        /**
         * How much health this Beaver has left.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * The Job this Beaver was recruited to do.
         *
         * @type {Job}
         */
        this.job = this.job || null;

        /**
         * How many moves this Beaver has left this turn.
         *
         * @type {number}
         */
        this.moves = this.moves || 0;

        /**
         * The Player that owns and can control this Beaver.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * True if the Beaver has finished being recruited and can do things, False otherwise.
         *
         * @type {boolean}
         */
        this.recruited = this.recruited || false;

        /**
         * The Tile this Beaver is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;

        /**
         * Number of turns this Beaver is distracted for (0 means not distracted).
         *
         * @type {number}
         */
        this.turnsDistracted = this.turnsDistracted || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // start with the max health as defined by our job
        this.health = this.job.health;
        this.actions = this.job.actions;
        this.moves = this.job.moves;

        this.game.newBeavers.push(this);

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Beaver",


    /**
     * Invalidation function for attack
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Beaver} beaver - The Beaver to attack. Must be on an adjacent Tile.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateAttack: function(player, beaver, args) {
        // <<-- Creer-Merge: invalidateAttack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player);
        if(invalid) {
            return invalid;
        }

        if(!beaver) {
            return `${beaver} is not a valid beaver for ${this} to attack.`;
        }

        if(!beaver.recruited) {
            return `${beaver} has not finished being recruited yet, and cannot be attacked yet.`;
        }

        if(!this.tile.hasNeighbor(beaver.tile)) {
            return `${beaver} is not adjacent to ${this} beaver to be attacked.`;
        }

        // <<-- /Creer-Merge: invalidateAttack -->>
    },

    /**
     * Attacks another adjacent beaver.
     *
     * @param {Player} player - the player that called this.
     * @param {Beaver} beaver - The Beaver to attack. Must be on an adjacent Tile.
     * @returns {boolean} True if successfully attacked, false otherwise.
     */
    attack: function(player, beaver) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        beaver.health = Math.max(0, beaver.health, this.job.damage);
        beaver.turnsDistracted = beaver.turnsDistracted || this.job.distractionPower; // if the beaver is already distracted, keep that value, otherwise they get distracted by this attack
        this.actions--;

        // check if the enemy beaver died
        if(beaver.health <= 0) {
            // drop it's resources on the ground
            beaver.tile.branches += beaver.branches;
            beaver.food += beaver.food;

            // and set its values to invalid numbers to signify it is dead
            beaver.branches = -1;
            beaver.food = -1;
            beaver.actions = -1;
            beaver.moves = -1;
            beaver.turnsDistracted = -1;

            // remove him from the map of tiles
            beaver.tile.beaver = null;
            beaver.tile = null;
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    },


    /**
     * Invalidation function for buildLodge
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateBuildLodge: function(player, args) {
        // <<-- Creer-Merge: invalidateBuildLodge -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player);
        if(invalid) {
            return invalid;
        }

        if((this.branches + this.tile.branches) < player.branchesToBuildLodge) {
            return `${this} does not have enough branches to build the lodge.`;
        }

        if(this.tile.lodgeOwner !== null) {
            return `${this.tile} already has a lodge owned by ${this.tile.lodgeOwner}.`;
        }

        if(this.tile.spawner !== null) {
            return `${this.tile} has a spawner which cannot be built over.`;
        }

        // <<-- /Creer-Merge: invalidateBuildLodge -->>
    },

    /**
     * Builds a lodge on the Beavers current Tile.
     *
     * @param {Player} player - the player that called this.
     * @returns {boolean} True if successfully built a lodge, false otherwise.
     */
    buildLodge: function(player) {
        // <<-- Creer-Merge: buildLodge -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // overcharge tile's branches
        this.tile.branches -= player.branchesToBuildLodge;
        if(this.tile.branches < 0) {
            // make up difference with this beaver's branches
            // NOTE tile has a debt, ie a negative value being added
            this.branches += this.tile.branches;
            this.tile.branches = 0;
        }

        this.tile.branches = player.player.branchesToBuildLodge; // all the branches are now on this tile to makeup the lodge
        this.tile.lodgeOwner = player;
        this.owner.lodges.push(this.tile);
        this.actions--;

        player.calculateBranchesToBuildLodge();

        return true;

        // <<-- /Creer-Merge: buildLodge -->>
    },


    /**
     * Invalidation function for drop
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to drop branches/food on. Must be the same Tile that the Beaver is on, or an adjacent one.
     * @param {string} resource - The type of resource to drop ('branch' or 'food').
     * @param {number} amount - The amount of the resource to drop, numbers <= 0 will drop all the resource type.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateDrop: function(player, tile, resource, amount, args) {
        // <<-- Creer-Merge: invalidateDrop -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player);
        if(invalid) {
            return invalid;
        }

        // transform the resource into the first, lower cased, character.
        // We only need to know 'f' vs 'b' to tell what resource type.
        const char = resource[0].toLowerCase();

        if(char !== "f" && char !== "b") {
            return `${resource} is not a valid resource to drop.`;
        }

        // now clean the actual resource
        resource = char === "f" ? "food" : "branches";

        // transform the amount if they passed in a number =< 0
        if(amount <= 0) {
            amount = this[resource];
        }

        if(amount <= 0) {
            return `${this} cannot drop ${amount} of ${resource}`;
        }

        if(amount > this[resource]) {
            return `${this} does not have ${amount} ${resource} to drop.`;
        }

        if(!tile) {
            return `${tile} is not a valid tile to drop resources on.`;
        }

        if(this.tile !== tile && !this.tile.hasNeighbor(tile)) {
            return `${tile} is not the adjacent to or equal to the tile ${this} is on (${this.tile})`;
        }

        if(tile.spawner) {
            return `${tile} has ${tile.spawner} on it, and cannot have resourced dropped onto it.`;
        }

        // looks valid, let's update the args for the actual drop function
        args.amount = amount;
        args.resource = resource;

        // <<-- /Creer-Merge: invalidateDrop -->>
    },

    /**
     * Drops some of the given resource on the beaver's Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to drop branches/food on. Must be the same Tile that the Beaver is on, or an adjacent one.
     * @param {string} resource - The type of resource to drop ('branch' or 'food').
     * @param {number} amount - The amount of the resource to drop, numbers <= 0 will drop all the resource type.
     * @returns {boolean} True if successfully dropped the resource, false otherwise.
     */
    drop: function(player, tile, resource, amount) {
        // <<-- Creer-Merge: drop -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this[resource] -= amount;
        tile[resource] += amount;
        this.actions--;

        return true;

        // <<-- /Creer-Merge: drop -->>
    },


    /**
     * Invalidation function for harvest
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Spawner} spawner - The Spawner you want to harvest. Must be on an adjacent Tile.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateHarvest: function(player, spawner, args) {
        // <<-- Creer-Merge: invalidateHarvest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player);
        if(invalid) {
            return invalid;
        }

        if(!this.tile.hasNeighbor(spawner.tile)) {
            return `${this} on tile ${this.tile} is not adjacent to ${spawner.tile}.`;
        }

        const load = this.food + this.branches;
        if(load >= this.job.carryLimit) {
            return `Beaver cannot carry any more resources. Limit: (${load}/${this.job.carryLimit})`;
        }

        // <<-- /Creer-Merge: invalidateHarvest -->>
    },

    /**
     * Harvests the branches or food from a Spawner on an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Spawner} spawner - The Spawner you want to harvest. Must be on an adjacent Tile.
     * @returns {boolean} True if successfully harvested, false otherwise.
     */
    harvest: function(player, spawner) {
        // <<-- Creer-Merge: harvest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const load = this.food + this.branches;
        const spaceAvailable = this.job.carryLimit - load;
        const skillScalar = spawner.type === "branches" ? this.job.chopping : this.job.munching;
        const maxCanHarvest = this.game.spawnerHarvestConstant * spawner.health * skillScalar;

        this[spawner.type] += Math.min(spaceAvailable, maxCanHarvest);
        this.actions--;

        // damage the spawner because we harvested from it
        if(spawner.health > 0) {
            spawner.health--;
        }

        spawner.hasBeenHarvested = true;

        return true;

        // <<-- /Creer-Merge: harvest -->>
    },


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Beaver should move to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player, true);
        if(invalid) {
            return invalid;
        }

        if(this.moves <= 0) {
            return `${this} is out of moves.`;
        }

        if(!tile) {
            return `${tile} is not a valid tile to move to.`;
        }

        if(tile.beaver) {
            return `${tile} is already occupied by ${tile.beaver}.`;
        }

        if(tile.lodgeOwner && tile.lodgeOwner !== player) {
            return `${tile} contains an enemy lodge.`;
        }

        if(tile.spawner) {
            return `${tile} contains ${tile.spawner}.`;
        }

        const movementCost = this.tile.getMovementCost(tile);
        if(isNaN(movementCost)) {
            return `${tile} is not adjacent to ${this.tile}`;
        }

        if(this.moves < movementCost) {
            return `${tile} costs ${movementCost} to reach, and ${this} only has ${this.moves} moves.`;
        }

        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves this Beaver from its current Tile to an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Beaver should move to.
     * @returns {boolean} True if the move worked, false otherwise.
     */
    move: function(player, tile) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // calculate movement cost before moving
        let cost = this.tile.getMovementCost(tile);

        // update target tile's beaver to this beaver
        tile.beaver = this;

        // remove me from the time I was on
        this.tile.beaver = null;

        // update this beaver's tile to target tile
        this.tile = tile;

        // finally decrement this beaver's moves count by the move cost
        this.moves -= cost;

        return true;
        // <<-- /Creer-Merge: move -->>
    },


    /**
     * Invalidation function for pickup
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to pickup branches/food from. Must be the same Tile that the Beaver is on, or an adjacent one.
     * @param {string} resource - The type of resource to pickup ('branch' or 'food').
     * @param {number} amount - The amount of the resource to drop, numbers <= 0 will pickup all of the resource type.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidatePickup: function(player, tile, resource, amount, args) {
        // <<-- Creer-Merge: invalidatePickup -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player);
        if(invalid) {
            return invalid;
        }

        if(!tile) {
            return `${tile} is not a valid tile to pick up resources from.`;
        }

        if(this.tile !== tile && !this.tile.hasNeighbor(tile)) {
            return `${tile} is not the adjacent to or equal to the tile ${this} is on (${this.tile})`;
        }

        if(tile.spawner) {
            return `${tile} has ${tile.spawner} on it, and cannot have resources picked up from it.`;
        }

        // transform the resource into the first, lower cased, character.
        // We only need to know 'f' vs 'b' to tell what resource type.
        const char = resource[0].toLowerCase();

        if(char !== "f" && char !== "b") {
            return `${resource} is not a valid resource to pick up.`;
        }

        // now clean the actual resource
        resource = char === "f" ? "food" : "branches";

        // Calculate max resources the beaver can carry
        const spaceAvailable = this.job.carryLimit - this.branches - this.food;

        // transform the amount if they passed in a number =< 0
        if(amount <= 0) {
            amount = Math.min(tile[resource], spaceAvailable);
        }

        if(amount <= 0) {
            return `${this} cannot pick up ${amount} of ${resource}`;
        }

        if(amount > tile[resource]) {
            return `${tile} does not have ${amount} ${resource} to pick up.`;
        }

        if(amount > spaceAvailable) {
            return `${this} cannot carry ${amount} of ${resource} because it only can carry ${spaceAvailable} more resources`;
        }

        // looks valid, let's update the args for the actual drop function
        args.amount = amount;
        args.resource = resource;

        // <<-- /Creer-Merge: invalidatePickup -->>
    },

    /**
     * Picks up some branches or food on the beaver's tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to pickup branches/food from. Must be the same Tile that the Beaver is on, or an adjacent one.
     * @param {string} resource - The type of resource to pickup ('branch' or 'food').
     * @param {number} amount - The amount of the resource to drop, numbers <= 0 will pickup all of the resource type.
     * @returns {boolean} True if successfully picked up a resource, false otherwise.
     */
    pickup: function(player, tile, resource, amount) {
        // <<-- Creer-Merge: pickup -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        tile[resource] -= amount;
        this[resource] += amount;
        this.actions--;

        // if the tile is a lodge, and it has reached 0 branches, it is no longer a lodge
        if(tile.lodgeOwner && tile.branches === 0) {
            const lodgeOwner = tile.lodgeOwner;
            lodgeOwner.lodges.removeElement(tile);
            tile.lodgeOwner = null;
            lodgeOwner.calculateBranchesToBuildLodge();
        }

        return true;

        // <<-- /Creer-Merge: pickup -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    /**
     * Tries to invalidate args for an action function
     *
     * @param {Player} player - the player commanding this Beaver
     * @param {boolean} [dontCheckActions] - pass true to not check if the beaver has enough actions
     * @returns {string|undefined} the reason this is invalid, undefined if looks valid so far
     */
    _invalidate: function(player, dontCheckActions) {
        if(!player || player !== this.game.currentPlayer) {
            return `${player} it is not your turn.`;
        }

        if(this.owner !== player) {
            return `${this} is not owned by you.`;
        }

        if(this.health <= 0) {
            return `${this} is dead.`;
        }

        if(this.turnsDistracted > 0) {
            return `${this} is distracted for ${this.turnsDistracted} more turns.`;
        }

        if(!this.recruited) {
            return `${this} is still being recruited and cannot be ordered yet.`;
        }

        if(!dontCheckActions && this.actions <= 0) {
            return `${this} does not have any actions left.`;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Beaver;

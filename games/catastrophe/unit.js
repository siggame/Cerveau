// Unit: A unit in the game.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Unit: A unit in the game.
let Unit = Class(GameObject, {
    /**
     * Initializes Units.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * Whether this Unit has performed its action this turn.
         *
         * @type {boolean}
         */
        this.acted = this.acted || false;

        /**
         * The amount of energy this Unit has (from 0.0 to 100.0).
         *
         * @type {number}
         */
        this.energy = this.energy || 0;

        /**
         * The amount of food this Unit is holding.
         *
         * @type {number}
         */
        this.food = this.food || 0;

        /**
         * The Job this Unit was recruited to do.
         *
         * @type {Job}
         */
        this.job = this.job || null;

        /**
         * The amount of materials this Unit is holding.
         *
         * @type {number}
         */
        this.materials = this.materials || 0;

        /**
         * The tile this Unit is moving to. This only applies to neutral fresh humans spawned on the road. Otherwise, the tile this Unit is on.
         *
         * @type {Tile}
         */
        this.movementTarget = this.movementTarget || null;

        /**
         * How many moves this Unit has left this turn.
         *
         * @type {number}
         */
        this.moves = this.moves || 0;

        /**
         * The Player that owns and can control this Unit, or null if the Unit is neutral.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The Units in the same squad as this Unit. Units in the same squad attack and defend together.
         *
         * @type {Array.<Unit>}
         */
        this.squad = this.squad || [];

        /**
         * Whether this Unit is starving. Starving Units regenerate energy at half the rate they normally would while resting.
         *
         * @type {boolean}
         */
        this.starving = this.starving || false;

        /**
         * The Tile this Unit is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;

        /**
         * The number of turns before this Unit dies. This only applies to neutral fresh humans created from combat. Otherwise, 0.
         *
         * @type {number}
         */
        this.turnsToDie = this.turnsToDie || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        this.energy = data.energy || 100;
        this.job = data.job || this.game.jobs[0];
        this.moves = this.job.moves;
        this.owner = data.owner || null;
        this.tile = data.tile || null;
        this.turnsToDie = data.turnsToDie || -1;
        this.movementTarget = data.movementTarget || null;

        this.game.units.push(this);
        if(this.owner) {
            this.owner.units.push(this);
            this.owner.calculateSquads();
        }
        else {
            this.squad = [this];
        }
        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Unit",


    /**
     * Invalidation function for attack
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateAttack: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateAttack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, false);
        if(reason) {
            return reason;
        }

        if(this.job.title !== "soldier") {
            return `${this} cannot attack as they are not a soldier! Their only combat ability is as a meatshield!`;
        }
        if(!tile) {
            return `${this} needs to know which tile to attack!`;
        }
        if(tile !== this.tile.tileEast && tile !== this.tile.tileNorth && tile !== this.tile.tileSouth && tile !== this.tile.tileWest) {
            return `${tile} is not adjacent to ${this}.`;
        }

        if(tile.structure && tile.structure.type !== "road") {
            // Attacking a structure, no checks needed here
        }
        else if(tile.unit) {
            // Attacking a unit
            if(tile.unit.owner === player) {
                return `${this} can't attack friends!`;
            }
        }
        else {
            return `There is nothing on ${tile} for ${this} to attack!`;
        }
        // <<-- /Creer-Merge: invalidateAttack -->>
    },

    /**
     * Attacks an adjacent Tile. Costs an action for each Unit in this Unit's squad. Units in the squad without an action don't participate in combat. Units in combat cannot move afterwards. Attacking structures will not give materials.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @returns {boolean} True if successfully attacked, false otherwise.
     */
    attack: function(player, tile) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        let attackSum = 0; // damage to be distributed
        let toDie = new Set(); // update dead later
        for(let soldier of this.squad) {
            let attackMod = 1;// damage modifier, if unit near allied monument
            if(!soldier.acted) { // if soldier hasn't acted
                if(soldier.inRange("monument")) {
                    attackMod = this.game.monumentCostMult;
                } // if ally monument nearby, take less dmg from contributing
                soldier.energy -= soldier.job.actionCost * attackMod;
                soldier.acted = true;
                soldier.moves = 0;
                attackSum += soldier.job.actionCost;
                if(soldier.energy <= 0) { // if died
                    attackSum += soldier.energy / attackMod; // soldier.energy is negative here, can only contribute as much energy as unit has
                    toDie.add(soldier);
                }
            }
        }

        // EVERYTHING BEFORE IS CALCULATING DAMAGE, AFTER IS DEALING THE DAMAGE
        if(tile.structure && tile.structure.type !== "road") { // checking if unit or attackable structure
            // Attack a structure
            tile.structure.materials -= attackSum;
            if(tile.structure.materials <= 0) {
                // Structure will get removed from arrays in next turn logic
                tile.structure.tile = null;
                tile.structure = null;
            }
        }
        else { // assuming unit, which it should be if not a structure
            // Attack a unit/squad
            for(let target of tile.unit.squad) {
                let attackMod = 1; // damage modifier
                if(target.inRange("monument")) {
                    // if near enemy monument, take less dmg
                    attackMod = this.game.monumentCostMult;
                }
                target.energy -= attackSum * attackMod / tile.unit.squad.length;
                if(target.energy <= 0) {
                    toDie.add(target);
                }
            }
        }

        // IT'S KILLING TIME
        for(let dead of toDie) {
            // Drop carried resources
            dead.tile.food += dead.food;
            dead.tile.materials += dead.materials;
            dead.food = 0;
            dead.materials = 0;

            if(dead.owner) {
                if(dead.job.title !== "cat overlord") {
                    // actually fresh human converting time, not in fact killing time
                    dead.job = this.game.jobs[0];
                    dead.turnsToDie = 10;
                    dead.energy = 100;
                    dead.squad = [dead];

                    // Don't actually remove it from the player's units array yet
                    dead.owner.defeatedUnits.push(dead);

                    // Make sure the previous owner can't control it anymore
                    dead.owner = null;
                }
            }
            else {
                // Neutral fresh human, will get removed from arrays in next turn logic
                dead.tile.unit = null;
                dead.tile = null;
            }
        }

        // updating squads
        for(let player of this.game.players) {
            player.calculateSquads();
        }

        return true;
        // <<-- /Creer-Merge: attack -->>
    },


    /**
     * Invalidation function for changeJob
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The name of the Job to change to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateChangeJob: function(player, job, args) {
        // <<-- Creer-Merge: invalidateChangeJob -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, false);
        if(reason) {
            return reason;
        }

        job = job.toLowerCase();
        job = this.game.jobs.find(j => j.title === job);
        if(!job) {
            return `You must pass in a valid job to change the job for ${this}.`;
        }
        if(this.job.title === "cat overlord" || job.title === "cat overlord") {
            return `${this} is the overlord. He cannot change jobs, and humans cannot become cats.`;
        }
        if(this.job === job) {
            return `${this} cannot change to your own job!`;
        }
        if(this.energy < 100) {
            return `${this} must be at 100 energy to change jobs`;
        }
        if(Math.abs(this.tile.x - player.cat.tile.x) > 1 || Math.abs(this.tile.y - player.cat.tile.y) > 1) {
            return `${this} must be adjacent or diagonal to your cat to change jobs`;
        }
        // <<-- /Creer-Merge: invalidateChangeJob -->>
    },

    /**
     * Changes this Unit's Job. Must be at max energy (100.0) to change Jobs.
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The name of the Job to change to.
     * @returns {boolean} True if successfully changed Jobs, false otherwise.
     */
    changeJob: function(player, job) {
        // <<-- Creer-Merge: changeJob -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        job = job.toLowerCase();
        this.job = this.game.jobs.find(j => j.title === job);
        this.acted = true;
        this.moves = 0; // It takes all their time
        this.tile.food += this.food;
        this.tile.materials += this.materials;
        this.food = 0;
        this.materials = 0;
        this.owner.calculateSquads();
        return true;
        // <<-- /Creer-Merge: changeJob -->>
    },


    /**
     * Invalidation function for construct
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to construct the Structure on. It must have enough materials on it for a Structure to be constructed.
     * @param {string} type - The type of Structure to construct on that Tile.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateConstruct: function(player, tile, type, args) {
        // <<-- Creer-Merge: invalidateConstruct -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, true);

        if(reason) {
            return reason;
        }
        else if(this.job.title !== "builder") {
            return `${this} is not a builder. Only builders can construct!`;
        }
        else if(tile.structure) {
            return `${tile} already has a structure! ${this} cannot construct here!`;
        }

        // Check structure type and if they have enough materials
        type = type.toLowerCase();
        let matsNeeded = 0;
        if(type === "wall" || type === "shelter" || type === "monument") {
            matsNeeded = this.game.structureCost(type);
        }
        else {
            return `Unknown structure '${type}'. You can only build 'wall', 'shelter', or 'monument'.`;
        }

        if(tile.materials < matsNeeded) {
            return `There aren't enough materials on ${tile}. You need ${matsNeeded} to construct a ${type}.`;
        }
        // <<-- /Creer-Merge: invalidateConstruct -->>
    },

    /**
     * Constructs a Structure on an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to construct the Structure on. It must have enough materials on it for a Structure to be constructed.
     * @param {string} type - The type of Structure to construct on that Tile.
     * @returns {boolean} True if successfully constructed a structure, false otherwise.
     */
    construct: function(player, tile, type) {
        // <<-- Creer-Merge: construct -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        tile.structure = this.game.create("Structure", {
            type: type.toLowerCase(),
            tile: tile,
            owner: player,
        });

        const mult = this.inRange("monument") ? this.game.monumentCostMult : 1;
        this.energy -= this.job.actionCost * mult;
        tile.materials -= tile.structure.materials;
        tile.harvestRate = 0;

        return true;
        // <<-- /Creer-Merge: construct -->>
    },


    /**
     * Invalidation function for convert
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile with the Unit to convert.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateConvert: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateConvert -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, true);
        if(reason) {
            return reason;
        }

        if(this.job.title !== "missionary") {
            return `${this} isn't a missionary and is thus unable to convince units to join you cul- I mean kingdom.`;
        }
        if(!tile) {
            return `${this} can't convert a nonexistent tile to your cause.`;
        }
        if(tile !== this.tile.tileNorth && tile !== this.tile.tileSouth && tile !== this.tile.tileEast && tile !== this.tile.tileWest) {
            return `${this} can only convert units on adjacent tiles.`;
        }
        if(!tile.unit) {
            return `${this} must convert a unit. There is no unit on ${tile}.`;
        }
        if(tile.unit.owner) {
            return `The unit on ${tile} is already owned by somebody. ${this} can't convert it.`;
        }
        // <<-- /Creer-Merge: invalidateConvert -->>
    },

    /**
     * Converts an adjacent Unit to your side.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile with the Unit to convert.
     * @returns {boolean} True if successfully converted, false otherwise.
     */
    convert: function(player, tile) {
        // <<-- Creer-Merge: convert -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Unit will be added to the player's units array at the start of their next turn
        tile.unit.turnsToDie = -1;
        tile.unit.owner = player;
        tile.unit.energy = 100;
        tile.unit.acted = true;
        tile.unit.moves = 0;
        tile.unit.movementTarget = null;
        const mult = this.inRange("monument") ? this.game.monumentCostMult : 1;
        this.energy -= this.job.actionCost * mult;
        this.acted = true;
        player.newUnits.push(tile.unit);
        return true;
        // <<-- /Creer-Merge: convert -->>
    },


    /**
     * Invalidation function for deconstruct
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to deconstruct. It must have a Structure on it.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateDeconstruct: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateDeconstruct -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, true);
        if(reason) {
            return reason;
        }

        if(!tile.structure) {
            return `No structure on ${tile} for ${this} to deconstruct.`;
        }
        if(tile.structure.type === "road") {
            return `${this} cannot deconstruct roads!`;
        }
        else if(this.job.title !== "builder") {
            return `${this} is not a builder. Only builders can deconstruct.`;
        }
        else if(this.owner === tile.structure.owner) {
            return `${this} cannot deconstruct friendly structures. Soldiers can destroy them by attacking them, though.`;
        }
        else if(this.materials + this.food >= this.job.carryLimit) {
            return `${this} cannot carry any more materials.`;
        }
        // <<-- /Creer-Merge: invalidateDeconstruct -->>
    },

    /**
     * Removes materials from an adjacent Tile's Structure. You cannot deconstruct friendly structures (see Unit.attack).
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to deconstruct. It must have a Structure on it.
     * @returns {boolean} True if successfully deconstructed, false otherwise.
     */
    deconstruct: function(player, tile) {
        // <<-- Creer-Merge: deconstruct -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Take materials from the structure
        let amount = Math.min(this.job.carryLimit - this.materials - this.food, tile.structure.materials);
        this.materials += amount;
        tile.structure.materials -= amount;

        // Destroy structure if it's out of materials
        if(tile.structure.materials <= 0) {
            // Structure is removed from arrays in next turn logic
            tile.structure.tile = null;
            tile.structure = null;
        }

        const mult = this.inRange("monument") ? this.game.monumentCostMult : 1;
        this.energy -= this.job.actionCost * mult;
        this.acted = true;
        return true;
        // <<-- /Creer-Merge: deconstruct -->>
    },


    /**
     * Invalidation function for drop
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to drop materials/food on.
     * @param {string} resource - The type of resource to drop ('material' or 'food').
     * @param {number} amount - The amount of the resource to drop. Amounts <= 0 will drop as much as possible.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateDrop: function(player, tile, resource, amount, args) {
        // <<-- Creer-Merge: invalidateDrop -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, false, false);
        if(reason) {
            return reason;
        }

        if(!tile) {
            return `You must pass a tile for ${this} to drop the resources onto.`;
        }
        if(this.tile !== tile && tile !== this.tile.tileNorth && tile !== this.tile.tileSouth && tile !== this.tile.tileEast && tile !== this.tile.tileWest) {
            return `${this} can only drop things on or adjacent to your tile.`;
        }
        if(!resource || resource === "") {
            return `You need to specify a resource for ${this} to drop.`;
        }
        if(resource[0] !== "f" && resource[0] !== "F" && resource[0] !== "m" && resource[0] !== "M") {
            return `Resource for ${this} to drop must be either 'food' or 'materials'.`;
        }
        if(tile.structure) {
            if(tile.structure.type === "shelter") {
                if(tile.structure.owner !== player) {
                    return `${this} can't drop things in enemy shelters. Nice thought though.`;
                }
                else if(resource[0] !== "f" && resource[0] !== "F") {
                    return `${this} can only store food in shelters.`;
                }
            }
            else if(tile.structure.type !== "road") {
                return `${this} can't drop resources on structures.`;
            }
        }
        // <<-- /Creer-Merge: invalidateDrop -->>
    },

    /**
     * Drops some of the given resource on or adjacent to the Unit's Tile. Does not count as an action.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to drop materials/food on.
     * @param {string} resource - The type of resource to drop ('material' or 'food').
     * @param {number} amount - The amount of the resource to drop. Amounts <= 0 will drop as much as possible.
     * @returns {boolean} True if successfully dropped the resource, false otherwise.
     */
    drop: function(player, tile, resource, amount) {
        // <<-- Creer-Merge: drop -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Calculate how much is being dropped
        if(amount < 1) {
            // Drop it all
            if(resource[0] === "f" || resource[0] === "F") {
                amount = this.food;
            }
            else {
                amount = this.materials;
            }
        }

        // Drop the resource
        if(resource[0] === "f" || resource[0] === "F") {
            amount = Math.min(amount, this.food);
            if(tile.structure && tile.structure.type === "shelter") {
                this.owner.food += amount;
            }
            else {
                tile.food += amount;
            }
            this.food -= amount;
        }
        else {
            amount = Math.min(amount, this.materials);
            tile.materials += amount;
            this.materials -= amount;
        }

        return true;
        // <<-- /Creer-Merge: drop -->>
    },


    /**
     * Invalidation function for harvest
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want to harvest.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateHarvest: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateHarvest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, true);
        if(reason) {
            return reason;
        }

        if(!tile) {
            return "You cannot harvest resources off the edge of the world.";
        }
        if(tile !== this.tile && tile !== this.tile.tileNorth && tile !== this.tile.tileSouth && tile !== this.tile.tileEast && tile !== this.tile.tileWest) {
            return "You can only harvest on or adjacent to your tile.";
        }

        // Make sure unit is harvesting a valid tile
        if(tile.structure) {
            if(tile.structure.type !== "shelter" || tile.structure.owner === player) {
                return "You can only steal from enemy shelters.";
            }
        }
        else if(tile.harvestRate < 1) {
            return "You can't harvest food from that tile.";
        }
        else if(tile.turnsToHarvest !== 0) {
            return "This tile isn't ready to harvest.";
        }

        const carry = this.food + this.materials;
        if(carry >= this.job.carryLimit) {
            return "You cannot carry anymore";
        }
        // <<-- /Creer-Merge: invalidateHarvest -->>
    },

    /**
     * Harvests the food on an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want to harvest.
     * @returns {boolean} True if successfully harvested, false otherwise.
     */
    harvest: function(player, tile) {
        // <<-- Creer-Merge: harvest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const carry = this.job.carryLimit - (this.food + this.materials);
        let pickup = 0;
        if(tile.structure) {
            pickup = Math.min(tile.structure.owner.food, carry);
            tile.structure.owner.food -= pickup;
        }
        else {
            pickup = Math.min(tile.harvestRate, carry);
            tile.turnsToHarvest = this.game.turnsBetweenHarvests;
        }

        const mult = this.inRange("monument") ? this.game.monumentCostMult : 1;
        this.energy -= this.job.actionCost * mult;
        this.food += pickup;
        this.acted = true;
        return true;

        // <<-- /Creer-Merge: harvest -->>
    },


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Unit should move to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, false, false);
        if(reason) {
            return reason;
        }

        if(!tile) {
            return "You can't move to a tile that doesn't exist.";
        }
        if(tile.unit) {
            return `Can't move because the tile is already occupied by ${tile.unit}.`;
        }
        if(this.moves < 1) {
            return "Your unit is out of moves!";
        }
        if(tile !== this.tile.tileEast && tile !== this.tile.tileWest && tile !== this.tile.tileNorth && tile !== this.tile.tileSouth) {
            return "Your unit must move to a tile to the north, south, east, or west.";
        }
        if(tile.structure && tile.structure.type !== "road" && tile.structure.type !== "shelter") {
            return "Units cannot move onto structures other than roads and shelters.";
        }
        // console.log(`${this} trying to move to ${tile}`);
        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Unit should move to.
     * @returns {boolean} True if it moved, false otherwise.
     */
    move: function(player, tile) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Deduct the move from the unit
        this.moves -= 1;

        // Update the tiles
        this.tile.unit = null;
        this.tile = tile;
        tile.unit = this;

        // Recalculate squads
        this.owner.calculateSquads();
        // console.log(`${this} moving to ${tile}`);
        return true;
        // <<-- /Creer-Merge: move -->>
    },


    /**
     * Invalidation function for pickup
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to pickup materials/food from.
     * @param {string} resource - The type of resource to pickup ('material' or 'food').
     * @param {number} amount - The amount of the resource to pickup. Amounts <= 0 will pickup as much as possible.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidatePickup: function(player, tile, resource, amount, args) {
        // <<-- Creer-Merge: invalidatePickup -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, false, false);
        if(reason) {
            return reason;
        }

        if(!tile) {
            return `${this} can only pick things up off tiles that exist`;
        }
        if(this.tile !== tile && tile !== this.tile.tileNorth && tile !== this.tile.tileSouth && tile !== this.tile.tileEast && tile !== this.tile.tileWest) {
            return `${this} can only pickup resources on or adjacent to its tile.`;
        }

        if(resource[0] === "f" || resource[0] === "F") {
            if(amount < 1) {
                amount = tile.food;
            }
            else {
                amount = Math.min(tile.food, amount);
            }
        }
        else if(resource[0] === "m" || resource[0] === "M") {
            if(amount < 1) {
                amount = tile.materials;
            }
            else {
                amount = Math.min(tile.materials, amount);
            }
        }
        else {
            return `${this} can only pickup 'food' or 'materials', not ${resource}.`;
        }

        // Make sure it picks up more than 0 resources
        if(Math.floor(this.energy) <= 0) {
            return `${this} doesn't have enough energy to pickup anything.`;
        }
        if(this.carryLeft() <= 0) {
            return `${this} is already carrying as many resources as it can.`;
        }
        if(amount <= 0) {
            return `There are no resources on ${tile} for ${this} to pickup.`;
        }
        // <<-- /Creer-Merge: invalidatePickup -->>
    },

    /**
     * Picks up some materials or food on or adjacent to the Unit's Tile. Does not count as an action.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to pickup materials/food from.
     * @param {string} resource - The type of resource to pickup ('material' or 'food').
     * @param {number} amount - The amount of the resource to pickup. Amounts <= 0 will pickup as much as possible.
     * @returns {boolean} True if successfully picked up a resource, false otherwise.
     */
    pickup: function(player, tile, resource, amount) {
        // <<-- Creer-Merge: pickup -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Calculate amount being picked up
        if(amount < 1) {
            if(resource[0] === "f" && resource[0] === "F") {
                amount = tile.food;
            }
            else {
                amount = tile.materials;
            }
        }
        amount = Math.min(amount, this.carryLeft(), Math.floor(this.energy));

        // Pickup the resource
        if(resource[0] === "f" || resource[0] === "F") {
            amount = Math.min(amount, tile.food);
            tile.food -= amount;
            this.food += amount;
            this.energy -= amount;
        }
        else {
            amount = Math.min(amount, tile.materials);
            tile.materials -= amount;
            this.materials += amount;
            this.energy -= amount;
        }
        return true;
        // <<-- /Creer-Merge: pickup -->>
    },


    /**
     * Invalidation function for rest
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateRest: function(player, args) {
        // <<-- Creer-Merge: invalidateRest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        const reason = this._invalidate(player, true, false);
        if(reason) {
            return reason;
        }

        if(this.energy === 100) {
            return "The unit has full energy!";
        }
        if(!this.inRange("shelter")) {
            return "Unit must be in range of a friendly shelter to heal";
        }
        // <<-- /Creer-Merge: invalidateRest -->>
    },

    /**
     * Regenerates energy. Must be in range of a friendly shelter to rest. Costs an action. Units cannot move after resting.
     *
     * @param {Player} player - the player that called this.
     * @returns {boolean} True if successfully rested, false otherwise.
     */
    rest: function(player) {
        // <<-- Creer-Merge: rest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Get all shelters this unit is in range of
        const nearbyShelters = this.owner.allStructures().filter(structure => {
            // Make sure this structure isn't destroyed
            if(!structure.tile) {
                return false;
            }

            // Make sure this structure is a shelter
            if(structure.type !== "shelter") {
                return false;
            }

            // Make sure this shelter is in range of this unit
            const radius = structure.effectRadius;
            return Math.abs(this.tile.x - structure.tile.x) <= radius && Math.abs(this.tile.y - structure.tile.y) <= radius;
        });

        // Get a nearby shelter with a cat in range of it, or null if none
        const catShelter = nearbyShelters.find(shelter => {
            // Make sure the cat is in range of this shelter
            const cat = this.owner.cat;
            const radius = shelter.effectRadius;
            return Math.abs(cat.tile.x - shelter.tile.x) <= radius && Math.abs(cat.tile.y - shelter.tile.y) <= radius;
        });

        // Calculate the energy multiplier
        let mult = 1;
        if(this.starving) {
            mult *= this.game.starvingEnergyMult;
        }
        if(catShelter) {
            mult *= this.game.catEnergyMult;
        }

        // Add energy to this unit
        this.energy += mult * this.job.regenRate;
        if(this.energy > 100) {
            this.energy = 100;
        }

        // Make sure they can't do anything else this turn
        this.acted = true;
        this.moves = 0;
        return true;
        // <<-- /Creer-Merge: rest -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    /**
     * Tries to invalidate args for an action function
     *
     * @param {Player} player - the player commanding this Unit
     * @param {boolean} [checkAction] - true to check if this Unit has an action
     * @param {boolean} [checkEnergy] - true to check if this Unit has enough energy
     * @returns {string|undefined} the reason this is invalid, undefined if looks valid so far
     */
    _invalidate: function(player, checkAction, checkEnergy) {
        if(!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if(this.owner !== player) {
            return `${this} isn't owned by you.`;
        }

        if(checkAction && this.acted) {
            return `${this} cannot perform another action this turn.`;
        }

        const mult = this.inRange("monument") ? this.game.monumentCostMult : 1;
        if(checkEnergy && this.energy < this.job.actionCost * mult) {
            return `${this} doesn't have enough energy.`;
        }
    },

    /**
     * Checks if this unit is in range of a structure of the given type.
     *
     * @param {string} type - the type of structure to search for
     * @returns {Structure|undefined} the structure this unit is in range of, or undefined if none exist
     */
    inRange: function(type) {
        return this.game.structures.concat(this.game.newStructures).find(structure => {
            if(!structure.tile || structure.owner !== this.owner || structure.type !== type) {
                return false;
            }

            const radius = structure.effectRadius;
            return Math.abs(this.tile.x - structure.tile.x) <= radius && Math.abs(this.tile.y - structure.tile.y) <= radius;
        }, this);
    },

    /**
     * Returns how much stuff this unit can pickup or be given before hitting the carry limit
     *
     * @param {string} type - the type of structure to search for
     * @returns {Structure|undefined} the structure this unit is in range of, or undefined if none exist
     */
    carryLeft: function() {
        return this.job.carryLimit - this.materials - this.food;
    },
    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Unit;

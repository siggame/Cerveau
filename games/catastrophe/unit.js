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

        // put any initialization logic here. the base variables should be set from 'data' above

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

        // Developer: try to invalidate the game logic for Unit's attack function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateAttack -->>
    },

    /**
     * Attacks an adjacent Tile. Costs an action for each Unit in this Unit's squad. Units in the squad without an action don't participate in combat. Units in combat cannot move afterwards.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @returns {boolean} True if successfully attacked, false otherwise.
     */
    attack: function(player, tile) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's attack function here
        return false;

        // <<-- /Creer-Merge: attack -->>
    },


    /**
     * Invalidation function for changeJob
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Job} job - The Job to change to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateChangeJob: function(player, job, args) {
        // <<-- Creer-Merge: invalidateChangeJob -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: try to invalidate the game logic for Unit's changeJob function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateChangeJob -->>
    },

    /**
     * Changes this Unit's Job. Must be at max energy (100.0) to change Jobs.
     *
     * @param {Player} player - the player that called this.
     * @param {Job} job - The Job to change to.
     * @returns {boolean} True if successfully changed Jobs, false otherwise.
     */
    changeJob: function(player, job) {
        // <<-- Creer-Merge: changeJob -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's changeJob function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's construct function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's construct function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's convert function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's convert function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's deconstruct function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateDeconstruct -->>
    },

    /**
     * Removes materials from an adjacent Tile's Structure. Soldiers do not gain materials from doing this, but can deconstruct friendly Structures as well.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to deconstruct. It must have a Structure on it.
     * @returns {boolean} True if successfully deconstructed, false otherwise.
     */
    deconstruct: function(player, tile) {
        // <<-- Creer-Merge: deconstruct -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's deconstruct function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's drop function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's drop function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's harvest function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's harvest function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's move function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's move function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's pickup function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's pickup function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's rest function here
        return undefined; // meaning valid

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

        // Developer: Put your game logic for the Unit's rest function here
        return false;

        // <<-- /Creer-Merge: rest -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    //unit attacks
    invalidateAttack: function(player, tile, args) {
        if(this.job !== "soidier")
            return "The attack cannot occur as the unit is not a soldier!";
        if(this.Owner !== player)
            return "The attack cannot occur as you have to attack with your own soldiers!";
        if(tile.Unit === player)
            return "The attack cannot occur as you have to attack an enemy!";
        if(this.Acted === true)
            return "This unit has already acted and cannot attack!";
        if(tile !== this.Tile.tileEast() && tile !== this.Tile.tileNorth() && tile !== this.Tile.tileSount() && tile !== this.Tile.tileWest())
            return "The tile to attack is not next to your soldier!";
        return undefined; // meaning valid
    }
    attack: function(player, tile) { //when would I use player if invalidateAttack was run and squads wont mix teams? does this call invalidateAttack?
        let attackSum=0;//damage to be distributed
        let attackMod=1;//damage modifier, if unit near allied monument
        for(let x=this.tile.x-2; x<=this.tile.x+2; x++)  //is a soldier in it's own squad? if so this and next 14 lines arent needed
            for(let y=this.tile.y-2; y<=this.tile.y+2; y++)
                if(this.game.getTile(x, y).Structure="monument" && this.game.getTile(x, y).Owner=player)//check if ally monument nearby
                    attackMod=.5;
        this.Energy -= 25*attackMod;
        this.Acted === true;
        attackSum += 25;
        if(this.Energy <= 0) {
            attackSum += this.Energy/attackMod; //this.Energy is negative here
            this.job="fresh human";
            for(unit in this.Player.Units)//this players unit list
                if (unit.Squad.indexOf(this) > -1)
                    unit.Squad.splice(unit.Squad.indexOf(this), 1); //no longer in other unit's squads      NOTE THIS IS A LINE OF UPDATE SQUADS         wiping squad done later so can use squad in attacking calc
            this.Owner=NULL;
            this.TurnsToDie=10;
            this.Energy=100; //when changed to fresh humans, do they have full energy?
        }
        attackMod=1; //resetting attack mod after every unit
        for(soldier in this.Squad) {
            if(soldier.Acted === false) {
                for(let x=soldier.tile.x-2; x<=soldier.tile.x+2; x++)  //is a soldier in it's own squad? if so this and next 14 lines arent needed
                    for(let y=soldier.tile.y-2; y<=soldier.tile.y+2; y++)
                        if(this.game.getTile(x, y).Structure="monument" && this.game.getTile(x, y).Owner=player)//check if ally monument nearby
                            attackMod=.5;
                soldier.Energy -= 25*attackMod;
                soldier.Acted === true;
                attackSum += 25;
                if(soldier.Energy <= 0) {
                    attackSum += soldier.Energy/attackMod; //soldier.Energy is negative here
                    soldier.job="fresh human";
                    for(unit in soldier.Player.Units)//this players unit list
                        if (unit.Squad.indexOf(soldier) > -1)
                    unit.Squad.splice(unit.Squad.indexOf(soldier), 1); //no longer in other unit's squads      NOTE THIS IS A LINE OF UPDATE SQUADS
                    soldier.updateSquads();//wipe own squad list                                               NOTE THIS IS A LINE OF UPDATE SQUADS
                    soldier.Owner=NULL;
                    soldier.TurnsToDie=10;
                    soldier.Energy=100; //when changed to fresh humans, do they have full energy?
                }
            }
        } 
        if(this.job="fresh human")//if the original attacker died          NOTE THIS IS A LINE OF UPDATE SQUADS
            this.updateSquads();//wipe own squad list                      NOTE THIS IS A LINE OF UPDATE SQUADS
        //EVERYTHING BEFORE IS CALCULATING DAMAGE, AFTER IS DEALING THE DAMAGE
        if(tile.Unit !== NULL) { //checking if unit or structure under attack
            for(let x=tile.x-2; x<=tile.x+2; x++)  //is a soldier in it's own squad? if so this and next 11 lines arent needed
                for(let y=tile.y-2; y<=tile.y+2; y++)
                    if(this.game.getTile(x, y).Structure="monument" && this.game.getTile(x, y).Owner !== player && this.game.getTile(x, y).Owner !== NULL)//check if enemy monument nearby
                        attackMod=.5;
            tile.Unit.Energy -= (attackSum*attackMod/(tile.Squad.size()+1));
            attackMod=1;//resetting as not used for this unit past here
            if(tile.Unit.Energy <= 0) {
                tile.Unit.job="fresh human";
                for(unit in tile.Unit.Player.Units)//opponents unit list
                    if (unit.Squad.indexOf(tile.Unit) > -1)
                        unit.Squad.splice(unit.Squad.indexOf(tile.Unit), 1); //no longer in other unit's squads      NOTE THIS IS A LINE OF UPDATE SQUADS         wiping squad done later so can use squad in defending calc
                tile.Unit.Owner=NULL; 
                tile.Unit.TurnsToDie=10;
                tile.Unit.Energy=100; //when changed to fresh humans, do they have full energy?
            }
            for(target in tile.Unit.Squad) {
                for(let x=tile.x-2; x<=tile.x+2; x++)
                    for(let y=tile.y-2; y<=tile.y+2; y++)
                        if(this.game.getTile(x, y).Structure="monument" && this.game.getTile(x, y).Owner !== player && this.game.getTile(x, y).Owner !== NULL)//check if enemy monument nearby
                            attackMod=.5;
                target.Energy -= (attackSum*attackMod/(tile.Squad.size()+1)) //if a soldier is in their own squad remove +1
                attackMod=1;//resetting as not used for this unit past here
                if(target.Energy <= 0) {
                    taret.job="fresh human";
                    for(unit in target.Player.Units)//opponents players unit list
                        if (unit.Squad.indexOf(target) > -1)
                            unit.Squad.splice(unit.Squad.indexOf(target), 1); //no longer in other unit's squads      NOTE THIS IS A LINE OF UPDATE SQUADS
                    target.updateSquads();//wipe own squad list                                                       NOTE THIS IS A LINE OF UPDATE SQUADS
                    target.Owner=NULL;
                    target.TurnsToDie=10;
                    target.Energy=100; //when changed to fresh humans, do they have full energy?
                }
            }
            if(tile.Unit.job="fresh human")//if the original defender died          NOTE THIS IS A LINE OF UPDATE SQUADS
                tile.Unit.updateSquads();//wipe own squad list                      NOTE THIS IS A LINE OF UPDATE SQUADS
        }
        else { //v checking if structure, which it should be if not a unit
            if(tile.Structure !== NULL) { //as roads and neutral should be unowned, invalidateAttack should filter those structs out. no attacking neutral right?
                tile.Structure.Materials -= attackSum*2;
                if(tile.Structure.Materials <= 0) {
                    tile.Structure.Materials = 0; //dunno if this is cleared w/ NULL so setting it anyway so no overspending when rebuilding a structure (spending just to return this to 0)
                    tile.Structure=NULL;
                }
            }
            else return false; //if nothing on tile to attack, which should never occur due to invalidateAttack but eh... dont know how to use return false w/ invalidate attack existing
        }       
        return true;
    }
    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Unit;

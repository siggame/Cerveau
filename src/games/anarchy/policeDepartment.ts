// PoliceDepartment: Used to keep cities under control and raid Warehouses.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
const Warehouse = require("./warehouse");
//<<-- /Creer-Merge: requires -->>

// @class PoliceDepartment: Used to keep cities under control and raid Warehouses.
let PoliceDepartment = Class(Building, {
    /**
     * Initializes PoliceDepartments.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "PoliceDepartment",


    /**
     * Invalidation function for raid
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Warehouse} warehouse - The warehouse you want to raid.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateRaid: function(player, warehouse, args) {
        // <<-- Creer-Merge: invalidateRaid -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!warehouse || !Class.isInstance(warehouse, Warehouse)) {
            return `${warehouse} not a valid Warehouse to for ${this} to raid.`;
        }

        return this._invalidateBribe(player);

        // <<-- /Creer-Merge: invalidateRaid -->>
    },

    /**
     * Bribe the police to raid a Warehouse, dealing damage equal based on the Warehouse's current exposure, and then resetting it to 0.
     *
     * @param {Player} player - the player that called this.
     * @param {Warehouse} warehouse - The warehouse you want to raid.
     * @returns {number} The amount of damage dealt to the warehouse, or -1 if there was an error.
     */
    raid: function(player, warehouse) {
        // <<-- Creer-Merge: raid -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const oldHealth = warehouse.oldHealth;
        warehouse.health = Math.max(warehouse.health - warehouse.exposure, 0);
        warehouse.exposure = 0;

        this.bribed = true;
        player.bribesRemaining--;

        return oldHealth - warehouse.health;

        // <<-- /Creer-Merge: raid -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = PoliceDepartment;

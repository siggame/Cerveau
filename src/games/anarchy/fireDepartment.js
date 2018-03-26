// FireDepartment: Can put out fires completely.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class FireDepartment: Can put out fires completely.
let FireDepartment = Class(Building, {
    /**
     * Initializes FireDepartments.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);

        /**
         * The amount of fire removed from a building when bribed to extinguish a building.
         *
         * @type {number}
         */
        this.fireExtinguished = this.fireExtinguished || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.fireExtinguished = 2;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "FireDepartment",


    /**
     * Invalidation function for extinguish
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to extinguish.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateExtinguish: function(player, building, args) {
        // <<-- Creer-Merge: invalidateExtinguish -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!building || !Class.isInstance(building, Building) || building.isHeadquarters) {
            return `${building} not a valid building to for ${this} to extinguish.`;
        }

        return this._invalidateBribe(player);

        // <<-- /Creer-Merge: invalidateExtinguish -->>
    },

    /**
     * Bribes this FireDepartment to extinguish the some of the fire in a building.
     *
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to extinguish.
     * @returns {boolean} True if the bribe worked, false otherwise.
     */
    extinguish: function(player, building) {
        // <<-- Creer-Merge: extinguish -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        building.fire = Math.clamp(building.fire - this.fireExtinguished, 0, this.game.maxFire);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: extinguish -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = FireDepartment;

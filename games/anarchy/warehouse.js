// Warehouse: A typical abandoned warehouse... that anarchists hang out in and can be bribed to burn down Buildings.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// pass
//<<-- /Creer-Merge: requires -->>

// @class Warehouse: A typical abandoned warehouse... that anarchists hang out in and can be bribed to burn down Buildings.
let Warehouse = Class(Building, {
    /**
     * Initializes Warehouses.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);

        /**
         * How exposed the anarchists in this warehouse are to PoliceDepartments. Raises when bribed to ignite buildings, and drops each turn if not bribed.
         *
         * @type {number}
         */
        this.exposure = this.exposure || 0;

        /**
         * The amount of fire added to buildings when bribed to ignite a building. Headquarters add more fire than normal Warehouses.
         *
         * @type {number}
         */
        this.fireAdded = this.fireAdded || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.fireAdded = 3;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Warehouse",


    /**
     * Invalidation function for ignite
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to light on fire.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateIgnite: function(player, building, args) {
        // <<-- Creer-Merge: invalidateIgnite -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!building || !Class.isInstance(building, Building) || building.isHeadquarters) {
            return `${building} not a valid building to for ${this} to ignite.`;
        }

        return this._invalidateBribe(player);

        // <<-- /Creer-Merge: invalidateIgnite -->>
    },

    /**
     * Bribes the Warehouse to light a Building on fire. This adds this building's fireAdded to their fire, and then this building's exposure is increased based on the Manhatten distance between the two buildings.
     *
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to light on fire.
     * @returns {number} The exposure added to this Building's exposure. -1 is returned if there was an error.
     */
    ignite: function(player, building) {
        // <<-- Creer-Merge: ignite -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        building.fire = Math.clamp(building.fire + this.fireAdded, 0, this.game.maxFire);
        var exposure = Math.manhattanDistance(this, building);
        this.exposure += exposure; // Do we want a cap on this?

        this.bribed = true;
        player.bribesRemaining--;

        return exposure;

        // <<-- /Creer-Merge: ignite -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Makes this Warehouse into a headquarters
     *
     * @override
     */
    makeHeadquarters: function(/* ... */) {
        this.fireAdded = this.game.maxFire;
        return Building.makeHeadquarters.apply(this, arguments);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Warehouse;

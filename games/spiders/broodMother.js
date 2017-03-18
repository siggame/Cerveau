// BroodMother: The Spider Queen. She alone can spawn Spiderlings for each Player, and if she dies the owner loses.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var Spiderling = require("./spiderling");

//<<-- /Creer-Merge: requires -->>

// @class BroodMother: The Spider Queen. She alone can spawn Spiderlings for each Player, and if she dies the owner loses.
let BroodMother = Class(Spider, {
    /**
     * Initializes BroodMothers.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spider.init.apply(this, arguments);

        /**
         * How many eggs the BroodMother has to spawn Spiderlings this turn.
         *
         * @type {number}
         */
        this.eggs = this.eggs || 0;

        /**
         * How much health this BroodMother has left. When it reaches 0, she dies and her owner loses.
         *
         * @type {number}
         */
        this.health = this.health || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        this.health = 100;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "BroodMother",


    /**
     * Invalidation function for consume
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to consume. It must be on the same Nest as this BroodMother.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateConsume: function(player, spiderling, args) {
        // <<-- Creer-Merge: invalidateConsume -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = Spider._invalidate.call(this, player);
        if(invalid) {
            return invalid;
        }

        if(!spiderling || !Class.isInstance(spiderling, Spiderling)) {
            return `${this} cannot consume because '${spiderling}' is not a Spiderling.`;
        }

        if(spiderling.nest !== this.nest) {
            return `${this} cannot consume because '${spiderling}' is not on the same Nest as itself.`;
        }

        if(spiderling.isDead) {
            return `${this} cannot consume because'${spiderling}' is dead.`;
        }

        // <<-- /Creer-Merge: invalidateConsume -->>
    },

    /**
     * Consumes a Spiderling of the same owner to regain some eggs to spawn more Spiderlings.
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to consume. It must be on the same Nest as this BroodMother.
     * @returns {boolean} True if the Spiderling was consumed. False otherwise.
     */
    consume: function(player, spiderling) {
        // <<-- Creer-Merge: consume -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        spiderling.kill();
        this.eggs++;
        return true;

        // <<-- /Creer-Merge: consume -->>
    },


    /**
     * Invalidation function for spawn
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {string} spiderlingType - The string name of the Spiderling class you want to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateSpawn: function(player, spiderlingType, args) {
        // <<-- Creer-Merge: invalidateSpawn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = Spider._invalidate.call(this, player);
        if(invalid) {
            return invalid;
        }

        const lowerSpiderlingType = spiderlingType.toLowerCase();
        if(!["cutter", "spitter", "weaver"].contains(lowerSpiderlingType)) {
            return `'${spiderlingType}' is not a valid Spiderling type to spawn.`;
        }
        else if(this.eggs <= 0) {
            return `${this} does not have enough eggs to spawn a '${spiderlingType}'`;
        }
        else if(this.owner.spiders.length - 1 === this.owner.maxSpiderlings) { // - 1 for the BroodMother that is not a Spiderling
            return `${this} can not spawn another Spiderling, maxSpiderlings reached (${this.owner.maxSpiderlings}).'`;
        }

        args.spiderlingType = lowerSpiderlingType.upcaseFirst(); // update the variable with the valid string

        // <<-- /Creer-Merge: invalidateSpawn -->>
    },

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming an egg.
     *
     * @param {Player} player - the player that called this.
     * @param {string} spiderlingType - The string name of the Spiderling class you want to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @returns {Spiderling} The newly spwaned Spiderling if successful. Null otherwise.
     */
    spawn: function(player, spiderlingType) {
        // <<-- Creer-Merge: spawn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // if we got here the spawn is valid!
        this.eggs -= 1;
        return this.game.create(spiderlingType, {
            nest: this.nest,
            owner: this.owner,
        });

        // <<-- /Creer-Merge: spawn -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = BroodMother;

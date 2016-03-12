// Generated by Creer at 04:24PM on March 02, 2016 UTC, git hash: '0cc14891fb0c7c6bec65a23a8e2497e80f8827c1'

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class BroodMother: The Spider Queen. She alone can spawn Spiderlings for each Player, and if she dies the owner loses.
var BroodMother = Class(Spider, {
    /**
     * Initializes BroodMothers.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spider.init.apply(this, arguments);

        /**
         * How many eggs the BroodMother has to spawn Spiderlings this turn.
         *
         * @type {number}
         */
        this._addProperty("eggs", serializer.defaultNumber(data.eggs));

        /**
         * How much health this BroodMother has left. When it reaches 0, she dies and her owner loses.
         *
         * @type {number}
         */
        this._addProperty("health", serializer.defaultInteger(data.health));


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        this.health = 100;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "BroodMother",


    /**
     * Consumes a Spiderling of the same owner to regain some eggs to spawn more Spiderlings.
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to consume. It must be on the same Nest as this BroodMother.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the Spiderling was consumed. False otherwise.
     */
    consume: function(player, spiderling, asyncReturn) {
        // <<-- Creer-Merge: consume -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the BroodMother's consume function here
        return false;

        // <<-- /Creer-Merge: consume -->>
    },

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming an egg.
     *
     * @param {Player} player - the player that called this.
     * @param {string} spiderlingType - The string name of the Spiderling class you want to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Spiderling} The newly spwaned Spiderling if successful. Null otherwise.
     */
    spawn: function(player, spiderlingType, asyncReturn) {
        // <<-- Creer-Merge: spawn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        var spiderlingTypes = {"spitter" : Spitter, "weaver" : Weaver, "cutter" : Cutter};
        spiderlingType = spiderlingType.toLowerCase();

        // check if the player owns the broodMother
        if (this.owner !== player) {
            return this.game.logicError(null, "{player} cannot spawn spiderling from {this} owned by {owner}");
        }

        // check if the spiderlingType is valid
        if (spiderlingType in spiderlingTypes) {
            // check if BroodMother has enough eggs to spawn spiderling
            if (player.eggs >= spiderlingTypes[spiderlingType].cost) {
                return this.game.create(spiderlingType, {
                    nest: this.nest,
                    owner: player, 
                });
            }
            else {
                return this.game.logicError(null, "BroodMother does not have enough eggs to spawn a {spiderlingType}");
            }
        }
        else {
            return this.game.logicError(null, "BroodMother commanded to spawn an invalid spiderlingType {spiderlingType}");
        }

        return null;

        // <<-- /Creer-Merge: spawn -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = BroodMother;

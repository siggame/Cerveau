// Job: Information about a Unit's job.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Job: Information about a Unit's job.
let Job = Class(GameObject, {
    /**
     * Initializes Jobs.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The amount of energy this Job normally uses to perform its actions.
         *
         * @type {number}
         */
        this.actCost = this.actCost || 0;

        /**
         * How many combined resources a Unit with this Job can hold at once.
         *
         * @type {number}
         */
        this.carryLimit = this.carryLimit || 0;

        /**
         * The number of moves this Job can make per turn.
         *
         * @type {number}
         */
        this.moves = this.moves || 0;

        /**
         * The amount of energy normally regenerated when resting at a shelter.
         *
         * @type {number}
         */
        this.regenRate = this.regenRate || 0;

        /**
         * The Job title.
         *
         * @type {string}
         */
        this.title = this.title || "";

        /**
         * The amount of food per turn this Unit consumes. If there isn't enough food for every Unit, all units become starved and do not consume food.
         *
         * @type {number}
         */
        this.upkeep = this.upkeep || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Job",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Job;
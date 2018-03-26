// Spawner: A resource spawner that generates branches or food.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Spawner: A resource spawner that generates branches or food.
let Spawner = Class(GameObject, {
    /**
     * Initializes Spawners.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * True if this Spawner has been harvested this turn, and it will not heal at the end of the turn, false otherwise.
         *
         * @type {boolean}
         */
        this.hasBeenHarvested = this.hasBeenHarvested || false;

        /**
         * How much health this Spawner has, which is used to calculate how much of its resource can be harvested.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * The Tile this Spawner is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;

        /**
         * What type of resource this is ('food' or 'branches').
         *
         * @type {string}
         */
        this.type = this.type || "";


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.health = 1;
        this.tile.spawner = this;
        this.game.spawner.push(this); // should be `spawners`, if we ever re-run creer

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Spawner",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spawner;

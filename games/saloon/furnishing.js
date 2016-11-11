// Furnishing: An furnishing in the Saloon that must be pathed around, or destroyed.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Furnishing: An furnishing in the Saloon that must be pathed around, or destroyed.
var Furnishing = Class(GameObject, {
    /**
     * Initializes Furnishings.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * How much health this Furnishing currently has.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * If this Furnishing has been destroyed, and has been removed from the game.
         *
         * @type {boolean}
         */
        this.isDestroyed = this.isDestroyed || false;

        /**
         * True if this Furnishing is a piano and can be played, False otherwise.
         *
         * @type {boolean}
         */
        this.isPiano = this.isPiano || false;

        /**
         * If this is a piano and a Cowboy is playing it this turn.
         *
         * @type {boolean}
         */
        this.isPlaying = this.isPlaying || false;

        /**
         * The Tile that this Furnishing is located on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.game.furnishings.push(this);
        this.health = this.isPiano ? 48 : 16;
        this.tile.furnishing = this;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Furnishing",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Damages this Furnishing for some amount of damage, setting isDestroyed if it dies
     *
     * @param {number} damage - how much damage to do to this
     */
    damage: function(damage) {
        this.health = Math.max(0, this.health - damage);
        if(this.health === 0) { // it has been destroyed
            this.isDestroyed = true;
            this.isPlaying = false;
            this.tile.furnishing = null;
            this.tile = null;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Furnishing;

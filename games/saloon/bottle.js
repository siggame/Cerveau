// Bottle: A bottle thrown by a bartender at a Tile.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Bottle: A bottle thrown by a bartender at a Tile.
var Bottle = Class(GameObject, {
    /**
     * Initializes Bottles.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The Direction this Bottle is flying and will move to between turns, can be 'North', 'East', 'South', or 'West'.
         *
         * @type {string}
         */
        this.direction = this.direction || "";

        /**
         * The direction any Cowboys hit by this will move, can be 'North', 'East', 'South', or 'West'.
         *
         * @type {string}
         */
        this.drunkDirection = this.drunkDirection || "";

        /**
         * True if this Bottle has impacted and has been destroyed (removed from the Game). False if still in the game flying through the saloon.
         *
         * @type {boolean}
         */
        this.isDestroyed = this.isDestroyed || false;

        /**
         * The Tile this bottle is currently flying over.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.game.bottles.push(this);
        this.tile.bottle = this;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Bottle",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * advances the bottle (moves it) 1 tile in between turns
     * Note: game calls this so game will update this bottle's tile
     */
    advance: function() {
        // we won't update this.tile.bottle to us, as the game will handle bottle <--> bottle collisions after all bottles have advanced
        this.tile.bottle = null; // we moved off it
        this.tile = this.tile.getNeighbor(this.direction);

        if(!this.tile.isPathableToBottles()) {
            this.break(); // hit something
        }
    },

    /**
     * Breaks (destroys) this bottle, getting cowboys drunk in the process
     *
     * @param {Cowboy} cowboy - the cowboy to break on
     */
    break: function(cowboy) {
        if(this.isDestroyed) {
            return; // we're already broken :(
        }

        cowboy = cowboy || this.tile.cowboy;

        if(cowboy) {
            cowboy.getDrunk(this.drunkDirection);
        }

        this.isDestroyed = true;
        this.tile.bottle = null;
        this.tile = null;
        this.game.bottles.removeElement(this);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Bottle;

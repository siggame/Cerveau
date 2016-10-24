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

    advance: function() {
        var next = this.tile["tile" + this.direction];
        if(!next || next.isWall) {
            return this.destroy(); // went off map
        }

        this.tile.bottle = null;
        this.tile = next;
        var hitOtherBottle = false;
        if(next.bottle) {
            next.bottle.destroy();
            hitOtherBottle = true;
        }

        next.bottle = this;

        if(next.cowboy || next.furnishing || hitOtherBottle) {
            this.destroy(); // we hit something!
        }
    },

    destroy: function() {
        var cowboy = this.tile.cowboy;

        if(cowboy) {
            if(!cowboy.owner.addRowdyness(1)) { // then they did not start a seista
                // so make them drunk!
                cowboy.isDrunk = true;
                cowboy.turnsBusy = 5;
                cowboy.drunkDirection = this.drunkDirection;
                cowboy.focus = 0;
                cowboy.canMove = false;
            }
        }

        this.isDestroyed = true;
        this.tile.bottle = null;
        this.tile = null;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Bottle;

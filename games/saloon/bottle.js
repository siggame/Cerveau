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
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

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
                cowboy.isDrunk = true;
                cowboy.focus = -5;
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

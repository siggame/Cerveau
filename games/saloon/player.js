// Player: A player in this game. Every AI controls one player.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Player: A player in this game. Every AI controls one player.
var Player = Class(GameObject, {
    /**
     * Initializes Players.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Player",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    addRowdyness: function(num) {
        this.rowdyness += num;

        if(this.rowdyness >= this.game.rowdynessToSiesta) {
            this.rowdyness = 0;
            // siesta!
            for(var i = 0; i < this.cowboys.length; i++) {
                var cowboy = this.cowboys[i];

                if(cowboy.isDead || cowboy.job === "Young Gun") {
                    continue;
                }

                cowboy.siesta = true;
                cowboy.turnsBusy = this.game.siestaLength;
                cowboy.hasMoved = true;
                cowboy.focus = 0;
            }

            return true; // siesta'd!
        }

        return false; // no siesta
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Player;

// YoungGun: An eager young person that wants to join your gang, and will call in the veteran Cowboys you need to win the brawl in the saloon.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class YoungGun: An eager young person that wants to join your gang, and will call in the veteran Cowboys you need to win the brawl in the saloon.
var YoungGun = Class(GameObject, {
    /**
     * Initializes YoungGuns.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "YoungGun",


    /**
     * Tells the YoungGun to call in a new Cowboy of the given job to the open Tile nearest to them.
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The job you want the Cowboy being brought to have.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Cowboy} The new Cowboy that was called in if valid. They will not be added to any `cowboys` lists until the turn ends. Null otherwise.
     */
    callIn: function(player, job, asyncReturn) {
        // <<-- Creer-Merge: callIn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var reason;

        if(player !== this.game.currentPlayer) {
            reason = "{player} it is not your turn.";
        }

        if(!this.canCallIn) {
            reason = "{this} cannot call in any more Cowboys this turn.";
        }

        var actualJob; // make sure the job is valid
        for(var i = 0; i < this.game.jobs.length; i++) {
            var j = this.game.jobs[i];
            if(job.toLowerCase() === j.toLowerCase()) {
                actualJob = j;
                break;
            }
        }

        var cowboy;
        if(!actualJob) {
            reason = "{job} is not a valid job to send in.";
        }
        else { // make sure they are not trying to go above the limit
            var count = 0;
            for(i = 0; i < this.owner.cowboys.length; i++) {
                cowboy = this.owner.cowboys[i];
                if(cowboy.job === actualJob) {
                    count++; // yes you could add the boolean value (coerced to 0 or 1), but that reads weird
                }
            }

            if(count >= this.game.maxCowboysPerJob) {
                reason = "You cannot call in any more '{actualJob}' (max of {this.game.maxCowboysPerJob})";
            }
        }

        if(reason) {
            return this.game.logicError(null, reason.format({
                this: this,
                job,
                actualJob,
                player,
            }));
        }

        // if we got here, it was valid!

        // clear the open tile before moving the young gun to it
        if(this.callInTile.cowboy) {
            this.callInTile.cowboy.damage(Infinity);
        }

        if(this.callInTile.furnishing) {
            this.callInTile.furnishing.damage(Infinity);
        }

        this.canCallIn = false;

        cowboy = this.game.create("Cowboy", {
            owner: this.owner,
            job: actualJob,
            tile: this.callInTile,
            canMove: false,
        });

        this.callInTile.cowboy = cowboy;

        return cowboy;


        // <<-- /Creer-Merge: callIn -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = YoungGun;

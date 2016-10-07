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


    /**
     * Sends in the Young Gun to the nearest Tile into the Saloon, and promotes them to a new job.
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The job you want the Young Gun being brought in to be called in to do, changing their job to it.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Cowboy} The Cowboy that was previously a 'Young Gun', and has now been promoted to a different job if successful, null otherwise.
     */
    sendIn: function(player, job, asyncReturn) {
        // <<-- Creer-Merge: sendIn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var reason;

        if(player !== this.game.currentPlayer) {
            reason = "{player} it is not your turn.";
        }
        else if(!player.youngGun) {
            reason = "You have no 'Young Gun' to call in.";
        }
        else if(player.cowboys.length >= this.game.maxCowboys) {
            reason = "Cannot call in another cowboy, you are already at the max ({this.game.maxCowboys})";
        }

        var actualJob; // make sure the job is valid
        for(var i = 0; i < this.game.jobs.length; i++) {
            var j = this.game.jobs[i];
            if(job.toLowerCase() === j.toLowerCase()) {
                actualJob = j;
                break;
            }
        }

        if(!actualJob) {
            reason = "{job} is not a valid job to call in.";
        }

        if(reason) {
            return this.game.logicError(null, reason.format({
                this: this,
                job,
                player,
            }));
        }

        // if we got here, it was valid!

        // do a quick BFS to find an open tile to spawn him on
        var tiles = [ this.youngGun.tile ];
        var openTile;
        while(tiles.length > 0) {
            var tile = tiles.shift();

            if(tile.isWall) {
                tiles = tiles.concat(tile.getNeighbors());
            }
            else {
                openTile = tile;
                break;
            }
        }

        // clear the open tile before moving the young gun to it
        if(openTile.cowboy) {
            openTile.cowboy.damage(Infinity);
        }

        if(openTile.furnishing) {
            openTile.furnishing.damage(Infinity);
        }

        var cowboy = player.youngGun;
        player.youngGun = null;

        cowboy.job = actualJob;
        cowboy.tile.cowboy = null;
        cowboy.tile = openTile;
        cowboy.hasMoved = true;
        openTile.cowboy = cowboy;

        return cowboy;

        // <<-- /Creer-Merge: sendIn -->>
    },

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

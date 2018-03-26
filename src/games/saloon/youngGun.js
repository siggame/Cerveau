// YoungGun: An eager young person that wants to join your gang, and will call in the veteran Cowboys you need to win the brawl in the saloon.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class YoungGun: An eager young person that wants to join your gang, and will call in the veteran Cowboys you need to win the brawl in the saloon.
let YoungGun = Class(GameObject, {
    /**
     * Initializes YoungGuns.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The Tile that a Cowboy will be called in on if this YoungGun calls in a Cowboy.
         *
         * @type {Tile}
         */
        this.callInTile = this.callInTile || null;

        /**
         * True if the YoungGun can call in a Cowboy, false otherwise.
         *
         * @type {boolean}
         */
        this.canCallIn = this.canCallIn || false;

        /**
         * The Player that owns and can control this YoungGun.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The Tile this YoungGun is currently on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "YoungGun",


    /**
     * Invalidation function for callIn
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The job you want the Cowboy being brought to have.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateCallIn: function(player, job, args) {
        // <<-- Creer-Merge: invalidateCallIn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(player !== this.game.currentPlayer) {
            return `${player} it is not your turn.`;
        }

        if(!this.canCallIn) {
            return `${this} cannot call in any more Cowboys this turn.`;
        }

        let actualJob; // make sure the job is valid
        for(const j of this.game.jobs) {
            if(job.toLowerCase() === j.toLowerCase()) {
                actualJob = j;
                break;
            }
        }

        if(!actualJob) {
            return `${job} is not a valid job to send in.`;
        }

        // make sure they are not trying to go above the limit
        let count = 0;
        for(const cowboy of this.owner.cowboys) {
            if(cowboy.job === actualJob) {
                count++; // yes you could add the boolean value (coerced to 0 or 1), but that reads weird
            }
        }

        if(count >= this.game.maxCowboysPerJob) {
            return `You cannot call in any more '${actualJob}' (max of ${this.game.maxCowboysPerJob})`;
        }

        // make the job arg the correct job, as it looks valid!
        args.job = actualJob;

        // <<-- /Creer-Merge: invalidateCallIn -->>
    },

    /**
     * Tells the YoungGun to call in a new Cowboy of the given job to the open Tile nearest to them.
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The job you want the Cowboy being brought to have.
     * @returns {Cowboy} The new Cowboy that was called in if valid. They will not be added to any `cowboys` lists until the turn ends. Null otherwise.
     */
    callIn: function(player, job) {
        // <<-- Creer-Merge: callIn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // clear the open tile before moving the young gun to it
        if(this.callInTile.cowboy) {
            this.callInTile.cowboy.damage(Infinity);
        }

        if(this.callInTile.furnishing) {
            this.callInTile.furnishing.damage(Infinity);
        }

        this.canCallIn = false;

        let cowboy = this.game.create("Cowboy", {
            owner: this.owner,
            job: job,
            tile: this.callInTile,
            canMove: false,
        });

        if(this.callInTile.bottle) {
            // then break the bottle on this new cowboy, so he immediately gets drunk
            this.callInTile.bottle.break(cowboy);
        }

        this.callInTile.cowboy = cowboy;

        return cowboy;


        // <<-- /Creer-Merge: callIn -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = YoungGun;

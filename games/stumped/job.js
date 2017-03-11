// Job: Information about a beaver's job.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

const JobStats = require("./jobStats.json");

//<<-- /Creer-Merge: requires -->>

// @class Job: Information about a beaver's job.
var Job = Class(GameObject, {
    /**
     * Initializes Jobs.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The number of actions this job can make per turn.
         *
         * @type {number}
         */
        this.actions = this.actions || 0;

        /**
         * How many resources a beaver with this job can hold at once.
         *
         * @type {number}
         */
        this.carryLimit = this.carryLimit || 0;

        /**
         * Scalar for how many branches this job harvests at once.
         *
         * @type {number}
         */
        this.chopping = this.chopping || 0;

        /**
         * How many fish this Job costs to recruit.
         *
         * @type {number}
         */
        this.cost = this.cost || 0;

        /**
         * The amount of damage this job does per attack.
         *
         * @type {number}
         */
        this.damage = this.damage || 0;

        /**
         * How many turns a beaver attacked by this job is distracted by.
         *
         * @type {number}
         */
        this.distracts = this.distracts || 0;

        /**
         * Scalar for how many fish this job harvests at once.
         *
         * @type {number}
         */
        this.fishing = this.fishing || 0;

        /**
         * The amount of starting health this job has.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * The number of moves this job can make per turn.
         *
         * @type {number}
         */
        this.moves = this.moves || 0;

        /**
         * The job title ('builder', 'fisher', etc).
         *
         * @type {string}
         */
        this.title = this.title || "";

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        this.title = this.title || "Normal";

        let thisJob = JobStats.jobs[this.title];
        for(let key of Object.keys(JobStats.default)) {
            if(thisJob && key in thisJob) {
                this[key] = thisJob[key];
            }
            else {
                this[key] = JobStats.default[key];
            }
        }

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Job",


    /**
     * Recruits a Beaver of this Job to a lodge
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} lodge - The Tile that is a lodge owned by you that you wish to spawn the Beaver of this Job on.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Beaver} The recruited Beaver if successful, null otherwise.
     */
    recruit: function(player, lodge, asyncReturn) {
        // <<-- Creer-Merge: recruit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        let reason;

        if(!player) {
            reason = "Player is not defined";
        }
        else if(!lodge) {
            reason = "Lodge is not defined";
        }
        else if(lodge.beaver) {
            reason = "There's already a beaver at that lodge";
        }
        else if(player.beavers.length < this.game.freeBeaversCount && player.fish < this.cost) {
            reason = "You don't have enough fish to recruit that beaver, {player}";
        }
        else {
            let beav = this.game.create("Beaver", { "job": this, "owner": player });
            beav.tile = lodge;
            lodge.beaver = beav;
            player.fish = player.fish - this.cost;
            player.beavers.push(beav);
            return beav;
        }

        return this.game.logicError(null, reason.format({
            this: this,
            player,
        }));

        // <<-- /Creer-Merge: recruit -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Job;

// Cutter: A Spiderling that can cut existing Webs.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Spiderling = require("./spiderling");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Cutter: A Spiderling that can cut existing Webs.
let Cutter = Class(Spiderling, {
    /**
     * Initializes Cutters.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spiderling.init.apply(this, arguments);

        /**
         * The Web that this Cutter is trying to cut. Null if not cutting.
         *
         * @type {Web}
         */
        this.cuttingWeb = this.cuttingWeb || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.cuttingSpeed = 10;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Cutter",


    /**
     * Invalidation function for cut
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The web you want to Cut. Must be connected to the Nest this Cutter is currently on.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateCut: function(player, web, args) {
        // <<-- Creer-Merge: invalidateCut -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = Spiderling._invalidate.call(this, player);
        if(invalid) {
            return invalid;
        }

        if(!web) {
            return `'${web}' is not a Web that can be cut by ${this}.`;
        }

        if(!web.isConnectedTo(this.nest)) {
            return `${this} can only cut Webs connected to the Nest it is on (${this.nest}), ${web} is not.`;
        }

        // <<-- /Creer-Merge: invalidateCut -->>
    },

    /**
     * Cuts a web, destroying it, and any Spiderlings on it.
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The web you want to Cut. Must be connected to the Nest this Cutter is currently on.
     * @returns {boolean} True if the cut was successfully started, false otherwise.
     */
    cut: function(player, web) {
        // <<-- Creer-Merge: cut -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.busy = "Cutting";
        this.cuttingWeb = web;

        // find coworkers
        var sideSpiders = web.getSideSpiders();
        for(var i = 0; i < sideSpiders.length; i++) {
            var spider = sideSpiders[i];
            if(spider !== this && spider.cuttingWeb === web) {
                this.coworkers.push(spider);
                this.numberOfCoworkers = this.coworkers.length;
                spider.coworkers.push(this);
                spider.numberOfCoworkers = spider.coworkers.length;
            }
        }

        // workRemaining =  5 * strength^2 / (cutterSpeed * sqrt(distance))
        this.workRemaining = 5 * web.strength * web.strength / (this.game.cutSpeed * Math.sqrt(web.length));

        return true;
        // <<-- /Creer-Merge: cut -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Kills the Cutter
     *
     * @override
     */
    kill: function() {
        Spiderling.kill.apply(this, arguments);

        this.cuttingWeb = null;
    },

     /**
     * Finishes the actions of the Cutter
     *
     * @override
     * @param {boolean} forceFinish - true if forcing the finish prematurely
     */
    finish: function(forceFinish) {
        if(Spiderling.finish.apply(this, arguments)) {
            return; // because they finished moving or something the base Spiderling class can handle
        }

        if(!forceFinish && this.cuttingWeb && !this.cuttingWeb.hasSnapped()) {
            this.cuttingWeb.snap();
        }

        this.cuttingWeb = null;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Cutter;

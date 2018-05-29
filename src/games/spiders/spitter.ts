// Spitter: A Spiderling that creates and spits new Webs from the Nest it is on to another Nest, connecting them.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Spiderling = require("./spiderling");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Spitter: A Spiderling that creates and spits new Webs from the Nest it is on to another Nest, connecting them.
let Spitter = Class(Spiderling, {
    /**
     * Initializes Spitters.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spiderling.init.apply(this, arguments);

        /**
         * The Nest that this Spitter is creating a Web to spit at, thus connecting them. Null if not spitting.
         *
         * @type {Nest}
         */
        this.spittingWebToNest = this.spittingWebToNest || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.spittingSpeed = 10;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Spitter",


    /**
     * Invalidation function for spit
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Nest} nest - The Nest you want to spit a Web to, thus connecting that Nest and the one the Spitter is on.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateSpit: function(player, nest, args) {
        // <<-- Creer-Merge: invalidateSpit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var invalid = Spiderling._invalidate.call(this, player);
        if(invalid) {
            return invalid;
        }

        if(!nest) {
            return `'${nest}' is not a Nest for ${this} to spit at.`;
        }

        if(nest === this.nest) {
            return `${this} cannot spit at the same Nest it is on (${nest}).`;
        }

        for(const web of nest.webs) {
            if(web.isConnectedTo(this.nest, nest)) {
                return `${this} cannot spit a new Web from ${this.nest} to ${nest} because ${web} already exists.`;
            }
        }

        // <<-- /Creer-Merge: invalidateSpit -->>
    },

    /**
     * Creates and spits a new Web from the Nest the Spitter is on to another Nest, connecting them.
     *
     * @param {Player} player - the player that called this.
     * @param {Nest} nest - The Nest you want to spit a Web to, thus connecting that Nest and the one the Spitter is on.
     * @returns {boolean} True if the spit was successful, false otherwise.
     */
    spit: function(player, nest) {
        // <<-- Creer-Merge: spit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.busy = "Spitting";
        this.spittingWebToNest = nest;

        // find coworkers
        var sideSpiders = this.nest.spiders.concat(nest.spiders);
        for(const spider of sideSpiders) {
            if(spider !== this && (spider.spittingWebToNest === nest || spider.spittingWebToNest === this.nest)) {
                this.coworkers.push(spider);
                this.numberOfCoworkers = this.coworkers.length;
                spider.coworkers.push(this);
                spider.numberOfCoworkers = spider.coworkers.length;
            }
        }

        this.workRemaining = this.nest.distanceTo(nest) / this.game.spitSpeed;

        return true;

        // <<-- /Creer-Merge: spit -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Kills the Spitter
     *
     * @override
     */
    kill: function() {
        Spiderling.kill.apply(this, arguments);

        this.spittingWebToNest = null;
    },

    /**
     * Finishes the actions of the Spitter
     *
     * @override
     * @param {boolean} forceFinish - true if forcing the finish prematurely
     */
    finish: function(forceFinish) {
        if(Spiderling.finish.apply(this, arguments)) {
            return; // because they finished moving or something the base Spiderling class can handle
        }

        if(forceFinish) {
            this.spittingWebToNest = null;
            return;
        }

        // if we got here they finished spitting
        var newWeb = this.game.create("Web", {
            nestA: this.nest,
            nestB: this.spittingWebToNest,
        });

        // cancel spitters on the current nest to the destination
        var sideSpiders = newWeb.getSideSpiders();
        for(var i = 0; i < sideSpiders.length; i++) {
            var spider = sideSpiders[i];
            if(spider !== this && (spider.spittingWebToNest === this.spittingWebToNest || spider.spittingWebToNest === this.nest)) {
                spider.finish(true);
            }
        }

        this.spittingWebToNest = null;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spitter;

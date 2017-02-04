// Weaver: A Spiderling that can alter existing Webs by weaving to add or remove silk from the Webs, thus altering its strength.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Spiderling = require("./spiderling");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Weaver: A Spiderling that can alter existing Webs by weaving to add or remove silk from the Webs, thus altering its strength.
var Weaver = Class(Spiderling, {
    /**
     * Initializes Weavers.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spiderling.init.apply(this, arguments);

        /**
         * The Web that this Weaver is strengthening. Null if not strengthening.
         *
         * @type {Web}
         */
        this.strengtheningWeb = this.strengtheningWeb || null;

        /**
         * The Web that this Weaver is weakening. Null if not weakening.
         *
         * @type {Web}
         */
        this.weakeningWeb = this.weakeningWeb || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Weaver",


    /**
     * Weaves more silk into an existing Web to strengthen it.
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The web you want to strengthen. Must be connected to the Nest this Weaver is currently on.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the strengthen was successfully started, false otherwise.
     */
    strengthen: function(player, web, asyncReturn) {
        // <<-- Creer-Merge: strengthen -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        return this._weave(player, web, "Strengthening");

        // <<-- /Creer-Merge: strengthen -->>
    },

    /**
     * Weaves more silk into an existing Web to strengthen it.
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The web you want to weaken. Must be connected to the Nest this Weaver is currently on.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the weaken was successfully started, false otherwise.
     */
    weaken: function(player, web, asyncReturn) {
        // <<-- Creer-Merge: weaken -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        return this._weave(player, web, "Weakening");

        // <<-- /Creer-Merge: weaken -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * A generic strengthen/weaken wrapper because both are so similar
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The web you want to weaken. Must be connected to the Nest this Weaver is currently on.
     * @param {string} weaveType - should be "Strengthening" or "Weakening" as appropriate
     * @returns {boolean} True if the weaken was successfully started, false otherwise.
     */
    _weave: function(player, web, weaveType) {
        var error = Spiderling._validate.call(this, player, false);
        if(error) {
            return error;
        }

        var reason;
        if(!web) {
            reason = "{web} is not a valid Web to strengthen for {this}.";
        }
        else if(this.nest !== web.nestA && this.nest !== web.nestB) {
            reason = "{this} can only strengthen Webs connected to {this.nest}, {web} is not.";
        }
        else if(weaveType === "Weakening" && web.strength <= 1) {
            reason = "{this} cannot weaken {web} as its strength is at the minimum (1).";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                web: web,
            }));
        }

        // if we got here it is valid!

        this.busy = weaveType;

        var webField = weaveType.toLowerCase() + "Web";
        this[webField] = web;

        // TworkReminaing = distance * sqrt(strength) / speed
        this.workRemaining = web.length * Math.sqrt(web.strength) / this.game.weaveSpeed;

        // find coworkers
        var sideSpiders = web.getSideSpiders();
        for(var i = 0; i < sideSpiders.length; i++) {
            var spider = sideSpiders[i];
            if(spider !== this && spider[webField] === web) {
                this.coworkers.push(spider);
                this.numberOfCoworkers = this.coworkers.length;
                spider.coworkers.push(this);
                spider.numberOfCoworkers = spider.coworkers.length;
            }
        }

        this.game.csHack();

        return true;

    },

    /**
     * Kills the Weaver
     *
     * @override
     */
    kill: function() {
        Spiderling.kill.apply(this, arguments);

        this.strengtheningWeb = null;
        this.weakeningWeb = null;
    },

     /**
     * Finishes the actions of the Weaver
     *
     * @override
     * @param {boolean} forceFinish - true if forcing the finish prematurely
     */
    finish: function(forceFinish) {
        var weaveType = this.busy.toLowerCase();

        if(Spiderling.finish.apply(this, arguments)) {
            return; // because they finished moving or something the base Spiderling class can handle
        }

        var web = this[weaveType + "Web"];
        this[weaveType + "Web"] = null;

        if(!forceFinish && web && !web.hasSnapped()) { // then they are finishing a weave, not being forced to finish because the web snapped
            web.addStrength((weaveType === "weakening" ? -1 : 1) * this.game.weavePower);
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Weaver;

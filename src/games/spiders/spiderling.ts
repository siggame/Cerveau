// Spiderling: A Spider spawned by the BroodMother.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var Web = require("./web");

//<<-- /Creer-Merge: requires -->>

// @class Spiderling: A Spider spawned by the BroodMother.
let Spiderling = Class(Spider, {
    /**
     * Initializes Spiderlings.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Spider.init.apply(this, arguments);

        /**
         * When empty string this Spiderling is not busy, and can act. Otherwise a string representing what it is busy with, e.g. 'Moving', 'Attacking'.
         *
         * @type {string}
         */
        this.busy = this.busy || "";

        /**
         * The Web this Spiderling is using to move. Null if it is not moving.
         *
         * @type {Web}
         */
        this.movingOnWeb = this.movingOnWeb || null;

        /**
         * The Nest this Spiderling is moving to. Null if it is not moving.
         *
         * @type {Nest}
         */
        this.movingToNest = this.movingToNest || null;

        /**
         * The number of Spiderlings busy with the same work this Spiderling is doing, speeding up the task.
         *
         * @type {number}
         */
        this.numberOfCoworkers = this.numberOfCoworkers || 0;

        /**
         * How much work needs to be done for this Spiderling to finish being busy. See docs for the Work forumla.
         *
         * @type {number}
         */
        this.workRemaining = this.workRemaining || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.coworkers = [];

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Spiderling",


    /**
     * Invalidation function for attack
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to attack.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateAttack: function(player, spiderling, args) {
        // <<-- Creer-Merge: invalidateAttack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = Spiderling._invalidate.call(this, player);
        if(invalid) {
            return invalid;
        }

        if(!spiderling || !Spiderling.isInstance(spiderling)) {
            return `${this} cannot attack because '${spiderling}' is not a Spiderling.`;
        }

        if(spiderling.nest !== this.nest) {
            return `${this} cannot attack because '${spiderling}' is not on the same Nest as itself.`;
        }

        if(this === Spiderling) {
            return `${this} cannot attack itself.`;
        }

        if(spiderling.isDead) {
            return `${this} cannot attack because'${spiderling}' is dead.`;
        }

        // <<-- /Creer-Merge: invalidateAttack -->>
    },

    /**
     * Attacks another Spiderling
     *
     * @param {Player} player - the player that called this.
     * @param {Spiderling} spiderling - The Spiderling to attack.
     * @returns {boolean} True if the attack was successful, false otherwise.
     */
    attack: function(player, spiderling) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Spiderling's attack function here

        // Rock Paper Scissors
        // Cutter > Weaver > Spitter > Cutter
        // Ties, both die

        if(this.gameObjectName === spiderling.gameObjectName) { // they are the same type, so
            this.kill();
            spiderling.kill();
        }

        if(
            (this.gameObjectName === "Cutter" && spiderling.gameObjectName === "Weaver") ||
            (this.gameObjectName === "Weaver" && spiderling.gameObjectName === "Spitter") ||
            (this.gameObjectName === "Spitter" && spiderling.gameObjectName === "Cutter")
        ) {
            spiderling.kill();
        }

        if(
            (spiderling.gameObjectName === "Cutter" && this.gameObjectName === "Weaver") ||
            (spiderling.gameObjectName === "Weaver" && this.gameObjectName === "Spitter") ||
            (spiderling.gameObjectName === "Spitter" && this.gameObjectName === "Cutter")
        ) {
            this.kill();
        }

        if(!this.isDead) {
            this.busy = "Attacking"; // so they cannot attack again
            this.workRemaining = 1;
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    },


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The Web you want to move across to the other Nest.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, web, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = Spiderling._invalidate.call(this, player);
        if(invalid) {
            return invalid;
        }

        if(!web || !Web.isInstance(web)) {
            return `${web} is not a Web for ${this} to move on.`;
        }

        if(!web.isConnectedTo(this.nest)) {
            return `${web} is not connected to ${this.nest} for ${this} to move on.`;
        }

        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Starts moving the Spiderling across a Web to another Nest.
     *
     * @param {Player} player - the player that called this.
     * @param {Web} web - The Web you want to move across to the other Nest.
     * @returns {boolean} True if the move was successful, false otherwise.
     */
    move: function(player, web) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.busy = "Moving";
        this.workRemaining = Math.ceil(web.length / this.game.movementSpeed);

        this.movingOnWeb = web;
        this.movingToNest = web.getOtherNest(this.nest);

        this.nest.spiders.removeElement(this);
        this.nest = null;

        web.spiderlings.push(this);
        web.addLoad(1);

        return true;

        // <<-- /Creer-Merge: move -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Kills the Spiderling
     *
     * @override
     */
    kill: function() {
        Spider.kill.apply(this, arguments);

        this.busy = "";
        this.workRemaining = -1;
        this.movingToNest = null;

        for(var i = 0; i < this.coworkers.length; i++) {
            var coworker = this.coworkers[i];
            coworker.coworkers.removeElement(this);
            coworker.numberOfCoworkers = coworker.coworkers.length;
        }

        this.coworkers.length = 0;
        this.numberOfCoworkers = this.coworkers.length;

        if(this.movingOnWeb) {
            this.movingOnWeb.spiderlings.removeElement(this);
            this.movingOnWeb = null;
        }
    },

    /**
     * Tries to invalidate args for a Spiderlings action
     *
     * @override
     * @param {Player} player - the player validating for
     * @returns {Cerveau.GameLogicError} an error is returned if invalid, undefined otherwise
     */
    _invalidate: function(player) {
        const invalid = Spider._invalidate.apply(this, arguments);
        if(invalid) {
            return invalid;
        }

        if(this.busy) {
            return `${this} is already busy with '${this.busy}'.`;
        }
    },

    /**
     * Tells the Spiderling to finish what it is doing (moving, cutting, spitting, weaving)
     *   Note: coworkers are finished in the Game class, not here
     *
     * @param {boolean} forceFinish - True if the task was not finished by THIS spiderling
     * @returns {boolean} true if finished, false otherwise
     */
    finish: function(forceFinish) {
        var finishing = this.busy;
        this.busy = "";
        this.workRemaining = 0;

        if(finishing === "Moving") {
            this.nest = this.movingToNest;
            this.nest.spiders.push(this);
            this.movingOnWeb.spiderlings.removeElement(this);
            this.movingOnWeb.addLoad(-1);
            this.movingToNest = null;
            this.movingOnWeb = null;

            var enemyBroodMother = this.owner.otherPlayer.broodMother;
            if(this.nest === enemyBroodMother.nest) { // then we reached the enemy's BroodMother! Kamikaze into her!
                enemyBroodMother.health = Math.max(enemyBroodMother.health - 1, 0);
                if(enemyBroodMother.health === 0) {
                    enemyBroodMother.isDead = true;
                }
                this.kill();
            }

            return true;
        }
        else if(finishing === "Attacking") {
            return true;
        }
        else { // they finished doing a different action (cut, weave, spit)
            this.coworkers.length = 0;
            this.numberOfCoworkers = this.coworkers.length;
            return false;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spiderling;

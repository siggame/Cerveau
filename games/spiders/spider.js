// Spider: A Spider in the game. The most basic unit.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Spider: A Spider in the game. The most basic unit.
let Spider = Class(GameObject, {
    /**
     * Initializes Spiders.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * If this Spider is dead and has been removed from the game.
         *
         * @type {boolean}
         */
        this.isDead = this.isDead || false;

        /**
         * The Nest that this Spider is currently on. Null when moving on a Web.
         *
         * @type {Nest}
         */
        this.nest = this.nest || null;

        /**
         * The Player that owns this Spider, and can command it.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        this.isDead = false;
        this.nest.spiders.push(this);
        this.owner.spiders.push(this);

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Spider",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Kills the Spider
     *
     * @override
     */
    kill: function() {
        this.isDead = true;

        if(this.nest) {
            this.nest.spiders.removeElement(this);
            this.nest = null;
        }

        this.owner.spiders.removeElement(this);
    },

    /**
     * Tries to invalidate args sent for a Spider to do
     *
     * @param {Player} player - the player that is trying to command this Spiderling
     * @returns {GameLogicError} a game logic error if there is something wrong, undefined otherwise
     */
    _invalidate: function(player) {
        if(this.game.currentPlayer !== player) {
            return `${player} it is not your turn!`;
        }

        if(this.owner !== player) {
            return `${player} does not own ${this}.`;
        }

        if(this.isDead) {
            return `${this} is dead and cannot do anything.`;
        }

        if(this.busy) {
            return `${this} is already busy with '${this.busy}'.`;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Spider;

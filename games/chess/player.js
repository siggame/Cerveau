// Player: A player in this game. Every AI controls one player.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Player: A player in this game. Every AI controls one player.
let Player = Class(GameObject, {
    /**
     * Initializes Players.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * What type of client this is, e.g. 'Python', 'JavaScript', or some other language. For potential data mining purposes.
         *
         * @type {string}
         */
        this.clientType = this.clientType || "";

        /**
         * The color (side) of this player. Either 'White' or 'Black', with the 'White' player having the first move.
         *
         * @type {string}
         */
        this.color = this.color || "";

        /**
         * True if this player is currently in check, and must move out of check, false otherwise.
         *
         * @type {boolean}
         */
        this.inCheck = this.inCheck || false;

        /**
         * If the player lost the game or not.
         *
         * @type {boolean}
         */
        this.lost = this.lost || false;

        /**
         * If the Player has made their move for the turn. true means they can no longer move a Piece this turn.
         *
         * @type {boolean}
         */
        this.madeMove = this.madeMove || false;

        /**
         * The name of the player.
         *
         * @type {string}
         */
        this.name = this.name || "";

        /**
         * This player's opponent in the game.
         *
         * @type {Player}
         */
        this.opponent = this.opponent || null;

        /**
         * All the uncaptured chess Pieces owned by this player.
         *
         * @type {Array.<Piece>}
         */
        this.pieces = this.pieces || [];

        /**
         * The direction your Pieces must go along the rank axis until they reach the other side.
         *
         * @type {number}
         */
        this.rankDirection = this.rankDirection || 0;

        /**
         * The reason why the player lost the game.
         *
         * @type {string}
         */
        this.reasonLost = this.reasonLost || "";

        /**
         * The reason why the player won the game.
         *
         * @type {string}
         */
        this.reasonWon = this.reasonWon || "";

        /**
         * The amount of time (in ns) remaining for this AI to send commands.
         *
         * @type {number}
         */
        this.timeRemaining = this.timeRemaining || 0;

        /**
         * If the player won the game or not.
         *
         * @type {boolean}
         */
        this.won = this.won || false;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Player",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    toString: function() {
        return "Player {color} '{name}' #{id}".format(this);
    },

    getMoves: function(player, asyncReturn) {
        return this.game.validMoves;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Player;

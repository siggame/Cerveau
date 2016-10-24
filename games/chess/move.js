// Move: Contains all details about a Piece's move in the game.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Move: Contains all details about a Piece's move in the game.
var Move = Class(GameObject, {
    /**
     * Initializes Moves.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The Piece captured by this Move, null if no capture.
         *
         * @type {Piece}
         */
        this.captured = this.captured || null;

        /**
         * The file the Piece moved from.
         *
         * @type {string}
         */
        this.fromFile = this.fromFile || "";

        /**
         * The rank the Piece moved from.
         *
         * @type {number}
         */
        this.fromRank = this.fromRank || 0;

        /**
         * The Piece that was moved.
         *
         * @type {Piece}
         */
        this.piece = this.piece || null;

        /**
         * The Piece type this Move's Piece was promoted to from a Pawn, empty string if no promotion occurred.
         *
         * @type {string}
         */
        this.promotion = this.promotion || "";

        /**
         * The standard algebraic notation (SAN) representation of the move.
         *
         * @type {string}
         */
        this.san = this.san || "";

        /**
         * The file the Piece moved to.
         *
         * @type {string}
         */
        this.toFile = this.toFile || "";

        /**
         * The rank the Piece moved to.
         *
         * @type {number}
         */
        this.toRank = this.toRank || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Move",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Move;

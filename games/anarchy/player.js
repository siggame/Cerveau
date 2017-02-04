// Player: A player in this game. Every AI controls one player.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Player: A player in this game. Every AI controls one player.
var Player = Class(GameObject, {
    /**
     * Initializes Players.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * How many bribes this player has remaining to use during their turn. Each action a Building does costs 1 bribe. Any unused bribes are lost at the end of the player's turn.
         *
         * @type {number}
         */
        this.bribesRemaining = this.bribesRemaining || 0;

        /**
         * All the buildings owned by this player.
         *
         * @type {Array.<Building>}
         */
        this.buildings = this.buildings || [];

        /**
         * What type of client this is, e.g. 'Python', 'JavaScript', or some other language. For potential data mining purposes.
         *
         * @type {string}
         */
        this.clientType = this.clientType || "";

        /**
         * All the FireDepartments owned by this player.
         *
         * @type {Array.<FireDepartment>}
         */
        this.fireDepartments = this.fireDepartments || [];

        /**
         * The Warehouse that serves as this player's headquarters and has extra health. If this gets destroyed they lose.
         *
         * @type {Warehouse}
         */
        this.headquarters = this.headquarters || null;

        /**
         * If the player lost the game or not.
         *
         * @type {boolean}
         */
        this.lost = this.lost || false;

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
         * All the PoliceDepartments owned by this player.
         *
         * @type {Array.<PoliceDepartment>}
         */
        this.policeDepartments = this.policeDepartments || [];

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
         * All the warehouses owned by this player. Includes the Headquarters.
         *
         * @type {Array.<Warehouse>}
         */
        this.warehouses = this.warehouses || [];

        /**
         * All the WeatherStations owned by this player.
         *
         * @type {Array.<WeatherStation>}
         */
        this.weatherStations = this.weatherStations || [];

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

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Player;

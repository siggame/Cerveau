// Player: A player in this game. Every AI controls one player.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

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
         * What type of client this is, e.g. 'Python', 'JavaScript', or some other language. For potential data mining purposes.
         *
         * @type {string}
         */
        this.clientType = this.clientType || "";

        /**
         * Every Cowboy owned by this Player.
         *
         * @type {Array.<Cowboy>}
         */
        this.cowboys = this.cowboys || [];

        /**
         * How many enemy Cowboys this player's team has killed.
         *
         * @type {number}
         */
        this.kills = this.kills || 0;

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
         * How rowdy their team is. When it gets too high their team takes a collective siesta.
         *
         * @type {number}
         */
        this.rowdiness = this.rowdiness || 0;

        /**
         * How many times their team has played a piano.
         *
         * @type {number}
         */
        this.score = this.score || 0;

        /**
         * 0 when not having a team siesta. When greater than 0 represents how many turns left for the team siesta to complete.
         *
         * @type {number}
         */
        this.siesta = this.siesta || 0;

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

        /**
         * The YoungGun this Player uses to call in new Cowboys.
         *
         * @type {YoungGun}
         */
        this.youngGun = this.youngGun || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Player",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Adds rowdiness to the player, which may cause a siesta
     *
     * @param {number} num - amount of rowdiness to add
     */
    addRowdiness: function(num) {
        this.rowdiness += num;

        if(this.rowdiness >= this.game.rowdinessToSiesta) {
            this.rowdiness = 0;
            this.siesta = this.game.siestaLength;

            // siesta!
            for(var i = 0; i < this.cowboys.length; i++) {
                var cowboy = this.cowboys[i];

                if(cowboy.isDead) {
                    continue;
                }

                cowboy.turnsBusy = this.game.siestaLength;
                cowboy.isDrunk = true;
                cowboy.drunkDirection = ""; // they don't move in a direction during a siesta
                cowboy.hasMoved = true;
                cowboy.focus = 0;
            }
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Player;

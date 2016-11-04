var Class = require(__basedir + "/utilities/class");
var BaseGame = require("./baseGame");
var extend = require("extend");
var serializer = require("../serializer");
var log = require("../log");

/**
 * @class TurnBasedGame - a base game that is turn based, with helper functions that should be common between turn based games. defined in Creer data and implimented here so we don't have to re-code it all the time.
 */
var TurnBasedGame = Class(BaseGame, {
    init: function(data /* ... */) {
        // clients can request a different amount of time added after each time, in sec
        if(data.turnTimeAdded) {
            var num = Number(data.turnTimeAdded);
            if(!isNaN(num) && num > 0) {
                this._playerAdditionalTimePerTurn = num * 1e9; // convert sec to ns
            }
        }

        return BaseGame.init.apply(this, arguments);
    },

    _playerAdditionalTimePerTurn: 1e9, // 1 sec in ns

    /**
     * begins the turn based game to the first player
     */
    begin: function() {
        BaseGame.begin.apply(this, arguments);

        this.currentPlayer = this.players[0];
    },

    /**
     * after the game has started we order the first player to runTurn
     */
    _started: function() {
        BaseGame._started.apply(this, arguments);

        this.order(this.currentPlayer, "runTurn");
    },

    /**
     * Called when an AI has finished their turn, if they returned true from that then they want to end their turn.
     *
     * @param {Player} player - the player for the ai that finished a runTurn()
     * @param {boolean} data - true when they finished their turn, false otherwise (which re-runs their turn)
     */
    aiFinishedRunTurn: function(player, data) {
        if(data === true) { // ais that return true from runTurn() mean they ran their turn, and are done with it
            this.nextTurn();
        }

        this.order(this.currentPlayer, "runTurn"); // tell the current player to run their turn, because the passed in player may no longer be the current player as we ran game logic above
    },

    /**
     * Transitions to the next turn, increasing turn and setting the currentPlayer to the next one.
     */
    nextTurn: function() {
        if(this.currentTurn + 1 === this.maxTurns) {
            this._maxTurnsReached();
            return;
        }

        this.currentTurn++;
        this.currentPlayer = this.players.nextWrapAround(this.currentPlayer);
        this.currentPlayer.timeRemaining += this._playerAdditionalTimePerTurn;
    },

    /**
     * Intended to be inherited and then max turn victory conditions checked to find the winner/looser.
     */
    _maxTurnsReached: function() {
        this.isOver(true);
    },
});

module.exports = TurnBasedGame;

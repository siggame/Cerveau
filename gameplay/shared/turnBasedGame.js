var Class = require(__basedir + "/utilities/class");
var BaseGame = require("./baseGame");
var extend = require("extend");
var serializer = require("../serializer");

/**
 * @class TurnBasedGame - a base game that is turn based, with helper functions that should be common between turn based games. defined in Creer data and implimented here so we don't have to re-code it all the time.
 */
var TurnBasedGame = Class(BaseGame, {
    init: function() {
        BaseGame.init.apply(this, arguments);

        this._addProperty("currentTurn", 0);
        this._addProperty("maxTurns", 100); // real class should override this during init
        this._addProperty("currentPlayer", null);
    },

    /**
     * begins the turn based game to the first player
     */
    begin: function() {
        BaseGame.begin.apply(this, arguments);
        
        this.currentPlayer = this.players[0];
        this.order(this.currentPlayer, "runTurn");
    },

    /**
     * Called when an AI has finished their turn, if they returned true from that then they want to end their turn.
     * 
     * @param {Player} player for the ai that finished a runTurn()
     * @param {boolean} true when they finished their turn, false otherwise (which re-runs their turn)
     */
    aiFinished_runTurn: function(player, data) {
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
    },

    /**
     * Intended to be inherited and then max turn victory conditions checked to find the winner/looser.
     */
    _maxTurnsReached: function() {
        this.isOver(true);
    },
});

module.exports = TurnBasedGame;

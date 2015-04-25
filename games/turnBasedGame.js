var Class = require("../utilities/class");
var BaseGame = require("./baseGame");
var extend = require("extend");

// @class TurnBasedGame: a base game that is turn based, with helper functions that should be common between turn based games. defined in Creer data and implimented here so we don't have to re-code it all the time.
var TurnBasedGame = Class(BaseGame, {
	init: function() {
		BaseGame.init.apply(this, arguments);

		this.currentTurn = 0;
		this.maxTurns = 100; // real class should override this during init
		this.currentPlayer = null;

		extend(this._serializableKeys, {
			"currentTurn": true,
			"maxTurns": true,
			"currentPlayer": true,
		});
	},

	/// begins the turn based game to the first player
	begin: function() {
		BaseGame.begin.apply(this, arguments);
		
		this.currentPlayer = this.players[0];
		this.addRequest(this.currentPlayer, "runTurn");
	},

	handleRunTurn: function(player, data) {
		var success = this.executeCommandFor(player, data);

		if(success) {
			this.addRequest(this.currentPlayer, "runTurn"); // tell the current player to run their turn, because the passed in player may no longer be the current player as we ran game logic above
		}

		return success;
	},

	/// transitions to the next turn, increasing turn and setting the currentPlayer to the next one
	nextTurn: function(forcePlayer) {
		if(this.currentTurn + 1 === this.maxTurns) {
			return this._maxTurnsReached();
		}

		this.currentTurn++;
		var index = Math.max(0, this.players.indexOf(this.currentPlayer)); // turn based games will only ever have one current player
		index++;

		if(index >= this.players.length) {
			index = 0;
		}

		this.currentPlayer = this.players[index];

		return true;
	},

	/// intended to be inherited and then max turn victory conditions checked to find the winner/looser.
	// @inheritable
	_maxTurnsReached: function() {
		this.isOver(true);
		return true;
	},
});

module.exports = TurnBasedGame;

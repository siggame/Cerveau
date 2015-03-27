var Class = require("../utilities/class");
var BaseGame = require("./baseGame");
var extend = require("extend");

// @class TurnBasedGame: a base game that is turn based, with helper functions that should be common between turn based games
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
		this.currentPlayers.empty();
		this.currentPlayers.push(this.players[0]);
		this.currentPlayer = this.currentPlayers[0];
	},

	/// transitions to the next turn, increasing turn and setting the currentPlayer to the next one
	nextTurn: function() {
		if(this.currentTurn + 1 === this.maxTurns) {
			return this._maxTurnsReached();
		}

		this.currentTurn++;
		var index = Math.max(0, this.players.indexOf(this.currentPlayers[0])); // turn based games will only ever have one current player
		index++;

		if(index >= this.players.length) {
			index = 0;
		}

		this.currentPlayers[0] = this.players[index];
		this.currentPlayer = this.currentPlayers[0];

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

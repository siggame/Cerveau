var Class = require("../structures/class");
var BaseGame = require("./baseGame");
var extend = require("extend");

// @class TurnBasedGame: a base game that is turn based, with helper functions that should be common between turn based games
var TurnBasedGame = Class(BaseGame, {
	init: function() {
		BaseGame.init.apply(this, arguments);

		extend(this.state, {
			currentTurn: 0,
			maxTurns: 100, // real class should override this during init
			currentPlayer: null,
		});
	},

	begin: function() {
		BaseGame.begin.apply(this, arguments);
		this.state.currentPlayers.empty();
		this.state.currentPlayers.push(this.state.players[0]);
		this.state.currentPlayer = this.state.currentPlayers[0];
	},

	nextTurn: function() {
		if(this.state.currentTurn + 1 === this.state.maxTurns) {
			return this._maxTurnsReached();
		}

		this.state.currentTurn++;
		var index = Math.max(0, this.state.players.indexOf(this.state.currentPlayers[0])); // turn based games will only ever have one current player
		index++;

		if(index >= this.state.players.length) {
			index = 0;
		}

		this.state.currentPlayers[0] = this.state.players[index];
		this.state.currentPlayer = this.state.currentPlayers[0];

		return true;
	},

	// @inheritable
	// intended to be imherited and then max turn victory conditions checked to find the winner/looser.
	_maxTurnsReached: function() {
		this.isOver(true);
		return true;
	},
});

module.exports = TurnBasedGame;

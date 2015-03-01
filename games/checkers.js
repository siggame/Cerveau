// Checkers test
var Class = require("../structures/class");
var Game = require("./game");

var CheckersGame = Class(Game, {
	init: function() {
		Game.init.apply(this, arguments);

		extend(this.state, {
			gameName: "checkers",
			boardWidth: 8,
			boardHeight: 8,
			checkers: [],
			turnNumber: 0,
			maxTurns: 500,
			checkerMovedID: -1,
			checkerMovedJumped: false,
		});

		this._maxNumberOfPlayers = 2;
	},

	start: function() { // TO INHERIT
		Game.start.apply(this, arguments);

		this._initCheckerPieces();
	},

	_initCheckerPieces: function() {
		for(var x = 0; x < this.state.boardWidth; x++) {
			for(var y = 0; y < this.state.boardHeight; y++) {
				if(this.isValidTile(x, y)) {
					var ownerID = -1;

					if(y < 3) { // then it is player 1's checker
						ownerID = this.state.players[0].id;
					}
					else if(y > 4) { // then it is player 2's checker
						ownerID = this.state.players[1].id;
					} // else is the middle, which has no intial checker pieces

					if(ownerID > -1) {
						var checker = this.newObject({
							ownerID: ownerID,
							x: x,
							y: y,
							kinged: false,
						});

						this.state.checkers.push(checker);
					}
				}

			}
		}
	},

	isValidTile: function(x, y) {
		return (x + y)%2 == 1;
	},

	getCheckerAt: function(x, y) {
		for(var i = 0; i < this.state.checkers.length; i++) {
			var checker = this.state.checkers[i];

			if(checker.x == x && checker.y == y) {
				return checker;
			}
		}
	},

	move: function(player, data) {
		var checker = data.checker;
		var x = data.x;
		var y = data.y;

		var checkersOwner = this.getByID(checker.ownerID);
		if(player !== checkersOwner) {
			return this.declairLoser(player, "tried to move a checker they didn't own");
		}

		if(this.state.checkerMovedID !== -1) {
			if(checker.id !== this.state.checkerMovedID) {
				return this.declairLoser(player, "tried to move a diferent checker than the already moved one");
			}
			else if(!this.state.checkerMovedJumped) {
				return this.declairLoser(player, "tried to move again after not jumping another checker.");
			}
		}

		if(this.getCheckerAt(x, y)) {
			return this.declairLoser(player, "tried to move onto another checker");
		}

		var yOffset = 0;
		var yKing = 0;
		if(checker.ownerID == 0) { // then first player, moves down
			yOffset = 1;
			yKing = this.state.boardHeight - 1;
		}
		else {
			yOffset = -1;
			yKing = 0;
		}

		var dy = y - checker.y
		var dx = x - checker.x

		if(!checker.kinged) { // then check if they are moving the right direction via dy when not kinged
			if(yOffset == 1 && dy < 1) {
				return this.declairLoser(player, "moved in the wrong vertical direction");
			}

			if(yOffset == -1 && dy > -1) {
				return this.declairLoser(player, "moved in the wrong vertical direction");
			}
		}

		var jumped;
		if(Math.abs(dx) === 2 && Math.abs(dy) === 2) { // then it's jumping something
			jumped = this.getCheckerAt(checker.x + dx/2, checker.y + dy/2);

			if(!jumped) {
				return this.declairLoser(player, "tried to jump nothing");
			}
			else if(jumped.ownerID === checker.ownerID) {
				return this.declairLoser(player, "tried to jump own checker");
			}
		}
		else if(Math.abs(dx) === 1 && Math.abs(dy) === 1) { // then they are just moving 1 tile diagonally
			if(this.state.checkerMovedJumped) {
				return this.declairLoser(player, "current checker must jump again, not move diagonally one tile");
			}
			// else valid as normal move
		}
		else {
			return this.declairLoser(player, "can't move there");
		}

		checker.x = x;
		checker.y = y;

		if(checker.y === yKing) {
			checker.kinged = true;
		}

		if(this.state.checkerMovedID == -1) {
			this.state.checkerMovedID = checker.id;
		}

		if(jumped) {
			if(jumped.ownerID !== checker.ownerID) {
				this.state.checkers.removeElement(jumped);

				var checkersOwnerWon = true;
				for(var i = 0; i < this.state.checkers.length; i++) {
					if(checker.ownerID !== this.state.checkers[i].ownerID) {
						checkersOwnerWon = false;
						break;
					}
				}

				if(checkersOwnerWon) {
					return this.declairWinner(checkersOwner);
				}
			}

			this.state.checkerMovedJumped = true;
		}

		return true;
	},

	done: function(player) {
		this.state.checkerMovedID = -1;
		this.state.checkerMovedJumped = false;
		this.state.turnNumber++;
		this.state.currentPlayersIDs[0]++;

		if(this.state.turnNumber === this.state.maxTurns) {
			this.over = true;

			var checkerValuesForPlayerID = {};
			for(var i = 0; i < this.state.checkers.length; i++) {
				var checker = this.state.checkers[i];
				checkerValuesForPlayerID[checker.ownerID] = checkerValuesForPlayerID[checker.ownerID] || 1;
				checkerValuesForPlayerID[checker.ownerID] += (checker.kinged ? 100 : 1);
			}

			// TODO: handle draw
			var winner;
			for(var i = 0; i < this.state.players.length; i++) {
				var player = this.state.players[i];
				winner = winner || player;

				if(checkerValuesForPlayerID[player.id] > checkerValuesForPlayerID[winner.id]) {
					winner = player;
				}
			}

			if(winner) {
				return this.declairWinner(winner);
			}
		}

		if(!this.state.players[this.state.currentPlayersIDs[0]]) {
			this.state.currentPlayersIDs[0] = 0;
		}

		return true;
	},
});

module.exports = CheckersGame;

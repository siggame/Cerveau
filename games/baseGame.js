var Class = require("../utilities/class");
var errors = require("../errors");
var constants = require("../constants");
var serializer = require("../utilities/serializer");
var moment = require('moment');

// @class BaseGame: the base game plugin new games should inherit from.
var BaseGame = Class({
	init: function(data) {
		// serializable member variables
		this.players = [];
		this.gameObjects = {};
		this.session = (data.session === undefined ? "Unknown" : data.session);

		this._orders = []; // orders to be sent to AI clients when the parent session is ready
		this._returnedDataTypeConverter = {};
		this._started = false;
		this._over = false;
		this._nextGameObjectID = 0;
		this._lastSerializableState = null;
		this._currentSerializableState = null;
		this._serializableDeltaState = null;
		this._deltas = []; // record of all delta states, for the game log generation

		this._serializableKeys = {
			"players": true,
			"currentPlayers": true,
			"gameObjects": true,
			"session": true,
			"name": true,
		};
	},

	// @static - because that way this exicsts without making a new instance
	name: "Base Game", // should be overwritten by the GeneratedGame inheriting this
	numberOfPlayers: 2,
	maxInvalidsPerPlayer: 10,



	/////////////////////////////
	// Server starting methods //
	/////////////////////////////

	/// Do not inherit this method, instead use begin()
	// @param players {Array<Client>} of clients that are playing this game as a player
	start: function(clients) {
		this._initPlayers(clients);

		this.begin();

		this._updateSerializableStates();
		this._started = true;
	},

	// @returns boolean representing if the game has started yet.
	hasStarted: function() {
		return this._started;
	},

	// @inheritable: intended to be inherited and extended when the game should be started (e.g. initializing game objects)
	begin: function() {
		// This should be inheritied in <gamename>/game.js. This function is simply here in case they delete the function because they don't need it (no idea why that would be the case though).
	},



	/////////////
	// Players //
	/////////////

	_initPlayers: function(clients) {
		for(var i = 0; i < clients.length; i++) {
			var client = clients[i];
			var player = this.newPlayer({ // this method should be implimented in GeneratedGame
				name: client.name || ("Player " + i),
				clientType: client.type || "Unknown",
			});

			player.invalidMessages = [];
			player.timeRemaining = player.timeRemaining || 1e10; // 10 seconds in nanoseconds
			player.client = client;
			client.setGameData(this, player);
			this.players.push(player);
		}
	},

	/// remove the client from the game and checks if they have a player and if removing them alters the game
	playerDisconnected: function(player, reason) {
		if(player && this.hasStarted() && !this.isOver()) {
			this.declairLoser(player, reason || "Disconnected during gameplay.");
		}
	},



	//////////////////
	// Game Objects //
	//////////////////

	// @returns BaseGameObject with the given id
	getGameObject: function(id) { // TO INHERIT
		id = parseInt(id);
		if(id !== NaN) {
			return this.gameObjects[id];
		}
	},

	// @returns boolean representing if the passed in obj is a tracked game object in this game
	isGameObject: function(obj) {
		return (serializer.isObject(obj) && obj.id !== undefined && this.getGameObject(obj.id) === obj);
	},

	_generateNextGameObjectID: function() {
		return String(this._nextGameObjectID++); // returns this._nextGameObjectID then increments by 1 (that's how post++ works FYI)
	},

	/// tracks the game object, should be called via BaseGameObjects during their initialization
	// @returns int thier id
	trackGameObject: function(gameObject) {
		gameObject.id = this._generateNextGameObjectID()
		this.gameObjects[gameObject.id] = gameObject;
		return gameObject.id;
	},



	/////////////////////////////////
	// Client Responses & Requests //
	/////////////////////////////////

	aiFinished: function(player, finished, data) {
		var callback = this["aiFinished_" + finished];
		if(this._returnedDataTypeConverter[finished]) {
			data = this._returnedDataTypeConverter[finished](data);
		}
		var invalid = undefined;

		if(callback) {
			try {
				callback.call(this, player, data);
			}
			catch(e) {
				if(Class.isInstance(e, errors.GameLogicError)) {
					invalid = {finished: finished, data: data, message: e.message};
				}
			}

			this._updateSerializableStates();
		}
		else {
			invalid = {finished: finished}
		}

		return invalid;
	},

	aiRun: function(player, run) {
		var callback = run.caller["_run" + run.functionName.upcaseFirst()];
		var ran = {};

		if(callback) {
			try {
				ran.returned = callback.call(run.caller, player, run.args || {});
			}
			catch(e) {
				if(Class.isInstance(e, errors.GameLogicError)) {
					ran.invalid = {args: run.args, message: e.message};
				}
				else {
					throw e; // a different, unexpected, error occured
				}
			}
			
			this._updateSerializableStates();
		}
		else {
			ran.invalid = {functionName: functionName};
		}

		return ran;
	},

	order: function(player, order, args) {
		this._orders.push({
			player: player,
			order: order,
			args: args || [],
		});
	},

	popOrders: function() {
		var orders = this._orders.clone();
		this._orders.empty();
		return orders;
	},



	///////////////////////////
	// States & Delta States //
	///////////////////////////

	/// returns the difference between the last and current state for the given player
	// @param <Player> player: for inheritance if the state differs between players
	getSerializableDeltaStateFor: function(player) {
		return this._serializableDeltaState;
	},

	/// updates all the private states used to generate delta states and game logs
	_updateSerializableStates: function() {
		this.hasStateChanged = false;

		var last = this._currentSerializableState || {};
		var current = serializer.serialize(this);
		var delta = serializer.getDelta(last, current);

		if(delta && !serializer.isEmpty(delta)) { // then there is an actual difference between the last and current state
			this.hasStateChanged = true;
			this._lastSerializableState = last;
			this._currentSerializableState = current;
			this._serializableDeltaState = delta;

			this._deltas.push(delta);
		}
	},

	generateGamelog: function(clients) {
		var winners = [];
		var losers = [];

		for(var i = 0; i < clients.length; i++) {
			if(clients[i].player.won) {
				winners.push(i);
			}
			else {
				losers.push(i);
			}
		}

		return {
			gameName: this.name,
			gameSession: this.session,
			deltas: this._deltas,
			epoch: moment().valueOf(),
			winners: winners,
			losers: losers,
		};
	},



	/////////////////////////
	// Winning and Loosing //
	/////////////////////////

	/// @returns boolean representing if this game is over
	isOver: function(isOver) {
		if(isOver) {
			this._over = true;
		}

		return this._over;
	},

	throwInvalidGameLogic: function(player, message) {
		player.invalidMessages.push(message);

		if(player.invalidMessages.length > this.maxInvalidsPerPlayer) {
			this.declairLoser(player, message);
		}
		
		throw new errors.GameLogicError(message);
	},

	/// declairs a player as having lost, and assumes when a player looses the rest could still be competing to win
	// @param <Player> loser: player that lost the game
	// @param <string> reason (optional): string that is the lose reason
	// @param <object> flags (optional): 'dontCheckForWinner' key to set to not check for winner
	declairLoser: function(loser, reason, flags) {
		loser.lost = true;
		loser.reasonLost = reason || "Lost";
		loser.won = false;
		loser.reasonWon = "";

		if(!flags || !flags.dontCheckForWinner) {
			this.checkForWinner();
		}
	},

	/// declairs the player as winning, assumes when a player wins the rest lose (unless they've already been set to win)
	// @param <Player> winner: player that won the game, the rest loose if not already won
	// @param <string> reason (optional): the win reason string
	declairWinner: function(winner, reason) {
		winner.won = true;
		winner.reasonWon = reason || "Won";
		winner.lost = false;
		winner.reasonLost = "";

		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];

			if(player !== winner && !player.won && !player.lost) { // then this player has not lost yet and now looses because someone else won
				this.declairLoser(player, "Other player won", {dontCheckForWinner: true});
			}
		}

		this.isOver(true);
	},

	/// checks if this game is over because there is a winner (all other players have lost)
	checkForWinner: function() {
		var winner;
		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];

			if(!player.lost) {
				if(winner) {
					return false;
				}
				else {
					winner = player;
				}
			}
		}

		if(winner) {
			this.declairWinner(winner, "All other players lost.");
			return true;
		}
	},
});

module.exports = BaseGame

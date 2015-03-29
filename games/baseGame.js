var Class = require("../utilities/class");
var constants = require("../constants");
var serializer = require("../utilities/serializer");

// @class BaseGame: the base game plugin new games should inherit from.
var BaseGame = Class({
	init: function(session) {
		this.players = [];
		this.currentPlayers = []; // players current awaiting commands from (basically turns)
		this.gameObjects = {};

		this.session = session;
		this.name = "Base Game"; // should be overwritten by the GeneratedGame inheriting this
		this.clients = []; // the server will add and remove these via add/removeClient

		this._started = false;
		this._over = false;

		this._maxNumberOfPlayers = 2;
		this._nextGameObjectID = 0;

		this._lastSerializableState = null;
		this._currentSerializableState = null;
		this._serializableDeltaState = null;
		this.states = []; // record of all delta states, for the game log generation

		this._serializableKeys = {
			"players": true,
			"currentPlayers": true,
			"gameObjects": true,
			"session": true,
			"name": true,
		};
	},


	//--- Server starting methods ---\\

	// Do not inherit this method, instead use begin()
	_start: function() {
		this._initPlayers(this.clients);

		this.begin();

		this._updateSerializableStates();
		this._started = true;
	},

	hasStarted: function() {
		return this._started;
	},

	// @inheritable: intended to be inherited and extended when the game should be started (e.g. initializing game objects)
	begin: function() {
		// This should be inheritied in <gamename>/game.js. This function is simply here in case they delete the function because they don't need it (no idea why that would be the case though).
	},



	//--- Client/Player ---\\

	_initPlayers: function() {
		for(var i = 0; i < this.clients.length; i++) {
			var client = this.clients[i];
			var player = this.newPlayer({ // this method should be implimented in GeneratedGame
				name: client.name || ("Player " + i),
				clientType: client.type || "Unknown",
			});

			player.timeRemaining = player.timeRemaining || 10000; // 10 seconds (10,000ms)
			player.client = client;
			client.player = player;
			this.players.push(player);
		}
	},


	hasEnoughPlayers: function() {
		return this.clients.length === this._maxNumberOfPlayers; //TODO: check to make sure the clients are all players and not something else... like a listener?
	},

	getCurrentPlayers: function() {
		var currentPlayers = [];
		for(var i = 0; i < this.currentPlayers.length; i++) {
			currentPlayers.push(this.currentPlayers[i]);
		}
		return currentPlayers;
	},

	playerTimedOut: function(player) {
		player.timeRemaining = 0;
		this.declairLoser(player, "Timed out");

		// TODO: server should probably subscribe to events like this...
	},

	addClient: function(client) {
		this.clients.push(client);
		client.game = this;

		if(this.hasEnoughPlayers()) {
			console.log("game", this.name, this.session, "starting!");
			this._start();
		}
	},

	removeClient: function(client) {
		var player = client.player;
		this.clients.removeElement(client);
		if(player) {
			this.players.removeElement(player);

			if(this.hasStarted() && !this.isOver()) {
				this.declairLoser(player, "Disconnected");
			}
		}
	},



	//--- Game Object & their commands ---\\

	getGameObject: function(id) { // TO INHERIT
		id = parseInt(id);
		if(id !== NaN) {
			return this.gameObjects[id];
		}
	},

	trackGameObject: function(gameObject) {
		gameObject.id = this._nextGameObjectID++;
		this.gameObjects[gameObject.id] = gameObject;
		return gameObject.id;
	},

	getCommand: function(commandString) {
		if(this._validCommands.contains(commandString)) {
			return this[commandString];
		}
	},

	executeCommandFor: function(client, data) {
		var player = client.player;
		var gameObject = this.getGameObject(data.caller.id);
		var commandFunction = gameObject["command_" + data.command];

		var success = false;
		if(commandFunction) {
			success = commandFunction.call(gameObject, player, data);
		}
		else {
			console.error("No command", data.command, "in", gameObject.gameObjectName);
		}

		this._updateSerializableStates();
		return success;
	},



	//--- State & Delta State ---\\

	// generates and returns the difference between the last and current state
	getSerializableDeltaState: function() { // TODO: impliment getDeltaStateFor player
		return this._serializableDeltaState;
	},

	_updateSerializableStates: function() {
		this._lastSerializableState = this._currentSerializableState || {};
		this._currentSerializableState = serializer.serialize(this);
		this._serializableDeltaState = serializer.getDelta(this._lastSerializableState, this._currentSerializableState) || {};

		this.states.push(this._serializableDeltaState);
	},



	//--- Winning and Loosing ---\\

	isOver: function(isOver) {
		if(isOver) {
			this._over = true;
		}

		return this._over;
	},

	// assumes when a player looses the rest could still be competing to win
	declairLoser: function(loser, reason, flags) {
		loser.lost = true;
		loser.loseReason = reason || "Lost";
		loser.won = false;
		loser.winReason = "";

		console.log("player", loser.name, "lost because", reason);
		if(!flags || !flags.dontCheckForWinner) {
			this.checkForWinner();
		}

		return false;
	},

	// assumes when a player wins the rest lose (unless they've already been set to win)
	declairWinner: function(winner, reason) {
		winner.won = true;
		winner.winReason = reason || "Won";
		winner.lost = false;
		winner.loseReason = "";

		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];

			if(player !== winner && !player.won) {
				this.declairLoser(player, "Other player won", {dontCheckForWinner: true});
			}
		}

		this.isOver(true);
		return true;
	},

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
			return this.declairWinner(winner, "All other players lost.");
		}
		return false;
	},
});

module.exports = BaseGame

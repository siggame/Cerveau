var Class = require("../utilities/class");
var constants = require("../constants");
var serializer = require("../utilities/serializer");

// @class BaseGame: the base game plugin new games should inherit from.
var BaseGame = Class({
	init: function(session) {
		// serializable member variables
		this.players = [];
		this.currentPlayers = []; // players current awaiting commands from (basically turns)
		this.gameObjects = {};
		this.session = session;
		this.name = "Base Game"; // should be overwritten by the GeneratedGame inheriting this

		this.clients = []; // the server will add and remove these via add/removeClient
		this.states = []; // record of all delta states, for the game log generation

		this._started = false;
		this._over = false;
		this._maxNumberOfPlayers = 2;
		this._nextGameObjectID = 0;
		this._lastSerializableState = null;
		this._currentSerializableState = null;
		this._serializableDeltaState = null;

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

	// @returns boolean representing if the game has started yet.
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

	// @returns boolean representing if this game has enough players in it to start
	hasEnoughPlayers: function() {
		return this.clients.length === this._maxNumberOfPlayers; //TODO: check to make sure the clients are all players and not something else... like a listener?
	},

	// @returns array<Player> of all the Players currently awaiting commands from
	getCurrentPlayers: function() {
		var currentPlayers = [];
		for(var i = 0; i < this.currentPlayers.length; i++) {
			currentPlayers.push(this.currentPlayers[i]);
		}
		return currentPlayers;
	},

	/// called when a player times out, which makes them loose this game.
	playerTimedOut: function(player) {
		player.timeRemaining = 0;
		this.declairLoser(player, "Timed out");

		// TODO: server should probably subscribe to events like this...
	},

	/// for the server to add clients to this game. This does NOT create the player for the added client
	addClient: function(client) {
		this.clients.push(client);
		client.game = this;

		if(this.hasEnoughPlayers()) {
			console.log("game", this.name, this.session, "starting!");
			this._start();
		}
	},

	/// remvoed the client from the game and checks if they have a player and if removing them alters the game
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
		return this._nextGameObjectID++; // returns this._nextGameObjectID then increments by 1 (that's how post++ works FYI)
	},

	/// tracks the game object, should be called via BaseGameObjects during their initialization
	// @returns int thier id
	trackGameObject: function(gameObject) {
		gameObject.id = this._generateNextGameObjectID()
		this.gameObjects[gameObject.id] = gameObject;
		return gameObject.id;
	},

	/// executes a command for a client via reflection, which should alter the game state
	// @param <Client> client that wants to execute the command
	// @param <object> data: formatted command data that must include the caller.id and command string reprenting a function on the caller to execute. Any other keys are variables for that function.
	// @returns boolean representing if the command was executed successfully (clients can send invalid data, it's up to the game logic being called to decide if it was valid here)
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

	/// returns the difference between the last and current state for the given client
	// @param <Client> client: for inheritance if the state differs between clients
	getSerializableDeltaStateFor: function(client) {
		return this._serializableDeltaState;
	},

	/// updates all the private states used to generate delta states and game logs
	_updateSerializableStates: function() {
		this._lastSerializableState = this._currentSerializableState || {};
		this._currentSerializableState = serializer.serialize(this);
		this._serializableDeltaState = serializer.getDelta(this._lastSerializableState, this._currentSerializableState) || {};

		this.states.push(this._serializableDeltaState);
	},



	//--- Winning and Loosing ---\\

	/// @returns boolean representing if this game is over
	isOver: function(isOver) {
		if(isOver) {
			this._over = true;
		}

		return this._over;
	},

	/// declairs a player as having lost, and assumes when a player looses the rest could still be competing to win
	// @param <Player> loser: player that lost the game
	// @param <string> reason (optional): string that is the lose reason
	// @param <object> flags (optional): 'dontCheckForWinner' key to set to not check for winner
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

	/// declairs the player as winning, assumes when a player wins the rest lose (unless they've already been set to win)
	// @param <Player> winner: player that won the game, the rest loose if not already won
	// @param <string> reason (optional): the win reason string
	declairWinner: function(winner, reason) {
		winner.won = true;
		winner.winReason = reason || "Won";
		winner.lost = false;
		winner.loseReason = "";

		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];

			if(player !== winner && !player.won && !player.lost) { // then this player has not lost yet and now looses because someone else won
				this.declairLoser(player, "Other player won", {dontCheckForWinner: true});
			}
		}

		this.isOver(true);
		return true;
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
			return this.declairWinner(winner, "All other players lost.");
		}
		return false;
	},
});

module.exports = BaseGame

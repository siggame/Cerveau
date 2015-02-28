// @class Game: the base game plugin new games should inherit from.
var Class = require("../structures/class");

var Game = Class({
	init: function(name, session) {
		this.state = {
			game: name,
			session: session,
			players: [],
			currentPlayersIDs: [-1],
		};

		this.name = name;
		this.session = session;
		this._started = false;
		this._maxNumberOfPlayers = 2;
		this._nextID = 0;
		this._trackedObjects = [];
		this.over = false;
		this.clients = []; // the server will add and remove these
		this._playerIDToClient = {};
		this._clientToPlayerID = {};
	},

	addClient: function(client) {
		this.clients.push(client);
		client.game = this;
	},

	removeClient: function(client) {
		this.clients.removeElement(client);

		if(this.hasStarted() && !this.over) {
			var player = this.getPlayerForClient(client);
			this.declairLoser(player, "disconnected");
		}
	},

	hasEnoughPlayers: function() {
		return this.clients.length === this._maxNumberOfPlayers; //TODO: check to make sure the clients are all players and not something else... like a listener?
	},

	newObject: function(obj) {
		obj = obj || {};
		obj.id = this._getNextID();
		this._trackedObjects[obj.id] = obj;

		return obj;
	},

	_getNextID: function() { // TO INHERIT
		return this._nextID++;
	},

	getByID: function(id) { // TO INHERIT
		id = parseInt(id);
		if(id !== NaN) {
			return this._trackedObjects[id];
		}
	},

	getState: function() {
		return this.state;
	},

	// @inheritable: intended to be inherited and extended when the game should be started (e.g. initializing game objects)
	start: function() { // TO INHERIT
		this._initPlayers(this.clients);

		this._started = true;
	},

	hasStarted: function() {
		return this._started;
	},

	_initPlayers: function() {
		for(var i = 0; i < this.clients.length; i++) {
			var client = this.clients[i];
			var player = this.newObject({
				name: client.name || ("Player " + i),
			});

			this._playerIDToClient[player.id] = client;
			this.state.players[i] = player;
		}

		this.state.currentPlayersIDs[0] = this.state.players[0].id;
	},

	// assumes when a player looses the rest could still be competing to win
	declairLoser: function(loser, reason) {
		loser.lost = reason || true;
		console.log("player", loser.name, "lost because", reason);
		this.checkForWinner();

		return false;
	},

	// assumes when a player wins the rest lose.
	declairWinner: function(winner, reason) {
		winner.won = reason || true;

		for(var i = 0; i < this.state.players.length; i++) {
			var player = this.state.players[i];

			if(player !== winner && !player.won) {
				player.lost = player.lost || true;
			}
		}
		console.log("game", this.name, this.session, "is over");
		this.over = true;
	},

	checkForWinner: function() {
		var winner;
		for(var i = 0; i < this.state.players.length; i++) {
			var player = this.state.players[i];

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
			this.declairWinner(winner);
			return true;
		}

		return false;
	},

	getCurrentPlayers: function() {
		var currentPlayers = [];
		for(var i = 0; i < this.state.currentPlayersIDs.length; i++) {
			currentPlayers.push(this.getByID(this.state.currentPlayersIDs[i]));
		}
		return currentPlayers;
	},

	getClientForPlayerID: function(id) {
		return this._playerIDToClient[id]
	},

	getPlayerForClient: function(client) {
		for(var i = 0; i < this.clients.length; i++) {
			if(this.clients[i] === client) {
				return this.getByID(i);
			}
		}
	},
});

module.exports = Game

var Class = require("./utilities/class");
var Client = require("./client");
var GameLogger = require("./gameLogger");
var constants = require("./constants");
var serializer = require("./utilities/serializer");
var fs = require('fs');

// @class Server: The main class that handles incomming conncetions from clients via socket.io and managing the games they play
var Server = Class({
	init: function(io) {
		this.io = io;
		this.clients = [];
		this.games = [];
		this.gameClasses = [];
		this.nextGameNumber = 1;
		this.gameLogger = new GameLogger('gamelogs/');

		(function(self) {
			self.io.on('connection', function(socket){
				console.log("new connection!");
				self.clients.push(new Client(socket, self));

				var client = self.clients.last();
				for(var property in self.__proto__) {
					if(property.startsWith("recieve")) {
						var clientMessageType = property.slice(7 /* length of "recieve"*/).toLowerCase();

						(function(clientMessageType, property) { // force it to be evaluated right now so the on callback has reference back to the current value of clientMessageType
							socket.on(clientMessageType, function(message) {
								self[property].call(self, client, message);
							});
						})(clientMessageType, property);
					}
				}

				(function(self, client) {
					socket.on('disconnect', function() {
						console.log("Client disconnected");
						self.clients.removeElement(client);

						if(client.game) {
							client.game.removeClient(client);
						}
					});
				})(self, client);
			});
		})(this);
	},

	getGame: function(gameName, gameSession) {
		if(!this.games[gameName]) {
			this.gameClasses[gameName] = require("./games/" + gameName + "/game");
			this.games[gameName] = {};
		}

		if(gameSession === "*") { // then they want to join any game session
			gameSession = "new" // if we couldn't find one give them a new game
			var games = this.games[gameName];
			for(var session in games) {
				var game = games[session];
				if(!game.hasStarted() && !game.hasEnoughPlayers()) {
					gameSession = session;
					break;
				}
			}
		}

		if(gameSession === undefined || gameSession === "new") { // then they want a new empty game session
			gameSession = this.nextGameNumber++;
		}

		if(!this.games[gameName][gameSession]) {
			console.log("creating new game", gameName, gameSession);

			this.games[gameName][gameSession] = new this.gameClasses[gameName](gameSession);
		}

		return this.games[gameName][gameSession];
	},

	// sends a message to ALL clients. use with care.
	broadcast: function(event, message) {
		this.io.emit(event, message);
	},

	// sends to a single/multiple clients the event and message
	sendTo: function(clients, event, message) {
		if(clients.socket) { // then they just sent a client, not an array of clients.
			clients = [clients];
		}

		for(var i = 0; i < clients.length; i++) {
			clients[i].send(event, message)
		}
	},

	/*sendStateOf: function(game) {
		this.sendTo(game.clients, "state", JSON.stringify(game.getSerializableState()));
	},*/

	sendDeltaStateOf: function(game) {
		this.sendTo(game.clients, "delta", JSON.stringify(game.getSerializableDeltaState()));
	},

	getCurrentClientsFor: function(game) {
		var currentPlayers = game.getCurrentPlayers();
		var currentClients = [];
		for(var i = 0; i < currentPlayers.length; i++) {
			currentClients.push(currentPlayers[i].client);
		}
		return currentClients;
	},

	sendPlayersAwaitingAndIgnoringIn: function(game) {
		var currentClients = this.getCurrentClientsFor(game);

		for(var i = 0; i < game.clients.length; i++) {
			var client = game.clients[i];
			if(currentClients.contains(client)) {
				this.sendTo(client, "awaiting");
				client.startTimer();
			}
			else {
				this.sendTo(client, "ignoring");
				client.stopTimer();
			}
		}
	},

	clientTimedOut: function(client) {
		client.game.playerTimedOut(client.player);

		this.gameStateChanged(client.game);
	},

	stopTimersFor: function(game) {
		for(var i = 0; i < game.clients.length; i++) {
			game.clients[i].stopTimer();
		}
	},

	gameOver: function(game) {
		console.log("game", game.name, game.session, "is over");

		var clients = [];
		for(var i = 0; i < game.clients.length; i++) {
			var client = game.clients[i];
			if(!client.over) {
				client.over = true;
				clients.push(client);
			}
		}

		this.sendTo(clients, "over"); // TODO: send link to gamelog, or something like that.

		this.gameLogger.log(game);
	},

	// Functions invoked when a client sends a raw message to the server
	recievePlay: function(client, json) {
		var data = JSON.parse(json);

		client.name = data.playerName || "Anonymous"
		client.type = data.clientType || "Unknown";
		var gameName = data.gameName;
		var gameSession = data.gameSession;

		var game = this.getGame(gameName, gameSession);
		game.addClient(client);
		console.log("player ", client.name, "joined", game.name, game.session, "which now has connections: ", game.clients.length);

		this.sendTo(client, "connected", JSON.stringify({
			gameName: game.name,
			gameSession: game.session,
			constants: constants.shared,
		}));

		if(game.hasStarted()) {
			for(var i = 0; i < game.clients.length; i++) {
				var client = game.clients[i];

				this.sendTo(client, "start", JSON.stringify({
					playerID: client.player.id,
					playerName: client.player.name,
				}));
			}

			this.sendDeltaStateOf(game);

			this.sendPlayersAwaitingAndIgnoringIn(game);
		}
	},

	recieveCommand: function(client, json) {
		this.stopTimersFor(client.game);

		if(!this.runCommandFor(client, json)) { // the command was invalid
			this.sendTo(client, "invalid"); // TODO: send why?
		}

		// TODO: all this should probably happen whenever the state changes via a subscription or something
		this.gameStateChanged(client.game);
	},

	// when a client sends a command it is piped here. Then we will decipher what they sent and run that command (function) on the game that client is playing with the args they passed
	runCommandFor: function(client, json) {
		var data = JSON.parse(json);

		data = serializer.unserialize(data, client.game);

		return client.game.executeCommandFor(client, data);
	},

	gameStateChanged: function(game) {
		this.sendDeltaStateOf(game);

		if(game.isOver()) {
			this.gameOver(game);
		}
		else { // game is still in progress, so tell the players who can send command and who can't now that the game state has changed
			this.sendPlayersAwaitingAndIgnoringIn(game);
		}
	},
});

module.exports = Server;

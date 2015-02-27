// @class Server: The main class that handles incomming conncetions from clients via socket.io and managing the games they play

var Class = require("./structures/class");
var Client = require("./client");

var Server = Class({
	init: function(io) {
		this.io = io;
		this.clients = [];
		this.games = [];
		this.gameClasses = [];
		this.nextGameNumber = 1;

		(function(self) {
			self.io.on('connection', function(socket){
				console.log("new connection!");
				self.clients.push(new Client(socket));

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
			});
		})(this);
	},

	getGame: function(gameName, gameSession) {
		if(!this.games[gameName]) {
			this.gameClasses[gameName] = require("./games/" + gameName);
			this.games[gameName] = {};
		}

		if(gameSession === undefined) {
			gameSession = this.nextGameNumber++;
		}
		if(!this.games[gameName][gameSession]) {
			console.log("creating new game", gameName, gameSession);

			this.games[gameName][gameSession] = new this.gameClasses[gameName](gameName, gameSession);
		}

		return this.games[gameName][gameSession];
	},

	// sends a message to ALL clients. use with care.
	broadcast: function(event, message) {
		//console.log("---> ALL", event, message);
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

	sendStateOf: function(game) {
		this.sendTo(game.clients, "state", JSON.stringify(game.getState()));
	},

	getCurrentClientsFor: function(game) {
		var currentPlayers = game.getCurrentPlayers();
		var currentClients = [];
		for(var i = 0; i < currentPlayers.length; i++) {
			currentClients.push(game.getClientForPlayerID(currentPlayers[i].id));
		}
		return currentClients;
	},

	updatePlayersAwaitingAndIgnoringIn: function(game) {
		var currentClients = this.getCurrentClientsFor(game);

		for(var i = 0; i < game.clients.length; i++) {
			var client = game.clients[i];
			if(currentClients.contains(client)) {
				this.sendTo(client, "awaiting");
			}
			else {
				this.sendTo(client, "ignoring");
			}
		}
	},

	// Functions invoked when a client sends a raw message to the server
	recievePlay: function(client, message) {
		var split = message.split(" ");
		client.name = split[0];
		var gameName = split[1];
		var gameSession = split[2];

		var game = this.getGame(gameName, gameSession);
		console.log("player joined game, now has connections: ", game.clients.length);
		client.game = game;
		game.clients.push(client);

		this.sendTo(client, "connected", JSON.stringify({
			playerName: client.name,
			gameName: game.name,
			gameSession: game.session,
		}));

		if(game.hasEnoughPlayers()) { // TODO: variable player count
			console.log("game starting...");
			game.start();

			for(var i = 0; i < this.clients.length; i++) {
				var client = this.clients[i];

				this.sendTo(client, "start", JSON.stringify({
					playerID: game.getPlayerForClient(client).id,
				}));
			}

			this.sendStateOf(game);

			this.updatePlayersAwaitingAndIgnoringIn(game)
		}
	},

	recieveCommand: function(client, message) {
		// do game logic!!!
		if(this.runCommandFor(client, message)) { // the command was valid
			this.sendStateOf(client.game);

			if(client.game.over) {
				this.sendTo(game.clients, "over");
			}
			else { // game is still in progress, so tell the players who can send command and who can't now that the game state has changed
				this.updatePlayersAwaitingAndIgnoringIn(client.game);
			}
		}
		else {
			this.sendTo(client, "invalid"); // TODO: rename
			this.sendStateOf(client.game);
		}
	},

	// when a client sends a command it is piped here. Then we will decipher what they sent and run that command (function) on the game that client is playing with the args they passed
	runCommandFor: function(client, rawMessage) {
		var game = client.game;
		var parameters = [];
		parameters.push(game.getPlayerForClient(client));

		var split = rawMessage.split(" ");
		var command = split[0];

		for(var i = 1; i < split.length; i++) {
			var arg = split[i];

			if(arg.startsWith("#")) { // then it is an id to an object
				var obj = game.getByID(arg.slice(1));

				if(!obj) {
					console.log("ERROR! no arg for " + arg);
				}

				arg = obj;
			}
			else {
				var toNumber = parseFloat(arg);
				if(toNumber !== NaN) {
					arg = toNumber;
				}
			}
			// else it's a string

			parameters.push(arg);
		}

		if(game[command]) {
			return game[command].apply(game, parameters);
		} else {
			console.log("ERROR! no command: ", command);
			return false;
		}
	},
});

module.exports = Server;

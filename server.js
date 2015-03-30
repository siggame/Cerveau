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

		(function(self) { // stupid losing reference to 'this' during async
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

	/// retrieves (and possibly creates) a new game of gameName in gameSession
	// @param <string> gameName: key identifying the name of the game you want. Should exist in games/
	// @param <string> gameSession (optional): basically a room number. Specifying a gameSession can be used to join other players on purpose. "*" will join you to any open session or a new one.
	// @returns Game: the game of gameName and gameSession. If one does not exists a new instance will be created
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

	/// sends a message or type event to ALL clients, regardless of game. use with care.
	// @param <string> event
	// @param <string> message: probably json
	broadcast: function(event, message) {
		this.io.emit(event, message);
	},

	/// sends to a single/multiple clients the event and message
	// @param <array<Client>> clients to send the message of type event to
	// @param <string> event
	// @param <string> message: probably json
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

	/// sends the current delta state of a game to all that game's the clients. Should be called when the game's state changes
	// @param <Game> game: the game you want to send the current delta state of.
	// TODO: pass in client/player to 'getSerializableDeltaState()' for individual delta states (e.g. Fog of War)
	sendDeltaStateOf: function(game) {
		this.sendTo(game.clients, "delta", JSON.stringify(game.getSerializableDeltaState()));
	},

	/// returns all the clients that the game is awaiting commands from
	// @param <Game> game: game you want the current clients in (from it's current players)
	// @returns <array<Client>>: clients that the game is awaiting commands from
	getCurrentClientsFor: function(game) {
		var currentPlayers = game.getCurrentPlayers();
		var currentClients = [];
		for(var i = 0; i < currentPlayers.length; i++) {
			currentClients.push(currentPlayers[i].client);
		}
		return currentClients;
	},

	/// sends to all the clients in a game if the server is "awaiting" commands or "ignoring" commands from each one
	// @param <Game> game to send "awaiting" or "ignoring" to.
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

	/// called from a client when it times out
	// @param <Client> client that timed out
	clientTimedOut: function(client) {
		client.game.playerTimedOut(client.player);

		this.gameStateChanged(client.game);
	},

	/// stops the timeout timers for all clients in the game. Should be called when the server will be running game logic as to not reduct timeout time when we (the server) are doing calculations
	// @param <Game> game to stop all timers in
	stopTimersFor: function(game) {
		for(var i = 0; i < game.clients.length; i++) {
			game.clients[i].stopTimer();
		}
	},

	/// a game has ended (is over) and the clients need to know, and the gamelog needs to be generated
	// @param <Game> game that is over
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



	//--- Recieve functions. These should be invoked when a client sends something back to the server ---\\

	/// when a client tells the server what it wants to play and as who.
	// @param <Client> client that send the 'play'
	// @param <string> json data about playing. should include 'playerName', 'clientType', 'gameName', and 'gameSession'
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

	/// when a client sends a "command" which should be a game logic command.
	// @param <Client> client that sent the message
	// @param <string> json formatted string that contains the command data
	recieveCommand: function(client, json) {
		this.stopTimersFor(client.game);

		if(!this.runCommandFor(client, json)) { // the command was invalid
			this.sendTo(client, "invalid"); // TODO: send why?
		}

		// TODO: all this should probably happen whenever the state changes via a subscription or something
		this.gameStateChanged(client.game);
	},

	/// when a client sends a command it is piped here. Then we will decipher what they sent and run that command (function) on the game that client is playing with the args they passed
	// @param <Client> client that sent the message
	// @param <string> json formatted data
	// @returns boolean representing if the command was successful.
	runCommandFor: function(client, json) {
		var data = JSON.parse(json);

		data = serializer.unserialize(data, client.game); // handles cycles and game object references in the data

		return client.game.executeCommandFor(client, data);
	},

	/// when the game state changes the clients need to know, and we need to check if that game ended when its state changed
	// @param <Game> game which had a state change.
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

var Class = require("./utilities/class");
var Client = require("./client");
var GameLogger = require("./gameLogger");
var constants = require("./constants");
var serializer = require("./utilities/serializer");
var fs = require('fs');
var net = require('net');

// @class Server: The main class that handles incomming conncetions from clients via a TCP socket and managing the games they play
var Server = Class({
	init: function(host, port, options) {
		this.clients = [];
		this.games = [];
		this.host = host;
		this.port = port;
		this.gameClasses = [];
		this.nextGameNumber = 1;
		this.noTimeout = options.noTimeout === undefined ? false : Boolean(options.noTimeout);
		this.gameLogger = new GameLogger('gamelogs/');

		// create the TCP socket server via node.js's net module
		(function(self) { // stupid losing reference to 'this' during async
			self.netServer = net.createServer(function(socket) {
				console.log("new connection!");
				var client = new Client(socket, self);
				self.clients.push(client);
			});

			self.netServer.listen(self.port, self.host);
		})(this);
	},

	/// should be called by a client when it disconnects
	// TODO: should be part of a subscription system?
	clientDisconnected: function(client) {
		console.log("Client disconnected");
		this.clients.removeElement(client);

		if(client.game) {
			client.game.removeClient(client);
		}
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

	/// sends to a single/multiple clients the event and message
	// @param <array<Client>> clients to send the message of type event to
	// @param <string> event
	// @param <string> message: probably json
	sendTo: function(clients, event, message) {
		if(clients.socket) { // then they just sent a client, not an array of clients.
			clients = [clients];
		}

		for(var i = 0; i < clients.length; i++) {
			clients[i].send(event, message);
		}
	},

	/// sends the current delta state of a game to all that game's the clients. Should be called when the game's state changes
	// @param <Game> game: the game you want to send the current delta state of.
	sendDeltaStateOf: function(game) {
		for(var i = 0; i < game.clients.length; i++) {
			var client = game.clients[i];
			this.sendTo(client, "delta", game.getSerializableDeltaStateFor(client));
		}
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
				if(!this.noTimeout) {
					client.startTimer();
				}
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



	//--- Client functions. These should be invoked when a client sends something back to the server ---\\

	/// when the client sends data via socket connection
	// @param <Client> client that sent the data
	// @param <object> data sent
	clientSentData: function(client, data) {
		if(client.isTicking() && data.sentTime) {
			client.refundTime(Math.max(data.sentTime - client.timer.startTime, 0), {resume: false});
		}

		this['recieve' + data.event.capitalize()].call(this, client, data.data);
	},

	/// when a client tells the server what it wants to play and as who.
	// @param <Client> client that send the 'play'
	// @param <object> data about playing. should include 'playerName', 'clientType', 'gameName', and 'gameSession'
	recievePlay: function(client, data) {
		client.name = data.playerName || "Anonymous"
		client.type = data.clientType || "Unknown";
		var gameName = data.gameName;
		var gameSession = data.gameSession;

		var game = this.getGame(gameName, gameSession);
		game.addClient(client);
		console.log("player ", client.name, "joined", game.name, game.session, "which now has connections: ", game.clients.length);
		
		this.sendTo(client, "playing", {
			gameName: game.name,
			gameSession: game.session,
			constants: constants.shared,
		});

		if(game.hasStarted()) {
			for(var i = 0; i < game.clients.length; i++) {
				var client = game.clients[i];

				this.sendTo(client, "start", {
					playerID: client.player.id,
					playerName: client.player.name,
				});
			}

			this.sendDeltaStateOf(game);

			this.sendPlayersAwaitingAndIgnoringIn(game);
		}
	},

	/// when a client sends a "command" which should be a game logic command.
	// @param <Client> client that sent the message
	// @param <object> command data
	recieveCommand: function(client, data) {
		this.stopTimersFor(client.game);

		if(!this.runCommandFor(client, data)) { // the command was invalid
			this.sendTo(client, "invalid"); // TODO: send why?
		}

		// TODO: all this should probably happen whenever the state changes via a subscription or something
		this.gameStateChanged(client.game);
	},

	/// when a client sends a command it is piped here. Then we will decipher what they sent and run that command (function) on the game that client is playing with the args they passed
	// @param <Client> client that sent the message
	// @param <object> data representing command
	// @returns boolean representing if the command was successful.
	runCommandFor: function(client, data) {
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

var Class = require("./utilities/class");
var GameLogger = require("./gameLogger");
var Server = require("./server");

var constants = require("./constants");
var net = require("net");
var cluster = require("cluster");
var fs = require("fs");
var path = require("path");

function getDirs(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
};

// @class Lobby: The server clients initially connect to before being moved to their game session
var Lobby = Class(Server, {
	init: function(args) {
		Server.init.call(this, args);

		this.name = "Lobby @ " + process.pid;
		this.host = args.host;
		this.port = args.port;
		this.gameNames = [];
		this.gameSessions = {};
		this.gameClasses = [];

		this._threadedGameSessions = {}; // game sessions, regardless of game, currently threaded (running). key is pid
		this._nextGameNumber = 1;

		this._initializeGames();

		this.gameLogger = new GameLogger('gamelogs/', this.gameNames);

		cluster.setupMaster({
			exec: 'worker.js',
		});

		var self = this; // for async reference in passed listener functions below
		cluster.on("exit", function(worker) {
			self._gameSessionExited(self._threadedGameSessions[worker.process.pid]);
		});

		// create the TCP socket server via node.js's net module
		this.netServer = net.createServer(function(socket) {
			self.addSocket(socket);
		});

		this.netServer.listen(this.port, this.host, function() {
			console.log("--- Lobby listening on "+ self.host + ":" + self.port + " ---");
		});
	},

	/// initializes all the games in the games/ folder
	_initializeGames: function() {
		var dirs = getDirs("./games");

		for(var i = 0; i < dirs.length; i++) {
			var dir = dirs[i];
			try {
				var path = "./games/" + dir + "/game";
				this.gameClasses[dir] = require(path);
				this.gameNames.push(dir);
				this.gameSessions[dir] = {};
				console.log(this.name + ": found game '" + dir + "'");
			}
			catch(e) {
				console.log(this.name + ": ERROR:  directory "+ dir + " in games/ is not a valid game.");
			}
		}
	},

	/// retrieves, and possibly creates a new, game of gameName in gameSession which is on a completely different thread
	// @param <string> gameName: key identifying the name of the game you want. Should exist in games/
	// @param <string> sessionID (optional): basically a room number. Specifying a gameSession can be used to join other players on purpose. "*" will join you to any open session or a new one.
	// @returns Game: the game of gameName and gameSession. If one does not exists a new instance will be created
	getRequestedGameSession: function(gameName, sessionID) {
		var gameSession = undefined; // the session we are trying to get

		if(sessionID !== "new") {
			if(sessionID === "*" || sessionID === undefined) { // then they want to join any open game
				gameSession = this._getOpenGameSession(gameName);
			}
			else if(this._isGameSessionOpen(gameName, sessionID)) {
				gameSession = this.gameSessions(gameName, sessionID);
			}
		}

		if(!gameSession) { // then we couldn't find a game session from the requested session, so they get a new one
			sessionID = String(this._nextGameNumber++);

			gameSession = {
				id: sessionID,
				gameName: gameName,
				clients: [],
				numberOfPlayers: this.gameClasses[gameName].numberOfPlayers,
			};

			this.gameSessions[gameName][sessionID] = gameSession;
		}

		return gameSession;
	},

	getGameSessionInfo: function(gameName, sessionID) {
		if(this.gameSessions[gameName]) {
			var gameSession = (this.gameSessions[gameName] !== undefined && this.gameSessions[gameName][sessionID] !== undefined) ? this.gameSessions[gameName][sessionID] : null;
			

			if(gameSession !== null) {
				return {
					gameName: gameSession.gameName,
					sessionID: gameSession.id,
					running: gameSession.running,
					over: gameSession.over,
					winners: gameSession.gamelog.winners,
					losers: gameSession.gamelog.losers,
				};
			}
			else { // check if it was already ran
				var gamelog = this.gameLogger.getLog(gameName, sessionID);
				if(gamelog) {
					return {
						gameName: gamelog.gameName,
						sessionID: gamelog.gameSession,
						over: true,
						winners: gamelog.winners,
						losers: gamelog.losers,
					}
				}
				else {
					return {
						error: "could not find game session with given gameName and sessionID",
						sessionID: sessionID,
					};
				}
			}
		}
		else {
			return {
				error: "game name is not valid",
				gameName: gameName,
			}
		}
	},

	_getOpenGameSession: function(gameName) {
		var gameClass = this.gameClasses[gameName];
		if(gameClass) {
			for(var session in this.gameSessions[gameName]) {
				var gameSession = this.gameSessions[gameName][session];

				if(this._isGameSessionOpen(gameName, session)) {
					return gameSession;
				}
			}
		}
	},

	_isGameSessionOpen: function(gameName, session) {
		var gameClass = this.gameClasses[gameName];
		if(gameClass) {
			var gameSession = this.gameSessions[gameName][session];
			return (gameSession !== undefined && !gameSession.worker && gameSession.clients.length < gameClass.numberOfPlayers);
		}
	},

	/// when a client tells the server what it wants to play and as who.
	// @param <Client> client that send the 'play'
	// @param <object> data about playing. should include 'playerName', 'clientType', 'gameName', and 'gameSession'
	_clientSentPlay: function(client, data) {
		if(!this.gameClasses[data.gameName]) {
			client.send("invalid", data);
			client.disconnect();
			return;
		}

		var gameSession = this.getRequestedGameSession(data.gameName, data.requestedSession);

		client.setInfo({
			name: data.playerName,
			type: data.clientType,
		});

		gameSession.clients.push(client);

		client.send("lobbied", {
			gameName: gameSession.gameName,
			gameSession: gameSession.id,
			constants: constants.shared,
		});

		if(gameSession.clients.length === gameSession.numberOfPlayers) { // then it is ready to start! so spin it off in a neat worker thread
			this._threadGameSession(gameSession);
		}
	},

	/// spins off the game and client logic to a new thread
	_threadGameSession: function(gameSession) {
		// each client sent their info with the 'play' event already, we need to send that to the new thread
		var clientInfos = [];
		for(var i = 0; i < gameSession.clients.length; i++) {
			var client = gameSession.clients[i];
			clientInfos.push({
				name: client.name,
				type: client.type,
			});
		}

		gameSession.worker = cluster.fork({
			workerGameSessionData: JSON.stringify({ // can only pass strings via env variables so serialize them here and the worker threads will deserialize them once running
				gameSession: gameSession.id,
				gameName: gameSession.gameName,
				clientInfos: clientInfos,
				printIO: this.printIO,
				noTimeout: this.noTimeout,
			})
		});

		var self = this;
		gameSession.worker.on("online", function() {
			var clients = gameSession.clients.clone();
			for(var i = 0; i < clients.length; i++) {
				var client = clients[i];
				client.detachFromSocket(); // we are about to send it, so we don't want this client object listening to it, as we no longer care.
				gameSession.worker.send("socket", client.socket);

				self.clients.removeElement(client); // the client is no longer ours, we sent it (via socket) to the worker thread
				gameSession.clients.removeElement(client);
			}
		});

		gameSession.worker.on("message", function(data) {
			if(data.gamelog) {
				self.gameLogger.log(data.gamelog);
			}

			gameSession.gamelog = data.gamelog;
			gameSession.winners = data.winners;
			gameSession.losers = data.losers;
		});

		this._threadedGameSessions[gameSession.worker.process.pid] = gameSession;

		gameSession.running = true;
		gameSession.over = false;
	},

	_gameSessionExited: function(gameSession) {
		console.log(this.name + ": Game Session @", gameSession.worker.process.pid, "exited");

		gameSession.running = false;
		gameSession.over = true;

		delete this._threadedGameSessions[gameSession.worker.process.pid];
	},
});

module.exports = Lobby;

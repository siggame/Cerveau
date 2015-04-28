var Class = require("./utilities/class");
var Server = require("./server");
var serializer = require("./utilities/serializer");

// @class Session: the handler of communications between a game and its clients
var Session = Class(Server, {
	init: function(args) {
		Server.init.call(this, args);

		this.game = new args.gameClass({
			session: args.gameSession,
		});

		this.name = this.game.name + " - " + this.game.session + " @ " + process.pid;
	},

	// @overrides
	addSocket: function(socket, clientInfo) {
		Server.addSocket.call(this, socket, clientInfo);

		if(this.clients.length === this.game.numberOfPlayers) {
			this.start();
		}
	},

	// @overrides
	clientDisconnected: function(client) {
		Server.clientDisconnected.call(this, client);

		client.socket.end();

		this.game.playerDisconnected(client.player);

		this._checkGameState();

		if(this.game.isOver() && this.clients.length === 0) {
			this.end();
		}
	},

	start: function() {
		this.game.start(this.clients);

		for(var i = 0; i < this.clients.length; i++) {
			var client = this.clients[i];

			client.send("start", {
				playerID: client.player.id,
			});
		}

		this._checkGameState();
	},

	end: function() {
		process.exit(0);
	},

	/// when the game state changes the clients need to know, and we need to check if that game ended when its state changed
	_checkGameState: function() {
		if(this.game.hasStateChanged) {
			this.game.hasStateChanged = false;

			// send the delta state to all clients
			for(var i = 0; i < this.clients.length; i++) {
				var client = this.clients[i];
				client.send("delta", this.game.getSerializableDeltaStateFor(client));
			}

			if(this.game.isOver()) {
				this._gameOver();
			}
			else { // game is still in progress, so send requests to players
				this._sendGameRequests();
			}
		}
	},

	/// the game has ended (is over) and the clients need to know, and the gamelog needs to be generated
	_gameOver: function(game) {
		console.log(this.name + ": game is over");

		for(var i = 0; i < this.clients.length; i++) {
			this.clients[i].send("over"); // TODO: send link to gamelog, or something like that.
		}

		process.send({
			gamelog: this.game.generateGamelog(),
		});
	},

	/// sends to all the clients in the game, that the game has requests for information for
	_sendGameRequests: function() {
		var requests = this.game.popRequests();

		for(var i = 0; i < requests.length; i++) {
			var data = requests[i];
			data.player.client.send("request", {
				request: data.request,
				args: data.args,
			});
		}
	},


	//--- Client functions. These should be invoked when a client sends something back to the server ---\\

	_clientSentPlayer: function(client, data) {
		client.setInfo(data);
		client.hasSentPlayerInfo = true;

		
	},

	/// when a client sends a "command" which should be a game logic command.
	// @param <Client> client that sent the message
	// @param <object> response data
	_clientSentResponse: function(client, data) {
		this.stopTimers();

		if(!data.response || !this.game.handleResponse(client.player, data.response, serializer.unserialize(data.data, this.game))) { // then something fucked up
			client.send("invalid", data);
		}

		this._checkGameState();
	},
});

module.exports = Session;

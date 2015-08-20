var Class = require("./utilities/class");
var Server = require("./server");
var serializer = require("./utilities/serializer");

// @class Session: the handler of communications between a game and its clients
var Session = Class(Server, {
	init: function(args) {
		Server.init.call(this, args);

		this._needToSendStart = true;
		this._sentOver = false;

		this.game = new args.gameClass({
			session: args.gameSession,
		});

		this.name = this.game.name + " - " + this.game.session + " @ " + process.pid;
	},

	// @override
	addSocket: function(socket, clientInfo) {
		Server.addSocket.call(this, socket, clientInfo);

		if(this.clients.length === this.game.numberOfPlayers) {
			this.start();
		}
	},

	// @override
	clientTimedOut: function(client) {
		Server.clientTimedOut.call(this, client, "Timed out during gameplay.")
	},

	// @override
	clientDisconnected: function(client, reason) {
		Server.clientDisconnected.call(this, client);

		this.game.playerDisconnected(client.player, reason);

		this._checkGameState();

		if(this.game.isOver() && this.clients.length === 0) {
			this.end();
		}
	},

	start: function() {
		this.game.start(this.clients);

		this._checkGameState();
	},

	end: function() {
		process.exit(0); // "returns" to the lobby that this Session thread ended successfully. All players connected, played, then disconnected. So this session is over
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
		}

		if(this._needToSendStart) {
			this._needToSendStart = false;
			for(var i = 0; i < this.clients.length; i++) {
				var client = this.clients[i];

				client.send("start", {
					playerID: client.player.id,
				});
			}
		}

		if(this.game.isOver() && !this._sentOver) {
			this._gameOver();
		}
		else { // game is still in progress, so send requests to players
			this._sendGameOrders();
		}
	},

	/// the game has ended (is over) and the clients need to know, and the gamelog needs to be generated
	_gameOver: function(game) {
		this._sentOver = true;
		console.log(this.name + ": game is over");

		for(var i = 0; i < this.clients.length; i++) {
			this.clients[i].send("over"); // TODO: send link to gamelog, or something like that.
		}

		process.send({
			gamelog: this.game.generateGamelog(this.clients),
		});
	},

	/// sends to all the clients in the game, that the game has requests for information for
	_sendGameOrders: function() {
		var orders = this.game.popOrders();

		for(var i = 0; i < orders.length; i++) {
			var data = orders[i];
			data.player.client.send("order", {
				order: data.order,
				args: data.args,
			});

			data.player.client.startTicking();
		}
	},

	_checkToIgnoreClient: function(client) {
		if(this.game.isOver() || client.player.lost || client.player.won) {
			client.send("over");
			return true;
		}

		return false;
	},


	//--- Client functions. These should be invoked when a client sends something back to the server ---\\

	_clientSentRun: function(client, run) {
		client.pauseTicking();

		if(this._checkToIgnoreClient(client)) {
			return;
		}

		var ran = this.game.aiRun(client.player, serializer.deserialize(run, this.game))

		this._checkGameState();

		if(ran === undefined) {
			client.send("invalid", run);
		}
		else {
			client.send("ran", serializer.serialize(ran.returned, this.game.gameObjects));
		}
	},

	/// when a client sends a "command" which should be a game logic command.
	// @param <Client> client that sent the message
	// @param <object> response data
	_clientSentFinished: function(client, data) {
		client.pauseTicking();

		if(this._checkToIgnoreClient(client)) {
			return;
		}

		var returnedData = serializer.deserialize(data.returned, this.game);
		var invalid = this.game.aiFinished(client.player, data.finished, returnedData);

		if(invalid) {
			client.send("invalid", invalid);
		}

		this._checkGameState();
	},
});

module.exports = Session;

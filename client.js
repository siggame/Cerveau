var EOT_CHAR = String.fromCharCode(4); // end of transmition character, used to signify the string we sent is the end of a transmition and to parse the json string before it, because some socket APIs for clients will concat what we send
var Class = require("./utilities/class");

// @class Client: the basic implimentation of a connection to the server via a TCP socket
var Client = Class({
	init: function(socket, server, info) {
		this.socket = socket;
		this.socket.setEncoding('utf8');

		this.setInfo(info);

		this.server = server;
		this.timer = {
			timeout: undefined,
			startTime: undefined,
		};

		this.attachToSocket();
	},

	setInfo: function(data) {
		this.name = String(data && data.name ? data.name : "No Name");
		this.type = String(data && data.type ? data.type : "Unknown");
	},

	attachToSocket: function() {
		var self = this;

		var buffer = "";
		var socketListenerOnData = function(str) {
			if(self.server.printIO) {
				console.log(self.server.name + ": from client " + this.name + " <--", str, '\n--');
			}

			buffer += str;
			var split = buffer.split(EOT_CHAR); // split on "end of text" character (basically end of transmition)
			buffer = split.pop(); // the last item will either be "" if the last char was an EOT_CHAR, or a partial data we need to buffer anyways

			for(var i = 0; i < split.length; i++) {
				self.server.clientSentData(self, JSON.parse(split[i]));
			}
		};

		var socketListenerOnClose = function() {
			self.server.clientDisconnected(self);
		};

		var socketListenerOnError = function() {
			console.log("client errored out");
		};

		this.socket
			.on("data", socketListenerOnData)
			.on("close", socketListenerOnClose)
			.on("error", socketListenerOnError)

		this._detachFromSocket = function() {
			self.socket
				.removeListener("data", socketListenerOnData)
				.removeListener("close", socketListenerOnClose)
				.removeListener("error", socketListenerOnError);
		}
	},

	detachFromSocket: function() {
		if(this._detachFromSocket) {
			this._detachFromSocket();
			delete this._detachFromSocket;
			return true;
		}

		return false;
	},

	setGameData: function(game, player) {
		this.game = game;
		this.player = player;
		this.name = player.name;
	},

	disconnect: function() {
		this.disconnected();
	},

	disconnected: function() {
		this.stopTimer();
		this.server.clientDisconnected(this);
		this.socket.destroy();
	},

	_sendRaw: function(str) {
		if(this.server.printIO) {
			console.log(this.server.name + ": to client " + this.name + " -->", str, "\n---");
		}
		this.socket.write(str);
	},

	/// sends the message of type event to this client.
	// @param event string of the event
	// @param data (optional) object to send about the event being sent
	send: function(event, data) {
		this._sendRaw(
			JSON.stringify({
				event: event,
				data: data,
			})
			+ EOT_CHAR // end of text
		);
	},



	/////////////////////////////////////////////////////////
	// Timeouts. Timer should be started/paused by Session //
	/////////////////////////////////////////////////////////

	isTicking: function() {
		return this.timer.timeout !== undefined;
	},

	/// starts the timeout timer counting down from how much time this client's player has left. Should be called when the client is being timed for making commands.
	startTicking: function() {
		if(this.server.noTimeout) {
			return false;
		}

		this.timer.startTime = process.hrtime();

		var self = this;
		this.timer.timeout = setTimeout(function() {
			self._timedOut();
		}, Math.ceil(this.player.timeRemaining / 1e6)); // ns to ms
	},

	/// pauses the timeout timer. This should be done any time we don't expect the client to be computing something.
	pauseTicking: function() {
		if(this.isTicking()) {
			var timeDiff = process.hrtime(this.timer.startTime);

			this.timer.timeout = undefined;
			this.timer.startTime = undefined;

			this.player.timeRemaining -= (timeDiff[0] * 1e9 + timeDiff[1]);
		}
	},

	/// client calls this when it runs out of time. Probably because it infinte looped, broke, or is just very slow.
	_timedOut: function() {
		this.pauseTicking();
		console.log(this.server.name + ": client", this.name, "timed out");
		this.server.clientTimedOut(this);
	},
});

module.exports = Client;
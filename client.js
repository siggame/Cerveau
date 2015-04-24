var EOT_CHAR = String.fromCharCode(4);
var Class = require("./utilities/class");

// @class Client: the basic implimentation of a connection to the server via a TCP socket
var Client = Class({
	init: function(socket, server) {
		this.socket = socket;
		this.socket.setEncoding('utf8');

		this.server = server;
		this.timer = {
			timeRemaining: 10000,
			timeout: undefined,
			startTime: undefined,
		};

		(function(self) {
			var buffer = "";
			self.socket.on("data", function(str) {
				buffer += str;
				var split = buffer.split(EOT_CHAR); // split on "end of text" character (basically end of transmition)

				buffer = split.pop(); // the last item will either be "" if the last char was an EOT_CHAR, or a partial data we need to buffer anyways

				for(var i = 0; i < split.length; i++) {
					var json = split[i];
					self.server.clientSentData(self, json && JSON.parse(json));
				}
			});

			self.socket.on("close", function() {
				self.disconnected();
			});

			self.socket.on("error", function() {
				console.log("client errored out, disconnecting...");
				self.disconnected();
			});
		})(this);
	},

	setPlayer: function(player) {
		this.player = player;
	},

	disconnected: function() {
		this.stopTimer();
		this.server.clientDisconnected(this);
		this.socket.destroy();
	},

	/// sends the message of type event to this client.
	send: function(event, data) {
		this.socket.write(
			JSON.stringify({
				event: event,
				data: data,
			})
			+ EOT_CHAR // end of text
		);
	},

	isTicking: function() {
		return Boolean(this.timer.startTime);
	},

	refundTime: function(ms, options) {
		this.stopTimer();

		this.player.timeRemaining += ms;

		if(!options || !options.resume) {
			this.startTimer();
		}
	},

	/// starts the timeout timer counting down from how much time this client's player has left. Should be called when the client is being timed for making commands.
	startTimer: function() {
		this.timer.timeRemaining = Math.max(this.player.timeRemaining, 0);

		this.timer.startTime = (new Date()).getTime();
		(function(self) {
			self.timer.timeout = setTimeout(function() {
				self.timedOut();
			}, self.timer.timeRemaining);
		})(this);
	},

	/// stops (pauses) the timeout timer. This should be done any time we don't expect the client to be computing something.
	stopTimer: function() {
		if(this.isTicking()) {
			var endTime = (new Date()).getTime();

			clearTimeout(this.timer.timeout);
			this.player.timeRemaining -= Math.max(endTime - this.timer.startTime, 0);
			this.startTime = undefined;
		}
	},

	/// client calls this when it runs out of time. Probably because it infinte looped, broke, or is just very slow.
	timedOut: function() {
		this.stopTimer();
		console.log("client", this.name, "timed out");
		this.server.clientTimedOut(this);
	},
});

module.exports = Client;
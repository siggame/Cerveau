// @class Client: the basic implimentation of a connection to the server in socket.io

var Class = require("./utilities/class");

var Client = Class({
	init: function(socket, server) {
		this.socket = socket;
		this.server = server;
		this.timer = {
			timeout: undefined,
			start: undefined,
			ticking: false,
		};
	},

	/// sends the message of type event to this client.
	send: function(event, message) {
		this.socket.emit(event, message);
	},

	/// starts the timeout timer counting down from how much time this client's player has left. Should be called when the client is being timed for making commands.
	startTimer: function() {
		this.timer.start = (new Date()).getTime();
		this.timer.ticking = true;
		(function(self) {
			self.timer.timeout = setTimeout(function() {
				self.timedOut();
			}, self.player.timeRemaining);
		})(this);
	},

	/// stops (pauses) the timeout timer. This should be done any time we don't expect the client to be computing something.
	stopTimer: function() {
		if(this.timer.ticking) {
			var endTime = (new Date()).getTime();

			clearTimeout(this.timer.timeout);
			this.player.timeRemaining -= endTime - this.timer.start;
			this.ticking = false;
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
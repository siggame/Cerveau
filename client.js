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

	send: function(event, message) {
		this.socket.emit(event, message);
	},

	startTimer: function() {
		this.timer.start = (new Date()).getTime();
		this.timer.ticking = true;
		(function(self) {
			self.timer.timeout = setTimeout(function() {
				self.timedOut();
			}, self.player.timeRemaining);
		})(this);
	},

	stopTimer: function() {
		if(this.timer.ticking) {
			var endTime = (new Date()).getTime();

			clearTimeout(this.timer.timeout);
			this.player.timeRemaining -= endTime - this.timer.start;
			this.ticking = false;
		}
	},

	timedOut: function() {
		this.stopTimer();
		console.log("client", client.name, "timed out");
		this.server.clientTimedOut(this);
	},
});

module.exports = Client;
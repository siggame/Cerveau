// @class Client: the basic implimentation of a connection to the server in socket.io

var Class = require("./utilities/class");

var Client = Class({
	init: function(socket) {
		this.socket = socket;
	},

	send: function(event, message) {
		this.socket.emit(event, message);
	},
});

module.exports = Client;
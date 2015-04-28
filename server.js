var Class = require("./utilities/class");
var Client = require("./client");
var GameLogger = require("./gameLogger");

var constants = require("./constants");
var serializer = require("./utilities/serializer");
var net = require('net');

// @class Server: a base class that handles clients
var Server = Class({
	init: function(options) {
		this.clients = [];

		this.noTimeout = Boolean(options.noTimeout);
		this.printIO = Boolean(options.printIO);
		this.name = options.name || "Server";
	},

	addSocket: function(socket, clientInfo) {
		console.log(this.name + ": received new connection!");
		var client = new Client(socket, this, clientInfo);
		this.clients.push(client);

		return client;
	},

	/// stops the timeout timers for all clients in the game. Should be called when the server will be running game logic as to not reduct timeout time when we (the server) are doing calculations
	stopTimers: function() {
		for(var i = 0; i < this.clients.length; i++) {
			this.clients[i].stopTimer();
		}
	},


	//--- Client functions. These should be invoked when a client sends something back to the server ---\\

	/// when the client sends data via socket connection
	// @param <Client> client that sent the data
	// @param <object> data sent
	clientSentData: function(client, data) {
		if(client.isTicking() && data.sentTime) {
			client.refundTime(Math.max(data.sentTime - client.timer.startTime, 0), {resume: false});
		}

		var callback = this['_clientSent' + data.event.capitalize()]; // should be in the inherited class

		if(callback) {
			callback.call(this, client, data.data);
		}
		else {
			console.error(this.name = ": Error - not callback for:", data.event);
		}
	},

	clientDisconnected: function(client) {
		console.log(this.name + ": Client disconnected");

		this.clients.removeElement(client);

		return client;
	},

	/// called from a client when it times out
	// @param <Client> client that timed out
	clientTimedOut: function(client) {
		console.log(this.name + ": Client timed out");

		this.clientDisconnected(client);
	},
});

module.exports = Server;

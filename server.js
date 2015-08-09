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

	/// when the client sends data via socket connection, invoked by Clients
	// @param <Client> client that sent the data
	// @param <object> data sent
	clientSentData: function(client, data) {
		if(data.event) {
			var callback = this['_clientSent' + data.event.upcaseFirst()]; // should be in the inherited class

			if(callback) {
				callback.call(this, client, data.data);
			}
			else {
				console.error(this.name = ": Error - no callback for:", data.event);
			}
		}
		else {
			console.error(this.name + " Error - client '" + client.name + "' sent data with no event.");
			client.send("invalid", "did not send event");
		}
	},

	clientDisconnected: function(client, reason) {
		console.log(this.name + ": Client " + client.name + " disconnected");

		this.clients.removeElement(client);

		return client;
	},

	/// called from a client when it times out
	// @param <Client> client that timed out
	clientTimedOut: function(client, reason) {
		console.log(this.name + ": Client " + client.name + " timed out");

		this.clientDisconnected(client, reason);
	},
});

module.exports = Server;

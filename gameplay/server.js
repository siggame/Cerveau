var Class = require(__basedir + "/utilities/class");
var GameLogger = require("./gameLogger");
var clientClasses = require("./clients");

var extend = require("extend");
var errors = require("./errors");
var constants = require("./constants");
var serializer = require("./serializer");
var log = require("./log");

/**
 * @abstract
 * @class Server - a base class that handles clients. It does not automatically listen for clients, just handles sockets added to it.
 */
var Server = Class({
    init: function(options) {
        this.clients = [];

        this.timeout = options.timeout || false;
        this.printTCP = Boolean(options.printTCP);
        this.silent = Boolean(options.silent);
        this.logging = Boolean(options.log);
        this.name = options.name || "Server";

        this._initArgs = extend({}, options);

        process._gameplayServer = this; // there should only be one per thread, so we hack it in here
    },

    /**
     * Adds a client to this server, after its been created
     *
     * @param {net.Socket|ws.Client} socket - socket connecting
     * @param {string} connectionType - "TCP" or "WS"
     * @param {Object} [info] - data about the connecting client
     * @returns {Client} newly created client for the passed in socket
     */
    addSocket: function(socket, connectionType, info) {
        info = info || {};
        var clientClass = clientClasses[connectionType];
        var client = new clientClass(socket, this, info);
        this.clients.push(client);

        return client;
    },

    /**
     * Gets the number of playing of clients (not spectating)
     *
     * @param {Array.<Client>} [clients] - clients to check from that are playing. defautls to this.clients
     * @returns {number} Number of playing clients currently connected that are/want to play (not spectate)
     */
    getClientsPlaying: function(clients) {
        clients = clients || this.clients;
        var playingClients = [];
        for(var i = 0; i < clients.length; i++) {
            var client = clients[i];
            if(client.isPlaying()) {
                playingClients.push(client);
            }
        }
        return playingClients;
    },

    /**
     * When the client sends data via socket connection, invoked by Clients.
     *
     * @param {Client} client - client that sent the data. This SHOULD be an event to be handled by the inheriting Server Class
     * @param {object} data - data sent from client
     */
    clientSentData: function(client, data) {
        if(data && data.event) {
            var callback = this['_clientSent' + data.event.upcaseFirst()]; // should be in the inherited class

            if(callback) {
                callback.call(this, client, data.data);
            }
            else {
                client.send("fatal", new errors.EventDataError("Server cannot handle event '" + data.event + "'."));
            }
        }
        else {
            client.send("fatal", new errors.EventDataError("Did not send event."));
        }
    },

    /**
     * Called from a Client when it's socket disconnects
     *
     * @param {Client} client - the client that disconnected.
     * @param {string} [reason] - human readable string why it disconnected
     * @returns {Client} the same client that disconnected
     */
    clientDisconnected: function(client, reason) {
        this.clients.removeElement(client);

        return client;
    },

    /**
     * Called from a client when it times out
     *
     * @param {Client} client - the client that timed out
     * @param {string} [reason] - human readable string why the client timed out (probably just contains how long it waited before timing out).
     */
    clientTimedOut: function(client, reason) {
        this.clientDisconnected(client, reason);
    },
});

module.exports = Server;

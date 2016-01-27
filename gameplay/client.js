var Class = require(__basedir + "/utilities/class");
var log = require("./log");

var DEFAULT_STR = "Unknown";

/*
 * @class
 * @classdesc the basic implimentation of a connection to the server via some io. Should be inheritired and implimented with that IO. This is just a base class.
 * @interface
 */
var Client = Class({
    init: function(socket, server, info) {
        this.socket = socket;

        this.name = DEFAULT_STR;
        this.type = DEFAULT_STR;
        this.playerIndex = undefined;
        this.gameSession = undefined;
        this.spectating = false;

        this.setInfo(info);

        this.server = server;
        this.timer = {
            timeout: undefined,
            startTime: undefined,
        };

        this._listening = false;
        this._listeners = {};
        // we need to wrap all the listener functions in closures to not lose reference to 'this', which is this instance of a Client
        var self = this;
        self._listeners[self._onDataEventName] = function onSocketData(data) {
            self._onSocketData(data);
        };
        self._listeners[self._onCloseEventName] = function onSocketClose(data) {
            self._onSocketClose(data);
        };
        self._listeners[self._onErrorEventName] = function onSocketError(data) {
            self._onSocketError(data);
        };

        this._listenToSocket();
    },

    _onDataEventName: "data",
    _onCloseEventName: "close",
    _onErrorEventName: "error",

    /**
     * Sets up the clients name and type
     *
     * @param {Object} should contain this client's 'name' and 'type'
     */
    setInfo: function(data) {
        data = data || {};
        for(var key in data) {
            if(data.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    },

    /**
     * Sets up the listener functions to listen to the socket this client should have data streaming from.
     */
    _listenToSocket: function() {
        for(var key in this._listeners) {
            if(this._listeners.hasOwnProperty(key)) {
                this.socket.on(key, this._listeners[key]);
            }
        }

        this._listening = true;
    },

    /**
     * called when the client sends some data. the specific super class should inherit and do stuff to this
     *
     * @param {string} data - what the client send via the socket event listener
     */
    _onSocketData: function(data) {
        if(this.server.printTCP) {
            log("< From client " + this.name + " <--", data, '\n---');
        }

        // super classes should override and do stuff with data...
    },

    /**
     * called when the client closes (disconnects)
     */
    _onSocketClose: function() {
        this.server.clientDisconnected(this);
    },

    /**
     * called when the client disconnects unexpectidly
     */
    _onSocketError: function() {
        this.server.clientDisconnected(this);
    },

    /**
     * detaches the server from it's socket (removes EventListeners)
     *
     * @returns {boolean} representing if the detachment was successful
     */
    stopListeningToSocket: function() {
        if(this._listening) {
            for(var key in this._listeners) {
                if(this._listeners.hasOwnProperty(key)) {
                    this.socket.removeListener(key, this._listeners[key]);
                }
            }

            this._listening = false;
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Sets the data related to the game this client is connected to play
     *
     * @param {BaseGame} the game this client has a player playing in
     * @param {Player} the player this ai controls
     */
    setGameData: function(game, player) {
        this.game = game;
        this.player = player;
        this.name = player.name;
    },

    /**
     * Disconnects from the socket
     */
    disconnect: function() {
        this.disconnected();
    },

    /**
     * Called when disconnected from the remote client this Client represents
     */
    disconnected: function() {
        this.pauseTicking();
        this.stopListeningToSocket();
        this.server.clientDisconnected(this);
    },

    /**
     * Sends a the raw string to the remote client this class represents. Intended to be overridden to actually send through client...
     *
     * @param {string} the raw string to send. Should be EOT_CHAR terminated.
     */
    _sendRaw: function(str) {
        if(this.server.printTCP) {
            log("> to client " + this.name + " -->", str, "\n---");
        }
    },

    /**
     * Sends the message of type event to this client as a json string EOT_CHAR terminated.
     *
     * @param {string} event name
     * @param {Object} (optional) object to send about the event being sent
     */
    send: function(event, data) {
        this._sendRaw(JSON.stringify({
            event: event,
            data: data,
        }));
    },

    /**
     * Check if the client is playing (on wants to play) on whatever server it's connected to.
     *
     * @returns {boolean} if the player is not a spectator
     */
    isPlaying: function() {
        return !this.spectating;
    },


    /**
     * returns the raw net.Socket used by this client, probably for thread passing. Use with care
     *
     * @returns {net.Socket} the socket
     */
     getNetSocket: function() {
        return this.socket;
     },



    /////////////////////////////////////////////////////////
    // Timeouts. Timer should be started/paused by Session //
    /////////////////////////////////////////////////////////

    /**
     * Checks if this client's timer is ticking (we are awaiting them to finish an order)
     *
     * @returns {boolean} true if ticking, false otherwise
     */
    isTicking: function() {
        return (this.timer.timeout !== undefined);
    },

    /**
     * Starts the timeout timer counting down from how much time this client's player has left. Should be called when the client is being timed for orders.
     */
    startTicking: function() {
        if(!this.server.timeout) { // server is not going to timeout clients
            return false;
        }

        if(this.isTicking()) {
            return true;
        }

        this.timer.startTime = process.hrtime();

        var self = this;
        this.timer.timeout = setTimeout(function() {
            self._timedOut();
        }, Math.ceil(this.player.timeRemaining / 1e6)); // ns to ms
    },

    /**
     * Pauses the timeout timer. This should be done any time we don't expect the client to be computing something, like when they are not working on an order, or we are running game logic.
     */
    pauseTicking: function() {
        if(this.isTicking()) {
            var timeDiff = process.hrtime(this.timer.startTime);

            clearTimeout(this.timer.timeout);
            this.timer.timeout = undefined;
            this.timer.startTime = undefined;

            this.player.timeRemaining -= (timeDiff[0] * 1e9 + timeDiff[1]);
        }
    },

    /**
     * called when this Client runs out of time om it's timer. Probably because it infinte looped, broke, or is just very slow.
     */
    _timedOut: function() {
        this.pauseTicking();
        this.server.clientTimedOut(this);
        this.disconnect();
    },
});

module.exports = Client;

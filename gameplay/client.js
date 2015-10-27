var EOT_CHAR = String.fromCharCode(4); // end of transmition character, used to signify the string we sent is the end of a transmition and to parse the json string before it, because some socket APIs for clients will concat what we send
var Class = require(__basedir + "/utilities/class");
var log = require("./log");

/*
 * @class Client - the basic implimentation of a connection to the server via a TCP socket
 */
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

        this._attached = false;
        this.attachToSocket();
    },

    /**
     * Sets up the clients name and type
     *
     * @param {Object} should contain this client's 'name' and 'type'
     */
    setInfo: function(data) {
        data = data || {};
        this.name = String(data.hasOwnProperty("name") ? data.name : "No Name");
        this.type = String(data.hasOwnProperty("type") ? data.type : "Unknown");
        this.gameSession = data.gameSession; // when in lobby
        this.spectating = Boolean(data.spectating);
    },

    /**
     * Sets up the listener functions to listen to the socket this client should have data streaming from.
     */
    attachToSocket: function() {
        var self = this;

        var buffer = "";
        var socketListenerOnData = function(str) {
            if(self.server.printIO) {
                log("< From client " + this.name + " <--", str, '\n--');
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
            if(this._attached) {
                self.server.clientDisconnected(self);
            }
        };

        this.socket
            .on("data", socketListenerOnData)
            .on("close", socketListenerOnClose)
            .on("error", socketListenerOnError);

        this._attached = true;

        this._detachFromSocket = function() {
            self.socket
                .removeListener("data", socketListenerOnData)
                .removeListener("close", socketListenerOnClose)
                .removeListener("error", socketListenerOnError);
        }
    },

    /**
     * detaches the server from it's socket (removes EventListeners)
     *
     * @returns {boolean} representing if the detachment was successful
     */
    detachFromSocket: function() {
        this._attached = false;

        if(this._detachFromSocket) {
            this._detachFromSocket();
            delete this._detachFromSocket;
            return true;
        }

        return false;
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
        this.server.clientDisconnected(this);
        this.socket.destroy();
    },

    /**
     * Sends a the raw string to the remote client this class represents
     *
     * @param {string} the raw string to send. Should be EOT_CHAR terminated.
     */
    _sendRaw: function(str) {
        if(this.server.printIO) {
            log("> to client " + this.name + " -->", str, "\n---");
        }
        this.socket.write(str);
    },

    /**
     * Sends the message of type event to this client as a json string EOT_CHAR terminated.
     *
     * @param {string} event name
     * @param {Object} (optional) object to send about the event being sent
     */
    send: function(event, data) {
        this._sendRaw(
            JSON.stringify({
                event: event,
                data: data,
            })
            + EOT_CHAR // end of text
        );
    },

    /**
     * Check if the client is playing (on wants to play) on whatever server it's connected to.
     *
     * @returns {boolean} if the player is not a spectator
     */
    isPlaying: function() {
        return !this.spectating;
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
        if(this.server.noTimeout) {
            return false;
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
        log("Client", this.name, "timed out");
        this.server.clientTimedOut(this);
        this.disconnect();
    },
});

module.exports = Client;
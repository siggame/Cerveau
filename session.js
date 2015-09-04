var Class = require("./utilities/class");
var Server = require("./server");
var serializer = require("./utilities/serializer");

/**
 * @class Session: the server that handles of communications between a game and its clients, on a seperate thread than the lobby.
 */
var Session = Class(Server, {
    init: function(args) {
        Server.init.call(this, args);

        this._needToSendStart = true;
        this._sentOver = false;

        this.game = new args.gameClass({
            session: args.gameSession,
        });

        this.name = this.game.name + " - " + this.game.session + " @ " + process.pid;
    },

    /**
     * Overrides from the base Server class to start the game once all Clients have been constructed
     *
     * @override
     */
    addSocket: function(socket, clientInfo) {
        Server.addSocket.call(this, socket, clientInfo);

        if(this.clients.length === this.game.numberOfPlayers) {
            this.start();
        }
    },

    /**
     * Overridden to give a reason why it timed out (or more accurately, when)
     *
     * @override
     */
    clientTimedOut: function(client) {
        Server.clientTimedOut.call(this, client, "Timed out during gameplay.")
    },

    /**
     * Overridden so that when a client disconnects we can check if the game needs to end.
     * 
     * @override
     */
    clientDisconnected: function(client, reason) {
        Server.clientDisconnected.call(this, client);

        this.game.playerDisconnected(client.player, reason);

        this._checkGameState();

        if(this.game.isOver() && this.clients.length === 0) {
            this.end();
        }
    },

    /**
     * Starts the game in this session
     */
    start: function() {
        this.game.start(this.clients);

        this._checkGameState();
    },

    /**
     * Called when the game ends, so that this thread "ends"
     */
    end: function() {
        process.exit(0); // "returns" to the lobby that this Session thread ended successfully. All players connected, played, then disconnected. So this session is over
    },

    /**
     * when the game state changes the clients need to know, and we need to check if that game ended when its state changed.
     */
    _checkGameState: function() {
        if(this.game.hasStateChanged) {
            this.game.hasStateChanged = false;

            // send the delta state to all clients
            for(var i = 0; i < this.clients.length; i++) {
                var client = this.clients[i];
                client.send("delta", this.game.getSerializableDeltaStateFor(client));
            }
        }

        if(this._needToSendStart) {
            this._needToSendStart = false;
            for(var i = 0; i < this.clients.length; i++) {
                var client = this.clients[i];

                client.send("start", {
                    playerID: client.player.id,
                });
            }
        }

        if(this.game.isOver() && !this._sentOver) {
            this._gameOver();
        }
        else { // game is still in progress, so send requests to players
            this._sendGameOrders();
        }
    },

    /**
     * Called when the game has ended (is over) and the clients need to know, and the gamelog needs to be generated
     */
    _gameOver: function(game) {
        this._sentOver = true;
        console.log(this.name + ": game is over");

        for(var i = 0; i < this.clients.length; i++) {
            this.clients[i].send("over"); // TODO: send link to gamelog, or something like that.
        }

        process.send({
            gamelog: this.game.generateGamelog(this.clients),
        });
    },

    /**
     * Sends to all the clients in the game, that the game has orders they need to execute, depleating the orders stack
     */
    _sendGameOrders: function() {
        var orders = this.game.popOrders();

        for(var i = 0; i < orders.length; i++) {
            var data = orders[i];
            data.player.client.send("order", {
                order: data.order,
                args: data.args,
            });

            data.player.client.startTicking();
        }
    },

    /**
     * Checks if the client should be ignored because it is in a game ending condition
     *
     * @param {Client} client to check if it should be ignored
     * @returns {boolean} true if the client should be ignored, false otherwise
     */
    _checkToIgnoreClient: function(client) {
        if(this.game.isOver() || client.player.lost || client.player.won) {
            client.send("over");
            return true;
        }

        return false;
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /// Client functions. These should be invoked when a client sends something back to the server //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * A client sent a 'run' command, which is a request for the game to run game logic
     *
     * @param {Client} the client that sent this run event
     * @param {Object} run data
     */
    _clientSentRun: function(client, run) {
        client.pauseTicking();

        if(this._checkToIgnoreClient(client)) {
            return; // because they can't run anything right now
        }

        var ran = this.game.aiRun(client.player, run);

        this._checkGameState();

        if(ran === undefined) {
            client.send("invalid", run);
        }
        else {
            client.send("ran", serializer.serialize(ran.returned, this.game));
        }
    },

    /**
     * A client sent a 'finished' command, which is what happens when it finished an order
     *
     * @param {Client} the client that sent this finished event
     * @param {Object} finished data
     */
    _clientSentFinished: function(client, data) {
        client.pauseTicking();

        if(this._checkToIgnoreClient(client)) {
            return;
        }

        var invalid = this.game.aiFinished(client.player, data.finished, data.returned);

        if(invalid) {
            client.send("invalid", invalid);
        }

        this._checkGameState();
    },
});

module.exports = Session;

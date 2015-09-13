var serializer = require("./serializer");
var errors = require("./errors");
var Class = require(__basedir + "/utilities/class");
var Server = require("./server");

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

        if(this.getClientsPlaying().length === this.game.numberOfPlayers) {
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
        this.game.start(this.getClientsPlaying()); // note: the game only knows about clients playing, the session will care about spectators sending them deltas a such, so the game never needs to know of their existance

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
                    playerID: client.player && client.player.id,
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
    _gameOver: function() {
        this._sentOver = true;
        console.log(this.name + ": Game is over.");

        for(var i = 0; i < this.clients.length; i++) {
            this.clients[i].send("over"); // TODO: send link to gamelog, or something like that.
        }

        process.send({
            gamelog: this.game.generateGamelog(),
        });
    },

    /**
     * Sends to all the clients in the game, that the game has orders they need to execute, depleating the orders stack
     */
    _sendGameOrders: function() {
        var orders = this.game.popOrders();

        for(var i = 0; i < orders.length; i++) {
            var order = orders[i];
            order.player.client.send("order", {
                name: order.name,
                index: order.index,
                args: order.args,
            });

            order.player.client.startTicking();
        }
    },

    /**
     * Checks if the client should be ignored because it is in a game ending condition
     *
     * @param {Client} client - client to check if it should be ignored
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
     * @param {Client} client - the client that sent this run event
     * @param {Object} run - data about what they want the game server to run
     */
    _clientSentRun: function(client, run) {
        client.pauseTicking();

        if(this._checkToIgnoreClient(client)) {
            return; // because they can't run anything right now
        }

        var self = this;
        this.game.aiRun(client.player, run) // this is a Promise, the game server is promising that eventually it will run the logic, we do this because the game server may need to get info asyncronously (such as from other AIs) before it can resolve this run command
            .then(function(returned) {
                self._checkGameState();

                client.send("ran", serializer.serialize(returned, self.game));
            })
            .catch(function(error) {
                if(!Class.isInstance(error, errors.CerveauError)) {
                    throw error;
                }
                client.send("invalid", error);
            });
    },

    /**
     * A client sent a 'finished' command, which is what happens when it finished an order
     *
     * @param {Client} client - the client that sent this finished event
     * @param {Object} data - finished data
     */
    _clientSentFinished: function(client, data) {
        client.pauseTicking();

        if(this._checkToIgnoreClient(client)) {
            return;
        }

        try {
            this.game.aiFinished(client.player, data.orderIndex, data.returned);
        }
        catch(error)
        {
            if(!Class.isInstance(error, errors.CerveauError)) {
                throw error;
            }
            client.send("invalid", error);
        }

        this._checkGameState();
    },
});

module.exports = Session;

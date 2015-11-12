var serializer = require("./serializer");
var errors = require("./errors");
var Class = require(__basedir + "/utilities/class");
var Server = require("./server");
var constants = require("./constants");
var moment = require('moment');
var fs = require('fs');
var log = require("./log");

/**
 * @class Session: the server that handles of communications between a game and its clients, on a seperate thread than the lobby.
 */
var Session = Class(Server, {
    init: function(args) {
        Server.init.call(this, args);

        this._needToSendStart = true;
        this._sentOver = false;
        this._deltas = []; // A record of all deltas generated and sent, to store in the gamelog

        this.name = args.gameName + " - " + args.gameSession + " @ " + process.pid;
        this.game = new args.gameClass(args.gameSettings);

        this._profiler = args.profiler;
        this._visualizerLink = args.visualizerLink;
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

        if(!this.game.isOver()) {
            log("Client " + client.name + " disconnected unexpectedly.");
            this._updateDeltas("disconnect", {
                player: client.player,
            });
        }

        this.game.playerDisconnected(client.player, reason);

        return client;
    },

    /**
     * Starts the game in this session
     */
    start: function() {
        log("Game is starting.");
        this.game.start(this.getClientsPlaying()); // note: the game only knows about clients playing, the session will care about spectators sending them deltas a such, so the game never needs to know of their existance

        if(this._profiler) {
            this._profiler.startProfiling();
        }

        this._updateDeltas("start");
    },

    /**
     * Called when the game ends, so that this thread "ends"
     */
    end: function() {
        if(this._profiler) {
            var profile = this._profiler.stopProfiling();
            profile.export(function(error, result) {
                fs.writeFileSync('output/profiles/profile-' + this.game.name + '-' + this.game.session + '-' + moment().format("YYYY.MM.DD.HH.mm.ss.SSS") + '.cpuprofile', result);
                profile.delete();
                process.exit(0); // "returns" to the lobby that this Session thread ended successfully. All players connected, played, then disconnected. So this session is over
            });
        }
        else {
            process.exit(0);
        }
    },

    /**
     * when the game state changes the clients need to know, and we need to check if that game ended when its state changed.
     *
     * @param {string} type - the type of delta that occured
     * @param {Object} [data] - any additional data about what caused the delta
     */
    _updateDeltas: function(type, data) {
        var trueDelta = this.game.getTrueDelta();
        var playerDeltas = {};

        if(data && data.player) {
            data.player = serializer.serialize(data.player, this.game); // because so many datas include a player sending them, it's easier to serialize them all here
        }

        var delta = {
            type: type,
            data: data,
            game: trueDelta,
        };

        if(type !== "over" && type !== "disconnect") { // then it's not a gamelog only delta, so tell clients
            for(var i = 0; i < this.clients.length; i++) {
                var client = this.clients[i];
                var deltaToSend = client.player ? this.game.getDeltaFor(client.player) : trueDelta;

                if(client.player && deltaToSend !== trueDelta) { // then this player got a different game state that the "true" one (it was probably obscured), so record that in the gamelog too
                    delta.gameToPlayer = delta.gameToPlayer || {};
                    delta.gameToPlayer[client.player.id] = deltaToSend;
                }

                client.send("delta", deltaToSend);
            }
        }

        this._deltas.push(delta);
        this.game.flushDelta();

        if(this._needToSendStart) {
            this._needToSendStart = false;
            for(var i = 0; i < this.clients.length; i++) {
                var client = this.clients[i];

                client.send("start", {
                    playerID: client.player && client.player.id,
                });
            }
        }

        if(this.game.isOver()) {
            if(!this._sentOver) { // then this is the first time we've seen a delta in which the game was over, so we need to do game over stuff
                this._gameOver();
            }
        }
        else { // game is still in progress, so send requests to players. Note we always do that after sending delta states so they have updated state info
            this._sendGameOrders();
        }
    },

    /**
     * Called when the game has ended (is over) and the clients need to know, and the gamelog needs to be generated
     */
    _gameOver: function() {
        this._sentOver = true;

        var gamelog = this.generateGamelog();
        var overData = {};

        if(this._visualizerLink) {
            var localGamelogLink = encodeURIComponent("http://{0}/gamelog/{1}/{2}/{3}".format(
                this._initArgs.host,
                gamelog.gameName,
                gamelog.gameSession,
                gamelog.epoch
            ));

            overData.message = "---\nYour gamelog is viewable at:\n{0}?log={1}\n---".format(
                this._visualizerLink,
                localGamelogLink
            );
        }

        for(var i = 0; i < this.clients.length; i++) {
            this.clients[i].send("over", overData);
        }

        this._updateDeltas("over");

        var self = this;
        process.send({ gamelog: gamelog }, undefined, function(err) {
            if(err) {
                log.error("Error sending the gamelog from game session thread to master lobby thread...");
                log.error(err);
            }
            else {
                log("Game is over, exiting.");
            }
            self.end();
        });
    },

    /**
     * Sends to all the clients in the game, that the game has orders they need to execute, depleating the orders stack
     */
    _sendGameOrders: function() {
        var orders = this.game.getNewOrders();

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
                var invalid = undefined;
                if(serializer.isObject(returned) && returned.isGameLogicError) {
                    invalid = {
                        message: returned.invalidMessage,
                        data: returned.invalidData
                    };

                    client.send("invalid", invalid);

                    returned = returned.returnValue;
                }

                var serializedReturned = serializer.serialize(returned, self.game);
                self._updateDeltas("ran", {
                    player: client.player,
                    run: run,
                    invalid: invalid,
                    returned: serializedReturned,
                });

                client.send("ran", serializedReturned);
            })
            .catch(function(error) {
                if(!Class.isInstance(error, errors.CerveauError)) { // probably a coding error
                    throw error;
                }
                client.send("fatal", error);
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

        var finished = null;
        try {
            finished = this.game.aiFinished(client.player, data.orderIndex, data.returned);
        }
        catch(error)
        {
            if(!Class.isInstance(error, errors.CerveauError)) {
                throw error;
            }
            client.send("fatal", error);
        }

        this._updateDeltas("finished", {
            player: client.player,
            order: finished,
            returned: data.returned,
        });
    },

    /**
     * Generates the game log from all the events that happened in this game.
     *
     * @returns {Object} the gamelog to store somewhere and somehow (GameLogger handles that)
     */
    generateGamelog: function() {
        var winners = [];
        var losers = [];

        for(var i = 0; i < this.game.players.length; i++) {
            var player = this.game.players[i];

            (player.won ? winners : losers).push({
                index: i,
                id: player.id,
                name: player.name,
            });
        }

        return {
            gameName: this.game.name,
            gameSession: this.game.session,
            deltas: this._deltas,
            constants: constants.shared,
            epoch: moment().valueOf(),
            randomSeed: this._initArgs.gameSettings.randomSeed,
            winners: winners,
            losers: losers,
        };
    },
});

module.exports = Session;

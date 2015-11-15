var utilities = require(__basedir + "/utilities/");
var constants = require("./constants");
var extend = require("extend");
var url = require("url");
var errors = require("./errors");
var Class = utilities.Class;
var GameLogger = require("./gameLogger");
var Server = require("./server");
var Authenticator = require("./authenticator");
var log = require("./log");

var net = require("net");
var cluster = require("cluster");

/**
 * @class Lobby: The server clients initially connect to before being moved to their game session. Basically creates and manages game sessions.
 */
var Lobby = Class(Server, {
    init: function(args) {
        Server.init.call(this, args);

        this.name = "Lobby @ " + process.pid;
        this.host = args.host;
        this.port = args.port;
        this._authenticate = Boolean(args.authenticate); // flag to see if the lobby should authenticate play requests with web server
        this._allowGameSettings = Boolean(args.gameSettings);
        this._profile = Boolean(args.profile);
        this._gameSessions = {};
        this._gameClasses = [];
        this._gameClassesByAlias = {};

        this._authenticator = new Authenticator(this._authenticate);
        this._threadedGameSessions = {}; // game sessions, regardless of game, currently threaded (running). key is pid
        this._nextGameNumber = 1;

        this._initializeGames();

        this.gameLogger = new GameLogger(Object.keys(this._gameClasses), extend({
            arenaMode: Boolean(args.arena),
        }, args));

        cluster.setupMaster({
            exec: __basedir + '/gameplay/worker.js',
        });

        var self = this; // for async reference in passed listener functions below
        cluster.on("exit", function(worker) {
            self._gameSessionExited(self._threadedGameSessions[worker.process.pid]);
        });

        // create the TCP socket server via node.js's net module
        this._netServer = net.createServer(function(socket) {
            self.addSocket(socket);
        });

        this._netServer.listen(this.port, "0.0.0.0", function() {
            log("--- Lobby listening on port " + self.port + " ---");
        });

        this._netServer.on("error", function(err) {
            self._socketError(err);
        });
    },

    /**
     * Initializes all the games in the games/ folder
     */
    _initializeGames: function() {
        var dirs = utilities.getDirs("./games");

        for(var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var path = __basedir + "/games/" + dir + "/game";
            var gameClass = require(path);
            var gameName = gameClass.prototype.name;

            this._gameClasses[gameName] = gameClass;

            this._gameClassesByAlias[gameName.toLowerCase()] = gameClass;
            this._gameClassesByAlias[gameClass.webserverID.toLowerCase()] = gameClass;

            this._gameSessions[gameName] = {};

            log("Found game '" + gameName + "'.");
        }
    },

    /**
     *
     *
     * @param {Error} err - the error the TCP socket threw
     */
    _socketError: function(err) {
        log.error(err.code !== 'EADDRINUSE' ? err : "Lobby cannot listen on port " + this.host + ":" + this.port + " for game connections. Address in use.\nThere's probably another Cerveau server running on this same computer.");

        process.exit(1);
    },

    /**
     * Retrieves, or creates a new, game of gameName in gameSession which is on a completely different thread
     *
     * @param {string} gameName - key identifying the name of the game you want. Should exist in games/
     * @param {string} [sessionID] - basically a room id. Specifying a gameSession can be used to join other players on purpose. "*" will join you to any open session or a new one, and "new" will always give you a brand new room even if there are open ones.
     * @returns {BaseGame} the game of gameName and gameSession. If one does not exists a new instance will be created
     */
    _getOrCreateGameSession: function(gameName, sessionID) {
        var gameSession = undefined; // the session we are trying to get

        if(sessionID !== "new") {
            if(sessionID === "*" || sessionID === undefined) { // then they want to join any open game
                gameSession = this._getOpenGameSession(gameName);

                if(!gameSession) { // then there was no open game session to join, so they get a new session
                    sessionID = "new";
                }
            }
            else if(this._isGameSessionOpen(gameName, sessionID)) {
                gameSession = this._gameSessions[gameName][sessionID];
            }
        }

        if(!gameSession) { // then we couldn't find a game session from the requested session, so they get a new one
            sessionID = String(sessionID === "new" ? this._nextGameNumber++ : sessionID);

            gameSession = {
                id: sessionID,
                gameName: gameName,
                clients: [],
                numberOfPlayers: this._gameClasses[gameName].numberOfPlayers,
                gameSettings: {},
            };

            this._gameSessions[gameName][sessionID] = gameSession;
        }

        return gameSession;
    },

    /**
     * gets the actual name of an alias for a game, e.g. "checkers" -> "Checkers"
     *
     * @param {string} gameAlias - an alias for the game, not case senstive
     * @returns {string|undefined} the actual game name of the aliased game, or undefined if not valid
     */
    getGameNameForAlias: function(gameAlias) {
        var gameClass = this._gameClassesByAlias[gameAlias.toLowerCase()];
        if(gameClass) {
            return gameClass.prototype.name;
        }
    },

    /**
     * Gets the game session info, which is basically all the information about the game running in another thread without bothering the thread itself.
     * 
     * @param {string} gameAlias - an alias of the game
     * @param {string} sessionID - the session for the game you want the info for
     * @returns {Object} all the data about the game session as last we heard from the game thread.
     */
    getGameSessionInfo: function(gameAlias, sessionID) {
        var gameName = this.getGameNameForAlias(gameAlias);

        if(this._gameSessions[gameName]) {
            var gameSession = null;
            if(this._gameSessions[gameName] !== undefined && this._gameSessions[gameName][sessionID] !== undefined) {
                gameSession = this._gameSessions[gameName][sessionID];
            }

            if(gameSession !== null) {
                return {
                    gameName: gameSession.gameName,
                    sessionID: gameSession.id,
                    running: gameSession.running,
                    over: gameSession.over,
                    winners: gameSession.winners,
                    losers: gameSession.losers,
                };
            }

            return {
                error: "could not find game session with given gameName and sessionID",
                sessionID: sessionID,
            };
        }
        else {
            return {
                error: "game name is not valid",
                gameName: gameAlias,
            };
        }
    },

    /**
     * Gets the first game session with an opening for the given game name
     *
     * @param {string} the name of the game you want the first open session for
     * @returns {Object|undefined} if there is an open game session of the given game name then that session is returned, otherwiese undefined.
     */
    _getOpenGameSession: function(gameName) {
        var gameClass = this._gameClasses[gameName];
        if(gameClass) {
            var gameSessions = this._gameSessions[gameName];
            for(var session in gameSessions) {
                if(gameSessions.hasOwnProperty(session)) {
                    var gameSession = this._gameSessions[gameName][session];

                    if(this._isGameSessionOpen(gameName, session)) {
                        return gameSession;
                    }
                }
            }
        }
    },

    /**
     * Checks if a game session is open to be joined by another player (client)
     *
     * @param {string} the name of the game to check for
     * @param {string} the if of the session for the game name you want to see if is open
     * @returns {boolean|undefined} if the name of the game is valid then a boolean if that session exists and is open when true, false when that session is closed or does not exist. undefined if that game name or game session is not valid.
     */
    _isGameSessionOpen: function(gameName, sessionID) {
        var gameClass = this._gameClasses[gameName];
        if(gameClass) {
            var gameSession = this._gameSessions[gameName][sessionID];
            if(gameSession) {
                var numberOfPlayers = this.getClientsPlaying(gameSession.clients).length;
                return (gameSession !== undefined && !gameSession.worker && numberOfPlayers < gameClass.numberOfPlayers);
            }
        }
    },

    /**
     * When a client sends the 'play' event, which tells the server what it wants to play and as who.
     *
     * @param {Client} client - the client that send the 'play'
     * @param {Object} data - information about what this client wants to play. should include 'playerName', 'clientType', 'gameName', and 'gameSession'
     */
    _clientSentPlay: function(client, data) {
        var gameAlias = String(data && data.gameName); // clients can send aliases of what they want to play
        var gameName = this.getGameNameForAlias(gameAlias);

        if(!data || !gameName) {
            client.send("fatal", new errors.CerveauError("Game of name '" + gameAlias + "' not found on this server."));
            client.disconnect(); // no need to keep them connected, they want to play something we don't have
            return;
        }

        var self = this;
        this._authenticator.authenticate({
            gameName: gameName,
            username: data.playerName,
            password: data.password,
            success: function() {
                var gameSession = self._getOrCreateGameSession(gameName, data.requestedSession);

                client.setInfo({
                    name: data.playerName,
                    type: data.clientType,
                    spectating: data.spectating,
                    gameSession: gameSession,
                });

                gameSession.clients.push(client);
                if(data.gameSettings && this._allowGameSettings) {
                    try {
                        var settings = url.parse("urlparms?" + data.gameSettings, true).query;
                        for(var key in settings) {
                            if(settings.hasOwnProperty(key) && !gameSession.gameSettings.hasOwnProperty(key)) { // this way if another player wants to set a game setting an earlier player set, the first requested setting is used.
                                var value = settings[key];
                                // sanitize booleans
                                if(value.toLowerCase() ===  "true") {
                                    value = true;
                                }
                                gameSession.gameSettings[key] = value;
                            }
                        }
                    }
                    catch(err) {
                        // their game settings in the form of url parameters are formatted incorrectly
                        // TODO: tell client they can't play now
                    }
                }

                client.send("lobbied", {
                    gameName: gameSession.gameName,
                    gameSession: gameSession.id,
                    constants: constants.shared,
                });

                if(self.getClientsPlaying(gameSession.clients).length === gameSession.numberOfPlayers) { // then it is ready to start! so spin it off in a neat worker thread
                    self._threadGameSession(gameSession);
                }
            },
            failure: function() {
                client.send("fatal", {
                    message: "Unauthorized to play in this lobby with given name/password.",
                    data: {
                        unauthorized: true
                    },
                });
                client.disconnect();
            },
        });
    },

    /**
     * @override
     */
    clientDisconnected: function(client /* ... */) {
        if(client.gameSession) {
            client.gameSession.clients.removeElement(client);
        }

        return Server.clientDisconnected.apply(this, arguments);
    },

    /**
     * Spins off the game and client logic to a new thread. Should be done when this lobby knows enough clients (players) are connected and ready to play.
     *
     * @param {Object} the game session info that you want to spin off to a new thread.
     */
    _threadGameSession: function(gameSession) {
        // each client sent their info with the 'play' event already, we need to send that to the new thread
        var clientInfos = [];
        for(var i = 0; i < gameSession.clients.length; i++) {
            var client = gameSession.clients[i];
            clientInfos.push({
                index: i,
                name: client.name,
                type: client.type,
                spectating: client.spectating,
            });
        }

        var workerGameSessionData = extend({ // can only pass strings via env variables so serialize them here and the worker threads will deserialize them once running
            __basedir: __basedir,
            _mainDebugPort: process._debugPort,
            gameSession: gameSession.id,
            gameName: gameSession.gameName,
            clientInfos: clientInfos,
            profile: this._profile,
        }, this._initArgs);

        workerGameSessionData.gameSettings = gameSession.gameSettings;

        gameSession.worker = cluster.fork({
            workerGameSessionData: JSON.stringify(workerGameSessionData),
        });

        var self = this;
        gameSession.worker.on("online", function() {
            var clients = gameSession.clients.clone();
            for(var i = 0; i < clients.length; i++) {
                var client = clients[i];
                client.detachFromSocket(); // we are about to send it, so we don't want this client object listening to it, as we no longer care.
                gameSession.worker.send("socket", client.socket);

                self.clients.removeElement(client); // the client is no longer ours, we sent it (via socket) to the worker thread
                gameSession.clients.removeElement(client);
            }
        });

        gameSession.worker.on("message", function(data) {
            if(data.gamelog) {
                self.gameLogger.log(data.gamelog);
            }

            gameSession.winners = data.winners;
            gameSession.losers = data.losers;
        });

        this._threadedGameSessions[gameSession.worker.process.pid] = gameSession;

        gameSession.running = true;
        gameSession.over = false;
    },

    /**
     * Called when a worker thread exits. This should only occur when a game ends
     *
     * @param {Object} the gameSession that ended.
     */
    _gameSessionExited: function(gameSession) {
        log("Game Session @", gameSession.worker.process.pid, "exited");

        gameSession.running = false;
        gameSession.over = true;

        delete this._threadedGameSessions[gameSession.worker.process.pid];
    },
});

module.exports = Lobby;

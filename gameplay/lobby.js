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
        this.authenticate = (args.authenticate === true); // flag to see if the lobby should authenticate play requests with web server
        this.noGameSettings = (args.noGameSettings === true);
        this._profile = (args.profile === true);
        this.gameNames = [];
        this.gameSessions = {};
        this.gameClasses = [];

        this._authenticator = new Authenticator(this.authenticate);
        this._threadedGameSessions = {}; // game sessions, regardless of game, currently threaded (running). key is pid
        this._nextGameNumber = 1;

        this._initializeGames();

        this.gameLogger = new GameLogger(this.gameNames);

        cluster.setupMaster({
            exec: __basedir + '/gameplay/worker.js',
        });

        var self = this; // for async reference in passed listener functions below
        cluster.on("exit", function(worker) {
            self._gameSessionExited(self._threadedGameSessions[worker.process.pid]);
        });

        // create the TCP socket server via node.js's net module
        this.netServer = net.createServer(function(socket) {
            self.addSocket(socket);
        });

        this.netServer.listen(this.port, this.host, function() {
            log("--- Lobby listening on "+ self.host + ":" + self.port + " ---");
        });

        this.netServer.on("error", function(err) {
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
            var gameName = dir.upcaseFirst();
            this.gameClasses[gameName] = require(path);
            this.gameNames.push(gameName);
            this.gameSessions[gameName] = {};
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
     * Retrieves, and possibly creates a new, game of gameName in gameSession which is on a completely different thread
     *
     * @param {string} gameName - key identifying the name of the game you want. Should exist in games/
     * @param {string} [sessionID] - basically a room id. Specifying a gameSession can be used to join other players on purpose. "*" will join you to any open session or a new one, and "new" will always give you a brand new room even if there are open ones.
     * @returns {BaseGame} the game of gameName and gameSession. If one does not exists a new instance will be created
     */
    getRequestedGameSession: function(gameName, sessionID) {
        var gameSession = undefined; // the session we are trying to get

        if(sessionID !== "new") {
            if(sessionID === "*" || sessionID === undefined) { // then they want to join any open game
                gameSession = this._getOpenGameSession(gameName);
            }
            else if(this._isGameSessionOpen(gameName, sessionID)) {
                gameSession = this.gameSessions(gameName, sessionID);
            }
        }

        if(!gameSession) { // then we couldn't find a game session from the requested session, so they get a new one
            sessionID = String(this._nextGameNumber++);

            gameSession = {
                id: sessionID,
                gameName: gameName,
                clients: [],
                numberOfPlayers: this.gameClasses[gameName].numberOfPlayers,
                gameSettings: {},
            };

            this.gameSessions[gameName][sessionID] = gameSession;
        }

        return gameSession;
    },

    /**
     * Gets the game session info, which is basically all the information about the game running in another thread without bothering the thread itself.
     * 
     * @param {string} gameName - the name of the game
     * @param {string} sessionID - the session for the game you want the info for
     * @returns {Object} all the data about the game session as last we heard from the game thread.
     */
    getGameSessionInfo: function(gameName, sessionID) {
        if(this.gameSessions[gameName]) {
            var gameSession = (this.gameSessions[gameName] !== undefined && this.gameSessions[gameName][sessionID] !== undefined) ? this.gameSessions[gameName][sessionID] : null;
            

            if(gameSession !== null) {
                return {
                    gameName: gameSession.gameName,
                    sessionID: gameSession.id,
                    running: gameSession.running,
                    over: gameSession.over,
                    winners: gameSession.gamelog.winners,
                    losers: gameSession.gamelog.losers,
                };
            }
            else { // check if it was already ran
                var gamelog = this.gameLogger.getLog(gameName, sessionID);
                if(gamelog) {
                    return {
                        gameName: gamelog.gameName,
                        sessionID: gamelog.gameSession,
                        over: true,
                        winners: gamelog.winners,
                        losers: gamelog.losers,
                    };
                }
                else {
                    return {
                        error: "could not find game session with given gameName and sessionID",
                        sessionID: sessionID,
                    };
                }
            }
        }
        else {
            return {
                error: "game name is not valid",
                gameName: gameName,
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
        var gameClass = this.gameClasses[gameName];
        if(gameClass) {
            for(var session in this.gameSessions[gameName]) {
                var gameSession = this.gameSessions[gameName][session];

                if(this._isGameSessionOpen(gameName, session)) {
                    return gameSession;
                }
            }
        }
    },

    /**
     * Checks if a game session is open to be joined by another player (client)
     *
     * @param {string} the name of the game to check for
     * @param {string} the if of the session for the game name you want to see if is open
     * @returns {boolean|undefined} if the name of the game is valid then a boolean if that session exists and is open when true, false when that session is closed or does not exist. undefined if that game name is not valid.
     */
    _isGameSessionOpen: function(gameName, sessionID) {
        var gameClass = this.gameClasses[gameName];
        if(gameClass) {
            var gameSession = this.gameSessions[gameName][sessionID];
            var numberOfPlayers = this.getClientsPlaying(gameSession.clients).length;
            return (gameSession !== undefined && !gameSession.worker && numberOfPlayers < gameClass.numberOfPlayers);
        }
    },

    /**
     * When a client sends the 'play' event, which tells the server what it wants to play and as who.
     *
     * @param {Client} client - the client that send the 'play'
     * @param {Object} data - information about what this client wants to play. should include 'playerName', 'clientType', 'gameName', and 'gameSession'
     */
    _clientSentPlay: function(client, data) {
        if(!data || !this.gameClasses[data.gameName]) {
            client.send("invalid", new errors.CerveauError("Game of name '" + (data && data.gameName) + "' not found on this server."));
            client.disconnect(); // no need to keep them connected, they want to play something we don't have
            return;
        }

        var self = this;
        this._authenticator.authenticate({
            gameName: data.gameName,
            username: data.playerName,
            password: data.password,
            success: function() {
                var gameSession = self.getRequestedGameSession(data.gameName, data.requestedSession);

                client.setInfo({
                    name: data.playerName,
                    type: data.clientType,
                    spectating: data.spectating,
                });

                gameSession.clients.push(client);
                if(data.gameSettings && !this.noGameSettings) {
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
                client.send("unauthenticated");
                client.disconnect();
            },
        });
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

        gameSession.worker = cluster.fork({
            workerGameSessionData: JSON.stringify(extend({ // can only pass strings via env variables so serialize them here and the worker threads will deserialize them once running
                __basedir: __basedir,
                _mainDebugPort: process._debugPort,
                gameSession: gameSession.id,
                gameSettings: gameSession.gameSettings,
                gameName: gameSession.gameName,
                clientInfos: clientInfos,
                profile: this._profile,
            }, this._initArgs)),
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

            gameSession.gamelog = data.gamelog;
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

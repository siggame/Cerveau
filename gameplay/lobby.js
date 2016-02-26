var utilities = require(__basedir + "/utilities/");
var constants = require("./constants");
var errors = require("./errors");
var Class = utilities.Class;
var GameLogger = require("./gameLogger");
var Server = require("./server");
var Session = require("./session");
var Authenticator = require("./authenticator");
var log = require("./log");

var check = require("syntax-error");
var extend = require("extend");
var ws = require("lark-websocket");
var fs = require("fs");
var url = require("url");
var net = require("net");
var cluster = require("cluster");
var readline = require("readline");

/**
 * @class Lobby: The server clients initially connect to before being moved to their game session. Basically creates and manages game sessions.
 */
var Lobby = Class(Server, {
    init: function(args) {
        Server.init.call(this, args);

        this.name = "Lobby @ " + process.pid;
        this.host = args.host;
        this.port = args.port;
        this.wsPort = args.wsPort;
        this._authenticate = Boolean(args.authenticate); // flag to see if the lobby should authenticate play requests with web server
        this._allowGameSettings = Boolean(args.gameSettings);
        this._profile = Boolean(args.profile);
        this._sessions = {};
        this._gameClasses = {};

        this._authenticator = new Authenticator(this._authenticate);
        this._runningSessions = {}; // indexed by (gameName + id)
        this._nextGameNumber = 1;
        this._isShuttingDown = false;

        this._initializeGames();

        this.gameLogger = new GameLogger(Object.keys(this._gameClasses), extend({
            arenaMode: Boolean(args.arena),
        }, args));

        cluster.setupMaster({
            exec: __basedir + '/gameplay/worker.js',
        });

        var self = this; // for async reference in passed listener functions below
        cluster.on("exit", function(worker) {
            self._sessionOver(worker.session);
        });

        this._listenerServer = {};
        this._initializeListener("TCP", net, this.port);
        this._initializeListener("WS", ws, this.wsPort);

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // ReadLine: listens for CTRL+C to kill off child threads gracefully (letting their games complete)
        rl.setPrompt("");
        rl.on('SIGINT', function() {
            if(!self._isShuttingDown) {
                self._isShuttingDown = true;
                log("Shutting down gracefully...");

                var numCurrentGames = Object.keys(self._runningSessions).length;
                log("{0} game{1} currently running{2}.".format(numCurrentGames, numCurrentGames === 1 ? "" : "s", numCurrentGames === 0 ? ", so we can shut down immediately" : ""));

                var clients = self.clients.clone();
                for(var i = 0; i < clients.length; i++) {
                    var client = clients[i];
                    client.send("fatal", new errors.CerveauError("Sorry, the server is shutting down."));
                    client.disconnect();
                }

                if(numCurrentGames > 0) {
                    log("Waiting for them to exit before shutting down.");
                    log("^C again to force shutdown, which force disconnects clients.")
                }
                else {
                    process.exit(0);
                }
            }
            else {
                log("Force shutting down.");
                process.exit(1);
            }
        });
    },

    /**
     * Creates and initializes a server that uses a listener pattern identical to net.Server
     *
     * @param {string} key - type of server and what type of clients to expect from it
     * @param {Object} module - the required module that has a createServer method
     * @param {number} port - port to listen on for this server
     */
    _initializeListener: function(key, module, port) {
        var self = this;

        var listener = module.createServer(function(socket) {
            self.addSocket(socket, key);
        });

        listener.listen(port, "0.0.0.0", function() {
            log("--- Lobby listening on port {0} for {1} Clients ---".format(port, key));
        });

        listener.on("error", function(err) {
            self._socketError(err);
        });

        this._listenerServer[key] = listener;
    },

    /**
     * Initializes all the games in the games/ folder
     */
    _initializeGames: function() {
        var dirs = utilities.getDirs("./games");

        for(var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var path = __basedir + "/games/" + dir;
            var gameClass = require(path + "/game");
            var gameName = gameClass.prototype.name;

            // hook up all the ways to get index the game class by
            this._gameClasses[gameName] = gameClass;
            this._gameClasses[gameName.toLowerCase()] = gameClass;
            this._gameClasses[gameClass.webserverID.toLowerCase()] = gameClass;

            this._sessions[gameName] = {};

            log("» '" + gameName + "' game found.");

            // check to make sure the game is valid
            var files = fs.readdirSync(path);
            for(var j = 0; j < files.length; j++) {
                var file = files[j];
                if(!file.endsWith(".js")) {
                    continue;
                }

                var filePath = path + "/" + file;
                var src = fs.readFileSync(filePath);

                var err = check(src, file);
                if (err) {
                    log.error("Error in file '{}'' for game '{}':\n{}".format(filePath, gameName, err.annotated));
                    process.exit(1);
                }
            }
        }
    },

    /**
     * listener for when a listener socket (that accepts incoming clients) errors out. This will probably only happen if it tries to listen on port already in use.
     *
     * @param {Error} err - the error the TCP socket threw
     */
    _socketError: function(err) {
        log.error(err.code !== 'EADDRINUSE' ? err : "Lobby cannot listen on port " + this.host + ":" + this.port + " for game connections. Address in use.\nThere's probably another Cerveau server running on this same computer.");

        process.exit(1);
    },


    /**
     * Gets the session for gameAlias and session id, if it exists
     *
     * @param {string} gameAlias - The name alias of the game for this session
     * @param {string} id - the session id of the gameName
     * @returns {Session} the session, if found
     */
    getSession: function(gameAlias, id) {
        if(typeof(gameAlias) === "string" && typeof(id) === "string") {
            return this._sessions[this.getGameNameForAlias(gameAlias)][id]; // this if gameAlias is not valid this will throw and exception
        }
    },

    /**
     * Retrieves, or creates a new, session. For clients when saying what they want to play
     *
     * @param {string} gameName - key identifying the name of the game you want. Should exist in games/
     * @param {string} [id] - basically a room id. Specifying an id can be used to join other players on purpose. "*" will join you to any open session or a new one, and "new" will always give you a brand new room even if there are open ones.
     * @returns {Session} the game of gameName and id. If one does not exists a new instance will be created
     */
    _getOrCreateSession: function(gameName, id) {
        var session = undefined; // the session we are trying to get

        if(id !== "new") {
            if(id === "*" || id === undefined) { // then they want to join any open game
                // try to find an open session
                for(var sessionID in this._sessions[gameName]) {
                    if(this._sessions[gameName].hasOwnProperty(sessionID)) {
                        var otherSession = this._sessions[gameName][sessionID];
                        if(otherSession.isOpen()) {
                            session = otherSession;
                            break;
                        }
                    }
                }

                if(!session) { // then there was no open game session to join, so they get a new session
                    id = "new";
                }
            }
            else {
                session = this.getSession(gameName, id);
            }
        }

        if(session) {
            if(session.isRunning()) {
                id = "new";
                session = undefined;
            }

            if(session.isOver()) {
                delete this._sessions[gameName][id]; // we will create a new session below to replace this one
                session = undefined;
            }
        }

        if(!session) { // then we couldn't find a session from the requested gameName + id, so they get a new one
            if(id === "new" || id === undefined) {
                id = String(this._nextGameNumber++);
            }

            session = new Session(id, this._gameClasses[gameName], this);

            this._sessions[gameName][id] = session;
        }

        return session;
    },

    /**
     * Gets the actual name of an alias for a game, e.g. "checkers" -> "Checkers"
     *
     * @param {string} gameAlias - an alias for the game, not case senstive
     * @returns {string|undefined} the actual game name of the aliased game, or undefined if not valid
     */
    getGameNameForAlias: function(gameAlias) {
        if(gameAlias) {
            var gameClass = this._gameClasses[gameAlias.toLowerCase()];
            if(gameClass) {
                return gameClass.prototype.name;
            }
        }

        throw new Error("String '{}' is no alias for any known games".format(gameAlias));
    },

    /**
     * Gets the game class (constructor) for a given game alias
     *
     * @param {strnig} gameAlias - an alias for the game you want
     * @returns {Class} the game class constructor, if found
     */
    getGameClass: function(gameAlias) {
        return this._gameClasses[this.getGameNameForAlias(gameAlias)];
    },

    /**
     * When a client sends the 'play' event, which tells the server what it wants to play and as who.
     *
     * @param {Client} client - the client that send the 'play'
     * @param {Object} data - information about what this client wants to play. should include 'playerName', 'clientType', 'gameName', and 'gameSession'
     */
    _clientSentPlay: function(client, data) {
        var fatalMessage;
        if(this._isShuttingDown) {
            fatalMessage = "Game server is shutting down and not accepting new clients.";
        }

        var gameAlias = String(data && data.gameName); // clients can send aliases of what they want to play
        var gameName = undefined;
        try {
            gameName = this.getGameNameForAlias(gameAlias);
        }
        catch(err) {
            fatalMessage = "Game of name '" + gameAlias + "' not found on this server.";
        }

        if(data.gameSettings && this._allowGameSettings) {
            try {
                data.gameSettings = url.parse("urlparms?" + data.gameSettings, true).query;
            }
            catch(err) {
                fatalMessage = "Game settings incorrectly formatted. Must be one string in the url parms format.";
            }
        }

        if(fatalMessage) {
            client.send("fatal", new errors.CerveauError(fatalMessage));
            client.disconnect(); // no need to keep them connected, they want to play something we don't have
            return;
        }

        var self = this;
        this._authenticator.authenticate({
            gameName: gameName,
            username: data.playerName,
            password: data.password,
            success: function() {
                var session = self._getOrCreateSession(gameName, data.requestedSession);
                var playerIndex = parseInt(data.playerIndex);

                if(playerIndex && playerIndex < 0 || playerIndex >= session.numberOfPlayers) { // then the index is out of the range
                    playerIndex = undefined;
                }

                if(playerIndex) { // then we need to check to make sure they did not request an already requested player index
                    for(var i = 0; i < session.clients.length; i++) {
                        var existingClient = session.clients[i];
                        if(existingClient.playerIndex === playerIndex) {
                            playerIndex = undefined;
                            break;
                        }
                    }
                }

                client.setInfo({
                    name: data.playerName,
                    playerIndex: isNaN(playerIndex) ? undefined : playerIndex,
                    type: data.clientType,
                    spectating: Boolean(data.spectating),
                });

                session.addClient(client);

                if(data.gameSettings) {
                    session.addGameSettings(data.gameSettings);
                }

                client.send("lobbied", {
                    gameName: gameName,
                    gameSession: session.id,
                    constants: constants.shared,
                });

                if(session.canStart()) {
                    session.start();
                    self._runningSessions[session.gameName + session.id] = session;
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
        if(client.session) {
            client.session.removeClient(client);
        }

        return Server.clientDisconnected.apply(this, arguments);
    },

    /**
     * Called when a session is over. This should only occur when a game ends
     *
     * @param {Session} the session that ended.
     */
    _sessionOver: function(session) {
        delete this._runningSessions[session.gameName + session.id];

        if(this._isShuttingDown && Object.keys(this._runningSessions).length === 0) {
            log("Final game session exited. Shutdown complete.");
            process.exit(0);
        }
    },
});

module.exports = Lobby;

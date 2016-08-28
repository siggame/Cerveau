var log = require("../log");
var Class = require(__basedir + "/utilities/class");
var DeltaMergeable = require("./deltaMergeable");
var DeltaMergeableArray = require("./deltaMergeableArray");
var GameManager = require("./gameManager");
var errors = require("../errors");
var serializer = require("../serializer");
var constants = require("../constants");

/**
 * @abstract
 * @class BaseGame - the base game plugin new games should inherit from.
 */
var BaseGame = Class(DeltaMergeable, {
    init: function(data, instance) {
        if(this._baseGameInitialized) { // semi-shitty way to avoid multiD sub classes, re-initializing BaseGame
            return;
        }

        this.gameManager = new GameManager(this);
        this._baseGameInitialized = true;
        this._delta = {}; // the current delta we are recoding

        if(data.startTime) {
            var num = Number(data.startTime);
            if(!isNaN(num)) {
                this._playerAdditionalTimePerTurn = num * 1e10;
            }
        }

        DeltaMergeable.init.call(this, undefined, undefined, {
            session: data.session,
            name: this._class.prototype.name,
        });

        this._dir = __basedir + "/games/" + this.name.lowercaseFirst() + "/";
        this._instance = instance;
        this._orders = [];
        this._newOrdersToPopIndex = 0;
        this._returnedDataTypeConverter = {};
        this._hasStarted = false;
        this._over = false;
        this._nextGameObjectID = 0;
        this._winners = [];
        this._losers = [];
    },

    // The following variable are static, and no game instances should override these, but their class prototypes can
    name: "Base Game", // should be overwritten by the child game class's prototype inheriting this
    aliases: [], // should be overwitten as well, and populated with strings like the web server id. aliases are NOT case sensitive
    numberOfPlayers: 2,
    maxInvalidsPerPlayer: Infinity,
    _orderFlag: {isOrderFlag: true},
    _playerStartingTime: 6e10, // 60 seconds in nanoseconds



    /////////////////////////////
    // Server starting methods //
    /////////////////////////////

    /**
     * Called then the game starts. Do not inherit this method, instead use begin()
     *
     * @param {Array.<Client>} clients - list of clients that are playing this game, and need a player
     */
    start: function(clients) {
        this._initPlayers(clients);

        this.begin();

        this._started();
    },

    /**
     * Called when the game has started, after it and all its subclasses begin()
     */
    _started: function() {
        this._hasStarted = true;
    },

    /**
     * Returns a boolean representing if the game has started
     *
     * @returns {boolean} represents if the game has started yet.
     */
    hasStarted: function() {
        return this._hasStarted;
    },

    /**
     * Called when the game actually starts and has it's players. Intended to be inherited and extended when the game should be started (e.g. initializing game objects)
     *
     * @inheritable
     * @returns {*} returns any start data you want stored in the game log, such as the random seed (if any procedural generation is used)
     */
    begin: function() {
        // This should be inheritied in <gamename>/game.js. This function is simply here in case they delete the function because they don't need it (no idea why that would be the case though).
    },



    /////////////
    // Players //
    /////////////

    /**
     * Initializes the players based on what clients are connected.
     *
     * @param {Array.<Client>} clients - all client connected to this game that are playing, each will have a corresponding player created for it.
     */
    _initPlayers: function(clients) {
        if(this.players.length === 0) {
            for(var i = 0; i < clients.length; i++) {
                var client = clients[i];
                var player = this.create("Player", { // this method should be implimented in GeneratedGame
                    name: client.name || ("Player " + i),
                    clientType: client.type || "Unknown",
                });

                // while these are "public", they are not properties of players sent to clients.
                player.invalids = [];
                player.timeRemaining = player.timeRemaining || this._playerStartingTime;
                player.client = client;

                client.setGameData(this, player);
                this.players.push(player);
            }
        }
    },

    /**
     * Called when a client disconnected to remove the client from the game and check if they have a player and if removing them alters the game
     *
     * @param {Player} player - the player whose client disconnected
     * @param {string} reason - human readable resason why this player disconnected
     */
    playerDisconnected: function(player, reason) {
        if(player && this.hasStarted() && !this.isOver()) {
            this.declareLoser(player, reason || "Disconnected during gameplay.");

            if(this._losers.length === this.players.length - 1) { // only one player left in the game, he wins!
                var winner;
                var allDisconnected = true;
                var allTimedOut = true;
                for(var i = 0; i < this.players.length; i++) {
                    var player = this.players[i];
                    if(!player.lost) {
                        winner = player;
                    }
                    else {
                        allDisconnected = allDisconnected && player.client.hasDisconnected();
                        allTimedOut = allTimedOut && player.client.hasTimedOut();
                    }
                }

                var reasonWon = "All other players lost.";
                if(allDisconnected) {
                    reasonWon = "All other players disconnected.";
                }
                if(allTimedOut) {
                    reasonWon = "All other players timed out."
                }

                this.declareWinner(winner, reasonWon);
            }
        }
    },

    /**
     * Gets all the players in the game except the passed in player. Something you'll want to know often in games
     *
     * @param {Player} player - the player you want to exclude
     * @returns {Array.<Player>} all the other players besides the one passed in
     */
    getOtherPlayers: function(player) {
        var otherPlayers = [];
        for(var i = 0; i < this.players.length; i++) {
            if(this.players[i] !== player) {
                otherPlayers.push(this.players[i]);
            }
        }

        return otherPlayers;
    },



    //////////////////
    // Game Objects //
    //////////////////

    /**
     * Checks and returns the game object with given id, undefined otherwise.
     *
     * @param {string} id - the id of the BaseGameObject you want.
     * @returns {BaseGameObject} with the given id
     */
    getGameObject: function(id) {
        return this.gameObjects[id];
    },

    /**
     * returns the next availible game object id, which by default is the number number as a string. But games where linear id numbers give away info this can be overridden to hide.
     *
     * @returns {string} the next id for a game object. It should never be an id already used this instance, even if that game object is dereferenced everwhere.
     */
    _generateNextGameObjectID: function() {
        return String(this._nextGameObjectID++); // returns this._nextGameObjectID then increments by 1 (that's how post++ works FYI)
    },

    /**
     * Creates and tracks a new game object.
     *
     * @param {string} gameObjectName - the name of the game object class
     * @param {Object} [data] - initialization data for new game object
     * @returns {BaseGameObject} the game object that was created, now being tracked by this game
     */
    create: function(gameObjectName, data) {
        var gameObjectClass = this.classes[gameObjectName];
        var gameObject = new gameObjectClass.uninitialized; // don't call init, we need to hook up some stuff first

        data = data || {};
        data.id = this._generateNextGameObjectID();
        data.game = this;
        data.gameObjectName = gameObjectClass.gameObjectName;

        this.gameObjects.add(data.id, gameObject); // DeltaMergeableDictionary requires add() to add new keys, [] has no setter hooks for us :(

        gameObject.init(data); // we delay the actual init so that it can already be in gameObjects during it's init function, that way deltas it creates are registered in game.gameObjects for clients to see

        return gameObject;
    },



    /////////////////////////////////
    // Client Responses & Requests //
    /////////////////////////////////

    /**
     * Called when an instance gets the "finished" event from an ai (client), meaning they finished an order we instructed them to do.
     *
     * @throws {CerveauError} - game logic or event errors
     * @param {Player} the player this ai controls
     * @param {number} orderIndex - the index of the order that finished
     * @param {Object} [data] - serialized data returned from the ai executing that order
     * @returns {string} the name of the order that was finished
     */
    aiFinished: function(player, orderIndex, data) {
        var order = this._orders[orderIndex];
        if(order === undefined) {
            this.throwErrorClass(errors.EventDataError, "no order found that you claim to have finished.");
        }
        else {
            var finished = order.name;
            var defaultCallback = this["aiFinished_" + finished];

            var returned = serializer.deserialize(data, this);
            returned = this.gameManager.sanitizeFinished(order, returned);

            var hadCallback = true;
            if(order.callback) {
                order.callback(returned);
            }
            else if(defaultCallback) {
                defaultCallback.call(this, player, returned);
            }
            else {
                hadCallback = false;
            }

            if(hadCallback) {
                return finished;
            }
            else {
                this.throwErrorClass(errors.EventDataError, "No callback for finshed order '" + finished + "'.");
            }
        }
    },

    /**
     * Called when an instance gets the "run" event from an ai (client), meaning they want the game to run some game logic.
     *
     * @param {Player} player - the player this ai controls
     * @param {Object} data - serialized data containing what game logic to run.
     * @returns {Promise} A promise that should eventually resolve to whatever the game logic returned from running the 'run' command.
     */
    aiRun: function(player, data) {
        var self = this;
        var run = serializer.deserialize(data, this);
        var runCallback = run.caller[run.functionName];

        if(!runCallback || !runCallback.cerveau) { // then the run callback is invalid
            return new Promise(function(resolve, reject) {
                reject(new errors.CerveauError("'{}'' is not a valid function name in {}".format(run.functionName, run.caller)));
            });
        }

        var ran = {};

        var argsArray;
        var sendError;

        try {
            if(this.gameManager.isSecret(runCallback)) {
                data.isSecret = true;
            }
            argsArray = this.gameManager.sanitizeRun(runCallback, run.args || {});
        }
        catch(err) {
            if(Class.isInstance(err, errors.CerveauError)) { // then something about the run command was incorrect and we couldn't figure out what they want to run
                return new Promise(function(resolve, reject) {
                    self._instance.fatal(err);
                    reject(err);
                });
            }
            else {
                throw err;
            }
        }

        var asyncReturnWrapper = {}; // just an object both asyncReturn and the promise have scope to to pass things to and from.
        var asyncReturn = function(asyncReturnValue) { asyncReturnWrapper.callback(asyncReturnValue); }; // callback function setup below

        argsArray.unshift(player);
        argsArray.push(asyncReturn);

        return new Promise(function(resolve, reject) {
            try {
                var ranReturned = runCallback.apply(run.caller, argsArray);

                if(ranReturned === BaseGame._orderFlag) { // then they want to execute an order, and are thus returning the value asyncronously
                    asyncReturnWrapper.callback = function(asyncReturnValue) {
                        resolve(self._finishRun(runCallback, player, asyncReturnValue));
                    };
                }
                else {
                    resolve(self._finishRun(runCallback, player, ranReturned));
                }
            }
            catch(err) {
                self._instance.fatal(err);
                reject(err);
            }
        });
    },

    /**
     * After we run game logic, santatize the ran data and send it back
     */
    _finishRun: function(runCallback, player, returned) {
        var isGameLogicError = typeof(returned) === "object" && returned.isGameLogicError;
        var returnedValue = this.gameManager.sanitizeRan(runCallback, (isGameLogicError ? returned.returned : returned));

        if(isGameLogicError) {
            returned.returned = returnedValue;

            player.invalids.push({
                message: returned.message,
                data: returned.data,
            });

            if(player.invalids.length > this.maxInvalidsPerPlayer && !player.lost) {
                this.declareLoser(player, "Exceeded max amount of invalids in one game ({0}).".format(this.maxInvalidsPerPlayer));
            }
        }
        else {
            returned = returnedValue;
        }

        return returned;
    },

    /**
     * Called internally by games to order ais (clients) to execute some order.
     *
     * @param {Player} player - the player that we want to execture the order
     * @param {string} orderName - the name of the order to the player's ai to execute
     * @param {Array} [args] - an array that represents the args to send to the order function on the client ai, or [callback] if no args
     * @param {function} [callback] - callback function to execute instead of the normal aiFinished callback
     */
    order: function(player, orderName, args, callback) {
        if(callback === undefined && typeof(args) == "function") {
            callback = args;
        }

        var order = {
            player: player,
            index: this._orders.length,
            name: orderName,
            args: args || [],
            callback: callback,
        };

        this.gameManager.sanitizeOrder(order);

        this._orders.push(order);

        return BaseGame._orderFlag;
    },

    /**
     * Called from the instance to send this order to the ais (clients). Gets all new orders since the last time this was called
     *
     * @returns {Array.<Object>} array of orders to send
     */
    getNewOrders: function() {
        var orders = [];
        for(var i = this._newOrdersToPopIndex; i < this._orders.length; i++) {
            orders.push(this._orders[i]);
        }
        this._newOrdersToPopIndex = this._orders.length;
        return orders;
    },



    ///////////////////////////
    // States & Delta States //
    ///////////////////////////

    /**
     * Gets the true delta state of the game, with nothing hidden
     *
     * @returns {Object} delta formatted object representing the true delta state of the game, with nothing hidden
     */
    getTrueDelta: function() {
        return this._delta;
    },

    /**
     * Returns the difference between the last and current state for the given player.
     *
     * @param {Player} player (for inheritance) if the state differs between players inherited games can send different states (such as to hide data from certain players).
     * @returns {Object} the serializable state as the passed in player should see it
     */
    getDeltaFor: function(player) {
        return this.getTrueDelta();
    },

    /**
     * Called by all DeltaMergeables in this game whenever a property of theirs is updated
     *
     * @param {Array} basePath - the path of keys to where this property's object is
     * @param {string} propertyKey - they key of the property at the end of the basePath
     * @param {boolean} [wasDeleted] - true if the value was removed (deleted)
     */
    updateDelta: function(property, wasDeleted) {
        var path = property.path;
        var currentReal = this;
        var currentDelta = this._delta;
        for(var i = 0; i < path.length; i++) {
            var pathKey = path[i];

            currentReal = currentReal[i === path.length-1 ? property.key : pathKey]; // the last part of the path for the real object can be different for the delta key (DELTA_LIST_LENGTH), so use the real key

            if(i === path.length-1) {
                currentDelta[pathKey] = wasDeleted ? constants.shared.DELTA_REMOVED : serializer.serialize(currentReal, this);
            }
            else {
                currentDelta[pathKey] = currentDelta[pathKey] || {};
            }

            currentDelta = currentDelta[pathKey];

            if(serializer.isObject(currentReal) && currentReal.isArray) { // then we need to include it's DELTA_LIST_LENGTH to indicate this is an array
                currentDelta[constants.shared.DELTA_LIST_LENGTH] = currentReal.length;
                delete currentDelta.length;
            }
        }
    },

    /**
     * Clears the current delta data. Should be called by the instance once its done with the current delta of this game
     */
    flushDelta: function() {
        this._delta = {};
    },



    /////////////////////////
    // Winning and Loosing //
    /////////////////////////

    /**
     * Checks if a game is over, or sets if a game is over
     *
     * @param {boolean} [isOver] - if you pass in true this sets the game to over
     * @returns {boolean} true if this game is over, false otherwise
     */
    isOver: function(isOver) {
        if(isOver === true) {
            this._over = true;
        }

        return this._over;
    },

    /**
     * creates a container for the Instance to give players an invalid message
     *
     * @param {*} returnValue - What you want to return from the run function this is being used in
     * @param {string} invalidMessage - the reason why they are getting an invalid message
     * @param {Object} [invalidData] - more data about why it is invalid
     * @returns {Object} a special container Instances can look for to know that clients need an invalid event sent to them
     */
    logicError: function(returnValue, invalidMessage, invalidData) {
        return {
            isGameLogicError: true,
            returnValue: returnValue,
            invalidMessage: invalidMessage,
            invalidData: invalidData,
        };
    },

    /**
     * delcares a single player as having lost, and assumes when a player looses the rest could still be competing to win.
     *
     * @param {Player} loser - the player that lost the game
     * @see BaseGame.declareLosers
     */
    declareLoser: function(loser /*...*/) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = [ loser ];
        return this.declareLosers.apply(this, args);
    },

    /**
     * Declares players as having lost, and assumes when a player looses the rest could still be competing to win.
     *
     * @param {Array.<Player>} losers - the players that lost the game
     * @param {string} [reason] - human readable string that is the lose reason
     */
    declareLosers: function(losers, reason) {
        for(var i = 0; i < losers.length; i++) {
            this._actuallyMakeLoser(losers[i], reason);
        }

        this._checkForGameOver();
    },

    /**
     * Do not call this outside of BaseGame, instead use declareLoser(s).
     *
     * @param {Player} loser - the loser
     * @param {Player} [reason] - the reason why they lost
     */
    _actuallyMakeLoser: function(loser, reason) {
        loser.lost = true;
        loser.reasonLost = reason || "Lost";
        loser.won = false;
        loser.reasonWon = "";

        this._losers.pushIfAbsent(loser);
        this._winners.removeElement(loser);
    },

    /**
     * delcares a single player as winning, assumes when a player wins the rest lose (unless they've already been set to win)
     *
     * @param {Player} winner - the player that won the game
     * @see BaseGame.declareWinners
     */
    declareWinner: function(winner /*...*/) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = [ winner ];
        return this.declareWinners.apply(this, args);
    },

    /**
     * Declares players as winning, assumes when a player wins the rest lose (unless they've already been set to win)
     *
     * @param {Array.<Player>} winners - the players that won the game, the rest loose if not already won
     * @param {string} [reason] - the human readable string why they won the game
     */
    declareWinners: function(winners, reason) {
        for(var i = 0; i < winners.length; i++) {
            var winner = winners[i];
            winner.won = true;
            winner.reasonWon = reason || "Won";
            winner.lost = false;
            winner.reasonLost = "";

            this._winners.pushIfAbsent(winner);
            this._losers.removeElement(winner);
        }

        this._checkForGameOver();
    },

    /**
     * Does a basic check if this game is over because there is a winner (all other players have lost). For game logic related winner checking you should write your own checkForWinner() function on the sub class.
     *
     * @returns {boolean} boolean represnting if the game is over
     */
    _checkForGameOver: function() {
        if(this._winners.length > 0) { // someone has won, so let's end this
            this.isOver(true);

            for(var i = 0; i < this.players.length; i++) {
                var player = this.players[i];
                if(!player.won && !player.lost) { // then they are going to loose
                    this._actuallyMakeLoser(player);
                }
            }
        }
        else if(this._losers.length === this.players.length) { // it is a draw
            this.isOver(true);
        }
    },

    _endGameViaCoinFlip: function() {
        // Win via coin flip - if we got here no player won via game rules. They probably played identically to each other.
        var players = [];
        for(var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            if(!player.won && !player.lost) {
                players.push(player);
            }
        }

        var winnerIndex = Math.randomInt(players.length - 1);
        for(var i = 0; i < players.length; i++) {
            if(i === winnerIndex) {
                this.declareWinner(players[i], "Won via coin flip.");
            }
            else {
                this.declareLoser(players[i], "Lost via coin flip.");
            }
        }
    },
});

module.exports = BaseGame;

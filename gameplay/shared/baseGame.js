var log = require("../log");
var Class = require(__basedir + "/utilities/class");
var DeltaMergeable = require("./deltaMergeable");
var DeltaMergeableArray = require("./deltaMergeableArray");
var errors = require("../errors");
var serializer = require("../serializer");
var constants = require("../constants");

/**
 * @abstract
 * @class BaseGame - the base game plugin new games should inherit from.
 */
var BaseGame = Class(DeltaMergeable, {
    init: function(data) {
        if(this._baseGameInitialized) { // semi-shitty way to avoid multiplayer sub classes, re-initializing BaseGame
            return;
        }

        this._baseGameInitialized = true;
        this._delta = {}; // the current delta we are recoding

        DeltaMergeable.init.call(this);

        this._addProperty("players", []);
        this._addProperty("gameObjects", {});
        this._addProperty("session", (data.session === undefined ? "Unknown" : data.session));
        this._addProperty("name", this.name);

        this._orders = [];
        this._newOrdersToPopIndex = 0;
        this._returnedDataTypeConverter = {};
        this._started = false;
        this._over = false;
        this._nextGameObjectID = 0;

        this._initGameManager();
    },

    // The following variable are static, and no game instances should override these, but their class prototypes can
    name: "Base Game", // should be overwritten by the child game class's prototype inheriting this
    numberOfPlayers: 2,
    maxInvalidsPerPlayer: 10,
    _orderFlag: {isOrderFlag: true},

    /**
     * initializes this games game manager, which is a creer generated class that handles code that is re-used between games but could not be moved down to a base class as they are too game specific, such as creating game objects by name
     */
    _initGameManager: function() {
        this._gameManager = require(__basedir + "/games/" + this.name.lowercaseFirst() + "/gameManager");
    },



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

        this._started = true;
    },

    /**
     * Returns a boolean representing if the game has started
     *
     * @returns {boolean} represents if the game has started yet.
     */
    hasStarted: function() {
        return this._started;
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
                player.timeRemaining = player.timeRemaining || 1e10; // 10 seconds in nanoseconds
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
            this.declairLoser(player, reason || "Disconnected during gameplay.");
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
        var gameObject = this._gameManager.createUninitializedGameObject(gameObjectName);

        data = data || {};
        data.id = this._generateNextGameObjectID();
        data.game = this;

        this.gameObjects.add(data.id, gameObject);

        gameObject.init(data); // we delay the actul init so that it can already be in gameObjects during it's init function

        return gameObject;
    },



    /////////////////////////////////
    // Client Responses & Requests //
    /////////////////////////////////

    /**
     * Called when a session gets the "finished" event from an ai (client), meaning they finished an order we instructed them to do.
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
            returned = this._gameManager.sanitizeFinished(order, returned);
            
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
     * Called when a session gets the "run" event from an ai (client), meaning they want the game to run some game logic.
     * 
     * @param {Player} player - the player this ai controls
     * @param {Object} data - serialized data containing what game logic to run.
     * @returns {Promise} A promise that should eventually resolve to whatever the game logic returned from running the 'run' command.
     */
    aiRun: function(player, data) {
        var run = serializer.deserialize(data, this);
        var runCallback = run.caller[run.functionName];
        var ran = {};

        var argsArray = this._gameManager.sanitizeRun(run.caller.gameObjectName, run.functionName, run.args || {});
        var asyncReturnWrapper = {}; // just an object both asyncReturn and the promise have scope to to pass things to and from.
        var asyncReturn = function(asyncReturnValue) { asyncReturnWrapper.callback(asyncReturnValue); }; // callback function setup below

        argsArray.unshift(player);
        argsArray.push(asyncReturn);

        var self = this;
        return new Promise(function(resolve, reject) {
            try {
                var ranReturned = runCallback.apply(run.caller, argsArray);

                if(ranReturned === BaseGame._orderFlag) { // then they want to execute an order, and are thus returning the value asyncronously
                    asyncReturnWrapper.callback = function(asyncReturnValue) {
                        resolve(self._aiRan(run, player, asyncReturnValue));
                    };
                }
                else {
                    resolve(self._aiRan(run, player, ranReturned));
                }
            }
            catch(e) {
                log.error(e);
                reject(e);
            }
        });
    },

    _aiRan: function(run, player, returned) {
        var returnedValue = this._gameManager.sanitizeRan(run.caller.gameObjectName, run.functionName, (returned.isGameLogicError ? returned.returned : returned));

        if(returned.isGameLogicError) {
            returned.returned = returnedValue;

            player.invalids.push({
                message: returned.message,
                data: returned.data,
            });

            if(player.invalids.length > this.maxInvalidsPerPlayer) {
                this.declairLoser(player, "Exceeded max amount of invalids in one game (" + this.maxInvalidsPerPlayer + ").");
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
        this._gameManager.sanitizeOrder(order);

        this._orders.push(order);

        return BaseGame._orderFlag;
    },

    /**
     * Called from the session to send this order to the ais (clients). Gets all new orders since the last time this was called
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
     * @param {boolean} [wasDeleted] - true if the value was removed (delted)
     */
    updateDelta: function(property, wasDeleted) {
        var path = property.path;
        var currentReal = this;
        var currentDelta = this._delta;
        for(var i = 0; i < path.length-1; i++) {
            var pathKey = path[i];
            currentReal = currentReal[pathKey];

            currentDelta[pathKey] = currentDelta[pathKey] || {};
            currentDelta = currentDelta[pathKey];
            if(currentReal.isArray) {
                currentDelta[constants.shared.DELTA_LIST_LENGTH] = currentReal.length;
                delete currentDelta.length;
            }
        }
        // now we have traversed the path and are ready to set the value that was updated
        var propertyKey = path.last();
        currentDelta[propertyKey] = wasDeleted ? constants.shared.DELTA_REMOVED : serializer.serialize(currentReal[propertyKey], this);
    },

    /**
     * Clears the current delta data. Should be called by the session once it's done with the current delta of this game
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
     * creates a container for the Session to give players an invalid message
     *
     * @param {*} returnValue - What you want to return from the run function this is being used in
     * @param {string} invalidMessage - the reason why they are getting an invalid message
     * @param {Object} [invalidData] - more data about why it is invalid
     * @returns {Object} a special container Sessions can look for to know that clients need an invalid event sent to them
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
     * Declairs a player as having lost, and assumes when a player looses the rest could still be competing to win.
     *
     * @param {Player} loser - the player that lost the game
     * @param {string} [reason] - human readable string that is the lose reason
     * @param {Object} [flags]
     * @param   {boolean} [flags.dontCheckForWinner] - skips checking for a winner after declairing a loser
     */
    declairLoser: function(loser, reason, flags) {
        loser.lost = true;
        loser.reasonLost = reason || "Lost";
        loser.won = false;
        loser.reasonWon = "";

        if(!flags || !flags.dontCheckForWinner) { // then as someone lost check and see if all other players lost which means the last player won.
            this.basicCheckForWinner();
        }
    },

    /**
     * Declairs the player as winning, assumes when a player wins the rest lose (unless they've already been set to win)
     *
     * @param {Player} winner - the player that won the game, the rest loose if not already won
     * @param {string} [reason] - the human readable string why they won the game
     */
    declairWinner: function(winner, reason) {
        winner.won = true;
        winner.reasonWon = reason || "Won";
        winner.lost = false;
        winner.reasonLost = "";

        for(var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            if(player !== winner && !player.won && !player.lost) { // then this player has not lost yet and now looses because someone else won
                this.declairLoser(player, "Other player won", {dontCheckForWinner: true});
            }
        }

        this.isOver(true);
    },

    /**
     * Does a basic check if this game is over because there is a winner (all other players have lost). For game logic related winner checking you should write your own checkForWinner() function on the sub class.
     *
     * @returns {boolean} boolean represnting if the game is over
     */
    basicCheckForWinner: function() {
        var winner;
        for(var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            if(!player.lost) {
                if(winner) {
                    return false;
                }
                else {
                    winner = player;
                }
            }
        }

        if(winner) {
            this.declairWinner(winner, "All other players lost.");
            return true;
        }
    },
});

module.exports = BaseGame

var log = require("../log");
var Class = require(__basedir + "/utilities/class");
var ObscuredDeltaMergeable = require("./obscuredDeltaMergeable");
var BaseGame = require("./baseGame");
var serializer = require("../serializer");
var constants = require("../constants");
var clone = require("clone");
var uuid = require("uuid");

/**
 * @class ObscuredGame - a game where all values in it can be obscured in it and it's game objects
 */
var ObscuredGame = Class(BaseGame, ObscuredDeltaMergeable, {
    init: function() {
        BaseGame.init.apply(this, arguments);

        //ObscuredDeltaMergeable.init.apply(this, arguments); // No need to call, BaseGameObject will setup the delta mergeable stuff, ObscuredDeltaMergeable doesn't init anything new

        this._obscuredDeltas = {};
    },

    /**
     * Before players are initialized some properties of the game may have been set, we need to copy those over to the player's deltas
     *
     * @override
     */
    _initPlayers: function(/* ... */) {
        BaseGame._initPlayers.apply(this, arguments);

        // so they get the intiial state so far. This also means you can't obscure anything before the players are created... but who would you be obscuring data for without them?
        for(var i = 0; i < this.players.length; i++) {
            this._obscuredDeltas[this.players[i].id] = clone(this._delta);
        }
    },

    /**
     * @override generates a UUID (Universally unique identifier) V4, because with game data being obscued we don't want competitors potentially learning hidden data based of id generation.
     */
    _generateNextGameObjectID: function() {
        return uuid.v4();
    },

    /**
     * @override
     */
    getDeltaFor: function(player) {
        return this._obscuredDeltas[player.id] || {};
    },

    /**
     * @override
     */
    flushDelta: function() {
        BaseGame.flushDelta.apply(this, arguments);

        for(var i = 0; i < this.players.length; i++) {
            this._obscuredDeltas[this.players[i].id] = {};
        }
    },

    /**
     * when a property is updated the player's may need to know too
     *
     * @override
     */
    updateDelta: function(property, wasDeleted) {
        BaseGame.updateDelta.call(this, property, wasDeleted);

        for(var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            if(player) {
                this.obscuredDeltaUpdate(property, this.players[i], wasDeleted);
            }
        }
    },



    //////////////////////////////
    // Obscuring only functions //
    //////////////////////////////

    /**
     * When a property is obscured or unobscured that specific player's delta must be updated too
     *
     * @param {Object} property - the property of a DeltaMergeable that was updated
     * @param {Player} player - the player that this property was updated for
     * @param {boolean} [wasDeleted] - if the updated was a deletion
     */
    obscuredDeltaUpdate: function(property, player, wasDeleted) {
        var path = property.path;
        var currentReal = this;
        this._obscuredDeltas[player.id] = this._obscuredDeltas[player.id] || {};
        var currentDelta = this._obscuredDeltas[player.id];
        for(var i = 0; i < path.length-1; i++) {
            var pathKey = path[i];

            currentReal = this._getObscuredValue(currentReal, pathKey, player);

            currentDelta[pathKey] = currentDelta[pathKey] || {};
            currentDelta = currentDelta[pathKey];
            if(serializer.isObject(currentReal)) {
                if(currentReal.isArray) {
                    currentDelta[constants.shared.DELTA_LIST_LENGTH] = currentReal.length;
                    delete currentDelta.length;
                }
            }
            else {
                currentDelta = serializer.serialize(currentReal, this);
                return;
            }
        }
        
        // if we got here they did not obscure part of the path
        var propertyKey = path.last();
        currentDelta[propertyKey] = wasDeleted ? constants.shared.DELTA_REMOVED : serializer.serialize(this._getObscuredValue(currentReal, propertyKey, player), this);
    },

    /**
     * shortcut to get check to get obscured values from objects
     *
     * @param {Object} real - obj to try to get key in, can be ObscuredDeltaMergeable or any other object
     * @param {string} key - key in real to try to get
     * @param {Player} player - the player you want to try to get the obscured value as it appears to them
     */
    _getObscuredValue: function(real, key, player) {
        return Class.isInstance(real, ObscuredDeltaMergeable) ? real.getObscured(key, player) : real[key];
    },
});

module.exports = ObscuredGame;

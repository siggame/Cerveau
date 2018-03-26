var Class = require("classe");
var DeltaMergeable = require("./deltaMergeable");
var extend = require("extend");
var log = require("../log");

/**
 * @abstract
 * @class BaseGameObject - the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
 */
var BaseGameObject = Class(DeltaMergeable, {
    init: function(data) {
        DeltaMergeable.init.call(this, data.game, ["gameObjects", data.id], data);

        this.game = data.game;
        this.gameObjectName = this._classe.gameObjectName;
    },

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     *
     * @param {Player} player - the player requesting to log the string to this game object
     * @param {string} message - string to log
     */
    invalidateLog: function(player, message) {
        // NOTE: may be a good idea to make sure the messages are not too long, E.g. they are not trying to log 100+ MB strings
        return; // nothing to invalidate, all input is valid
    },

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     *
     * @param {Player} player - the player requesting to log the string to this game object
     * @param {string} message - string to log
     */
    log: function(player, message) {
        this.logs.push(message);
    },

    /**
     * String coercion override, handles players by default as every game has them
     *
     * @override
     * @returns {string} formatted string for this name
     */
    toString: function() {
        // common game objects in games might have prettier strings to use
        switch(this.gameObjectName) {
            case "Player": // every game will have a 'Player' game object, but we don't have a BasePlayer object in Cerveau.
                return `${this.gameObjectName} '${this.name}' #${this.id}`;
            case "Tile": // TiledGames have these, so include their (x, y) position
                return `${this.gameObjectName} (${this.x}, ${this.y}) #${this.id}`;
        }

        // default case
        return `${this.gameObjectName} #${this.id}`;
    },
});

module.exports = BaseGameObject;

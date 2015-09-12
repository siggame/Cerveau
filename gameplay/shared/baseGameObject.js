var Class = require(__basedir + "/utilities/class");
var DeltaMergeable = require("./deltaMergeable");

/**
 * @abstract
 * @class BaseGameObject - the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
 */
var BaseGameObject = Class(DeltaMergeable, {
    init: function(data) {
        DeltaMergeable.init.call(this);

        if(!data.game.isGameObject(this)) { // then this is a fresh init of an untracked game object (game objects that inherit multiple child game objects classes will try to init this class multiple times)
            this.game = data.game;
            this.id = data.id;
            this.logs = [];

            this._addSerializableKeys(["id", "gameObjectName", "logs"]);
        }
    },

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     *
     * @param {Player} player - the player requesting to log the string to this game object
     * @param {string} message - string to log
     */
    log: function(player, message, asyncReturn) {
        this.logs.push(message);
    },
});

module.exports = BaseGameObject;

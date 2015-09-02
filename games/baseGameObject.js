var Class = require("../utilities/class");
var extend = require("extend");

/**
 * @class BaseGameObject: the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
 */
var BaseGameObject = Class({
    init: function(data) {
        if(!data.game.isGameObject(this)) { // then this is a fresh init of an untracked game object (game objects that inherit multiple child game objects classes will try to init this class multiple times)
            this.game = data.game;
            this.id = this.game.trackGameObject(this);
            this.logs = [];

            this._serializableKeys = {
                "logs": true,
                "id": true,
                'gameObjectName': true,
            };
        }
    },

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     */
    log: function(player, message) {
        this.logs.push(message);
    },
});

module.exports = BaseGameObject;

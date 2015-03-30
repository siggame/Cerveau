var Class = require("../utilities/class");
var extend = require("extend");

// @class BaseGameObject: the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
var BaseGameObject = Class({
	init: function(data) {
		this.game = data.game;
		this.id = this.game.trackGameObject(this);
		this.logs = [];

		this._serializableKeys = {
			"logs": true,
			"id": true,
			'gameObjectName': true,
		};
	},

	/// logs a string to this BaseGameObject's log array, for debugging purposes
	log: function(player, message) {
		this.logs.push(message);
	},
});

module.exports = BaseGameObject;

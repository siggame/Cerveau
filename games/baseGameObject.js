var Class = require("../utilities/class");
var extend = require("extend");

// @class BaseGameObject: the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
var BaseGameObject = Class({
	init: function(data) {
		this.id = data.game.trackGameObject(this);
		this.game = data.game;
		this.logs = [];

		this._serializableKeys = {
			"logs": true,
			"id": true,
			'gameObjectName': true,
		};
	},

	log: function(player, message) {
		this.logs.push(message);
	},
});

module.exports = BaseGameObject;

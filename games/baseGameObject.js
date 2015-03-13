var Class = require("../structures/class");
var extend = require("extend");

// @class GameObject: the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
var GameObject = Class({
	init: function(data) {
		this.id = data.game.trackGameObject(this);
		this._game = data.game;
		this.log = [];
	},

	log: function(player, data) {
		this.log.push(data.message);
	},
});

module.exports = GameObject;

// NOTE: untested!
var Class = require("../utilities/class");
var BaseGameObject = require("./baseGameObject");
var extend = require("extend");

// @class BaseGameObject: the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
var FogOfWarGameObject = Class(BaseGameObject, {
	init: function(data) {
		BaseGameObject.init.apply(this, arguments);

		this.playersVisibleTo = [];

		this._serializableKeys = {
			"playersVisibleTo": true;
		};
	},

	// @returns boolean representing if this game object is visible to the passed in player
	isVisibleToPlayer: function(player) {
		for(var i = 0; i < this.playersVisibleTo.length; i++) {
			if(this.playersVisibleTo[i] === player) {
				return true;
			}
		}

		return false;
	},

	/// makes the game object visible to the passed in player
	makeVisibleToPlayer: function(player) {
		this.playersVisibleTo.insertIfAbsent(player);
	},

	makeVisibleToPlayers: function(players) {
		for(var i = 0; i < players.length; i++) {
			this.makeVisibleToPlayer(players[i]);
		}
	},

	makeHiddenToPlayer: function(player) {
		this.playersVisibleTo.removeIfPresent(player);
	},

	makeHiddenToPlayers: function(players) {
		for(var i = 0; i < players.length; i++) {
			this.makeHiddenToPlayer(players[i]);
		}
	},
});

module.exports = FogOfWarGameObject;

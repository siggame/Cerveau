// Generated by Creer at 01:17AM on August 09, 2015 UTC, git hash: '6ae07398e95534176c2e851c2d21269933edce81'
// Note: this file should never be modified, instead if you want to add game logic modify just the ../GameObject.js file. This is to ease merging main.data changes

var serializer = require("../../../utilities/serializer");
var Class = require("../../../utilities/class");
var BaseGameObject = require("../../baseGameObject");


// @class GeneratedGameObject: The generated version of the GameObject, that handles basic logic.
var GeneratedGameObject = Class(BaseGameObject, {
	init: function(data) {
		BaseGameObject.init.apply(this, arguments);


	},

	gameObjectName: "GameObject",

	_runLog: function(player, data) {
		var message = serializer.toString(data.message);

		var returned = this.log(player, message);
	},

});

module.exports = GeneratedGameObject;

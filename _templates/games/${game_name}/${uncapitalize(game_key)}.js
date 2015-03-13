// ${header}
// Note: this is the file you should modify. The logic generated be Creer should be mostly in generated/
var extend = require("extend");
var Class = require("../../structures/class");
var Generated${game_key} = require("./generated/generated${game_key}")

// @class ${game_name}.${game_key}: ${game['description']}
var ${game_key} = Class(Generated${game_key}, {
	init: function() {
		Generated${game_key}.init.apply(this, arguments);

		// any initialization you need to do can be done here. NOTE: no players are connected at this point.
	},


	begin: function() {
		Generated${game_key}.begin.apply(this, arguments);

		// this is called when the game begins, once players are connected and ready to play. Anything in init() will not have to assign units to.
	},
});

module.exports = ${game_key};

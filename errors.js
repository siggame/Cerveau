var Class = require("./utilities/class");

var CerveauError = Class({
	init: function(message) {
		this.message = message;
	}
})

module.exports = {
	CerveauError: CerveauError,
	GameLogicError: Class(CerveauError),
};

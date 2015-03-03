// Put constant values here, they will not be able to be changed thanks to Object.freeze
// Note: using Object.freeze() has severe performance issues in V8. This should be the only place it's ever used within this project.
module.exports = Object.freeze({
	shared: Object.freeze({ // constants put here will be sent to clients (hence shared between the server here and clients)
		DELTA_REMOVED: "&RM",
		DELTA_ARRAY_LENGTH: "&LEN",
	}),
});

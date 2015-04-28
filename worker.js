var gameName = process.env.gameName;
var gameSession = process.env.gameSession;

require("./extensions/"); // because we are a new thread, and have not extended our base prototypes
var cluster = require("cluster");
var Session = require("./session");

if(cluster.isMaster) {
	console.error("ERROR: worker running on master thread");
}
else {
	var session = new Session({
		gameName: gameName,
		gameSession: gameSession,
		gameClass: require("./games/" + gameName + "/game"),
	});

	process.on("message", function(message, handler) {
		if(message === "socket") {
			var socket = handler;

			session.addSocket(socket);
		}
	});
}

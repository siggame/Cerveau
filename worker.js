var data = JSON.parse(process.env.workerGameSessionData);
require("./extensions/"); // because we are a new thread, and have not extended our base prototypes
var cluster = require("cluster");
var Session = require("./session");

if(cluster.isMaster) {
	console.error("ERROR: worker running on master thread");
}
else {
	var session = new Session({
		gameName: data.gameName,
		gameSession: data.gameSession,
		gameClass: require("./games/" + data.gameName + "/game"),
		printIO: data.printIO,
	});

	var socketIndex = 0;
	process.on("message", function(message, handler) {
		if(message === "socket") { // Note: Node js can only send sockets via handler if message === "socket", because passing sockets between threads is sketchy as fuck
			var socket = handler;

			session.addSocket(socket, data.clientInfos[socketIndex]);

			socketIndex++;
		}
	});
}

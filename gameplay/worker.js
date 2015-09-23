// This is the script that can be thought of as the 'main.js' for each worker thread that spins up a game session using true multithreading
var data = JSON.parse(process.env.workerGameSessionData);

var portOffset = parseInt(data.gameSession) || process.pid;
process._debugPort = (data._mainDebugPort || 5858) + portOffset; // for debugging the port is node-inspector default (5858) plus the game session if it's a number, or a pid

global.__basedir = data.__basedir;
require(__basedir + "/extensions/"); // because we are a new thread, and have not extended our base prototypes
var cluster = require("cluster");
var Session = require("./session");
var log = require("./log");
var extend = require("extend");

if(cluster.isMaster) {
    log.error("ERROR: worker running on master thread");
}
else {
    data.gameSettings.session = data.gameSession;
    var session = new Session(extend({
        gameClass: require(__basedir + "/games/" + data.gameName.lowercaseFirst() + "/game"),
        profiler: data.profile && require('v8-profiler'),
    }, data));

    var socketIndex = 0;
    process.on("message", function(message, handler) {
        if(message === "socket") { // Note: Node js can only send sockets via handler if message === "socket", because passing sockets between threads is sketchy as fuck
            var socket = handler;

            session.addSocket(socket, data.clientInfos[socketIndex]);

            socketIndex++;
        }
    });
}

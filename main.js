// Check for npm install first, as many devs forget this pre step
var fs = require("fs");
try {
    if(!fs.lstatSync('./node_modules/').isDirectory()) {
        throw {};
    }
}
catch (e) {
    console.error("ERROR: \"node_modules/\" not found.\nDid you forget to run 'npm install'?");
    process.exit(1);
}

process.title = "Cerveau Game Server";
global.__basedir = __dirname + '/'; // hackish way to store the base directory we are in now so we don't need require("../../../../whatever") and instead require(__base + "root/path/to/whatever")

require("cadre-js-extensions"); // extends built in JavaScript objects. Extend with care, prototypes can get funky if you are not careful

var args = require("./args");
var extend = require("extend");

var Lobby = require("./gameplay/lobby");
var lobby = new Lobby(args); // the game server for clients to connect to
var log = require("./gameplay/log");

var app = require("./website/app");
if(args.api || args.web) {
    var http = require('http').Server(app);
    var server = http.listen(args.httpPort, function() {
        log('--- HTTP server running on port ' + args.httpPort + ' ---');
    });

    server.on("error", function(err) {
        log.error(err.code !== 'EADDRINUSE' ? err : "Webinterface cannot listen on port " + args.httpPort + ". Address in use.");
    });
}

require("./website/")(extend({
    lobby: lobby,
}, args));

process.title = "Cerveau Game Server"
global.__basedir = __dirname + '/'; // hackish way to store the base directory we are in now so we don't need require("../../../../whatever") and instead require(__base + "root/path/to/whatever")
require("./extensions/"); // extends built in JavaScript objects. Extend with care, prototypes can get funky if you are not careful

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({description: 'Run the JavaScript client with options to connect to a game server. Must provide a game name to play.'});
parser.addArgument(['-p', '--port'], {action: 'store', dest: 'port', defaultValue: 3000, help: 'the port that clients should connect through'});
parser.addArgument(['-H', '--host'], {action: 'store', dest: 'host', defaultValue: "localhost", help: 'the host that this should run on'});
parser.addArgument(['--printIO'], {action: 'storeTrue', dest: 'printIO', help: '(debugging) print IO through the TCP socket to the terminal'});
parser.addArgument(['--noTimeout'], {action: 'storeTrue', dest: 'noTimeout', help: '(debugging) clients cannot time out'});
parser.addArgument(['--authenticate'], {action: 'storeTrue', dest: 'authenticate', help: 'forces clients to authenticate against the authentication server'});
var args = parser.parseArgs();

var Lobby = require("./gameplay/lobby");
var lobby = new Lobby(args); // the game server for clients to connect to

var app = require("./website/app");
var http = require('http').Server(app);
http.listen(args.port + 80, function(){
    console.log('--- Webserver @ ' + process.pid + ' running on ' + args.host + ':' + (args.port+80) + ' ---');
});

require("./website/")({
    lobby: lobby,
});

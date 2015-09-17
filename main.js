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
parser.addArgument(['--profile'], {action: 'storeTrue', dest: 'profile', help: 'run the v8 profilers against threaded game sessions.'});
parser.addArgument(['--log'], {action: 'storeTrue', dest: 'log', help: 'store all logged strings to text files in output/logs/'});
parser.addArgument(['--silent'], {action: 'storeTrue', dest: 'silent', help: 'log will not print anything to the console'});
var args = parser.parseArgs();

if(args.profile) {
    try {
        if(!require('v8-profiler')) {
            throw new Error("profiler empty");
        }
    }
    catch(e) {
        console.error("Error: Module 'v8-profiler' not found and is needed for profiling. Please use 'npm install v8-profiler', which will require node-gyp to compile its C++ addons.");
        process.exit(1);
    }
}

var Lobby = require("./gameplay/lobby");
var lobby = new Lobby(args); // the game server for clients to connect to
var log = require("./gameplay/log");

var app = require("./website/app");
var http = require('http').Server(app);
http.listen(args.port + 80, function(){
    log('--- Webserver running on ' + args.host + ':' + (args.port+80) + ' ---');
});

require("./website/")({
    lobby: lobby,
});

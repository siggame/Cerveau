var ArgumentParser = require("argparse").ArgumentParser;
var parser = new ArgumentParser({description: "Run the JavaScript client with options to connect to a game server. Must provide a game name to play."});
var parserArgs = [
    [["--port-offset"], {action: "store", dest: "portOffset", defaultValue: 0, type: "int", help: "port offset for the default port values"}],
    [["--tcp-port"], {action: "store", dest: "tcpPort", defaultValue: 3000, type: "int", help: "the port that TCP clients should connect through"}],
    [["--http-port"], {action: "store", dest: "httpPort", defaultValue: 3080, type: "int", help: "the port that the webinterface should be accessed through"}],
    [["--ws-port"], {action: "store", dest: "wsPort", defaultValue: 3088, type: "int", help: "the port that WebSocket clients should connect though"}],
    [["--host"], {action: "store", dest: "host", defaultValue: "127.0.0.1", help: "the host that this should run on"}],
    [["--title"], {action: "store", dest: "title", defaultValue: "Cerveau", help: "the title of this game sever for the web interface"}],
    [["--authenticate"], {action: "storeTrue", dest: "authenticate", help: "forces clients to authenticate against the authentication server"}],
    [["--profile"], {action: "storeTrue", dest: "profile", help: "run the v8 profilers against threaded game sessions"}],
    [["--log"], {action: "storeTrue", dest: "log", help: "store all logged strings to text files in output/logs/"}],
    [["--silent"], {action: "storeTrue", dest: "silent", help: "log will not print anything to the console"}],
    [["--visualizer-url"], {action: "store", dest: "visualizerURL", help: "the base url the a remote visualizer to send clients to", defaultValue: ""}],
    [["--arena"], {action: "storeTrue", dest: "arena", help: "starts the server in arena mode, where certain functionality is changed", defaultValue: false}],
    [["--print-tcp"], {action: "storeTrue", dest: "printTCP", help: "(debugging) print IO through the TCP socket to the terminal", defaultValue: false}],
    [["--timeout"], {action: "store", dest: "timeout", help: "(debugging) override for how long clients have before a timeout occurs", defaultValue: true}],
    [["--no-timeout"], {action: "storeFalse", dest: "timeout", help: "(debugging) clients cannot time out"}],
    [["--no-game-settings"], {action: "storeFalse", dest: "gameSettings", help: "ignores any requested game settings from clients", defaultValue: true}],
    [["--no-load-gamelogs"], {action: "storeFalse", dest: "loadGamelogs", help: "gamelogs are not loaded to get the status or view in the web interface", defaultValue: true}],
    [["--no-api"], {action: "storeFalse", dest: "api", help: "does not run the hooks for the RESTful API service", defaultValue: true}],
    [["--no-web"], {action: "storeFalse", dest: "web", help: "does not run web interface", defaultValue: true}],
];

for(var i = 0; i < parserArgs.length; i++) {
    parser.addArgument.apply(parser, parserArgs[i]);
}

// Parse config.json and make it into cli args
var config = require("./config.json");
for(var key in config) {
    if(config.hasOwnProperty(key)) {
        process.argv.push("--" + key, config[key]);
    }
}

var args = parser.parseArgs(process.argv.slice(2)); // first two args are `node main.js`, with the full math to each

if(args.profile) {
    try {
        if(!require("v8-profiler")) {
            throw new Error("profiler empty");
        }
    }
    catch(e) {
        /* eslint-disable no-console */
        console.error("ERROR: Module 'v8-profiler' not found and is needed for profiling. Please use 'npm install v8-profiler', which will require node-gyp to compile its C++ addons.");
        /* eslint-enable no-console */
        process.exit(1);
    }
}

if(args.arena) {
    args.log = true;
    args.gameSettings = false;
    args.web = false;
    args.loadGamelogs = false;
}

if(args.chesser) {
    args.chesser += "?file={gamelogFilename}";
}

if(!isNaN(args.portOffset)) {
    var portOffset = parseInt(args.portOffset);
    args.tcpPort += portOffset;
    args.httpPort += portOffset;
    args.wsPort += portOffset;
}

module.exports = args;

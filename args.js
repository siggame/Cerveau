var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({description: "Run the JavaScript client with options to connect to a game server. Must provide a game name to play."});
var parserArgs = [
    [["-p", "--port"], {action: "store", dest: "port", defaultValue: 3000, help: "the port that TCP clients should connect through."}],
    [["--http-port"], {action: "store", dest: "httpPort", defaultValue: 3080, help: "the port that the webinterface should be accessed through."}],
    [["--ws-port"], {action: "store", dest: "wsPort", defaultValue: 3088, help: "the port that WebSocket clients should connect though."}],
    [["-H", "--host"], {action: "store", dest: "host", defaultValue: "0.0.0.0", help: "the host that this should run on"}],
    [["-t", "--title"], {action: "store", dest: "title", defaultValue: "Cerveau", help: "the title of this game sever for the web interface"}],
    [["--authenticate"], {action: "storeTrue", dest: "authenticate", help: "forces clients to authenticate against the authentication server"}],
    [["--profile"], {action: "storeTrue", dest: "profile", help: "run the v8 profilers against threaded game sessions."}],
    [["--log"], {action: "storeTrue", dest: "log", help: "store all logged strings to text files in output/logs/"}],
    [["--silent"], {action: "storeTrue", dest: "silent", help: "log will not print anything to the console"}],
    [["--visualizer-url"], {action: "store", dest: "visualizerURL", help: "the base url the a remote visualizer to send clients to", defaultValue: "",}],
    [["--arena"], {action: "storeTrue", dest: "arena", help: "starts the server in arena mode, where certain functionality is changed", defaultValue: false,}],
    [["--print-tcp"], {action: "storeTrue", dest: "printTCP", help: "(debugging) print IO through the TCP socket to the terminal", defaultValue: false,}],
    [["--timeout"], {action: "store", dest: "timeout", help: "(debugging) override for how long clients have before a timeout occurs", defaultValue: true}],
    [["--no-timeout"], {action: "storeFalse", dest: "timeout", help: "(debugging) clients cannot time out"}],
    [["--no-game-settings"], {action: "storeFalse", dest: "gameSettings", help: "ignores any requested game settings from clients", defaultValue: true,}],
    [["--no-load-gamelogs"], {action: "storeFalse", dest: "loadGamelogs", help: "gamelogs are not loaded to get the status or view in the web interface.", defaultValue: true,}],
    [["--no-api"], {action: "storeFalse", dest: "api", help: "does not run the hooks for the RESTful API service", defaultValue: true,}],
    [["--no-web"], {action: "storeFalse", dest: "web", help: "does not run web interface.", defaultValue: true,}],
    [["--chesser"], {action: "store", dest: "chesser", help: "the base url to where the Chesser visualizer is.", defaultValue: "",}],
];

for(var i = 0; i < parserArgs.length; i++) {
    parser.addArgument.apply(parser, parserArgs[i]);
}

var args = parser.parseArgs();

if(args.profile) {
    try {
        if(!require("v8-profiler")) {
            throw new Error("profiler empty");
        }
    }
    catch(e) {
        console.error("ERROR: Module 'v8-profiler' not found and is needed for profiling. Please use 'npm install v8-profiler', which will require node-gyp to compile its C++ addons.");
        process.exit(1);
    }
}

if(args.arena) {
    args.log = true;
    args.gameSettings = false;
    args.web = false;
    args.api = false; // TODO: update arena to use API instead of listening for gamelogs in directories. Until then they don't need the API
    args.loadGamelogs = false;
}

if(args.chesser) {
    args.visualizerURL = args.chesser + "?file={gamelogFilename}";
}

module.exports = args;

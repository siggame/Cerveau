// Check for npm install first, as many devs forget this pre step
import { lstatSync, readFileSync } from "fs";

try {
    if (!lstatSync("./node_modules/").isDirectory()) {
        throw new Error(
`ERROR: "node_modules/" not found.
Did you forget to run 'npm install'?`,
        );
    }
}
catch (err) {
    // tslint:disable-next-line no-console
    console.error(err);
    process.exit(1);
}

// we need to register the typescript paths so we can load from the root
import { parse } from "json5";
import { register } from "tsconfig-paths";
const tsconfig = parse(readFileSync("tsconfig.json").toString());

register({
    baseUrl: "./",
    paths: tsconfig.compilerOptions.paths,
});

// import { join } from "path";
// process.env.TS_NODE_PROJECT = join(__dirname, "tsconfig.json");

// if we got here the node modules should be good to go
// import "module-alias/register";
import { Config } from "~/core/args";
process.title = `${Config.MAIN_TITLE} Game Server`;

import { Lobby } from "~/core/server";

Lobby.getInstance(); // this will create the singleton Lobby instance

if (Config.API_ENABLED || Config.WEB_ENABLED) {
    // TODO: create the web server
}

/*
var app = require("./website/app");
if(args.api || args.web) {
    var http = require("http").Server(app);
    var server = http.listen(args.httpPort, function() {
        log("--- HTTP server running on port " + args.httpPort + " ---");
    });

    server.on("error", function(err) {
        log.error(err.code !== "EADDRINUSE"
            ? err
            : "Webinterface cannot listen on port " + args.httpPort + ". Address in use.");
    });
}

require("./website/")(extend({
    lobby: lobby,
}, args));
*/

/**
 * This file is the entry-point to start Cerveau
 */

// Check for npm install first, as many developers forget this pre step
import { lstatSync } from "fs";

try {
    if (!lstatSync("./node_modules/").isDirectory()) {
        throw new Error(// tslint:disable-next-line:no-multiline-string
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

// if we get here then the node_modules should be installed, let's go!

// tslint:disable:no-import-side-effect - we want them below

import "./core/setup-thread";

import { Lobby } from "./core/server";

Lobby.getInstance(); // this will create the singleton Lobby instance

import "./web";

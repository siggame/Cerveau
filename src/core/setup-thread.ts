// this setups up common (global) stuff for all threads, regardless of main
// or worker threads

// we need to register the typescript paths so we can load from the root
import { readFileSync } from "fs";
import { parse } from "json5";
import { register } from "tsconfig-paths";
const tsconfig = parse(readFileSync("tsconfig.json").toString());

register({
    baseUrl: "./",
    paths: tsconfig.compilerOptions.paths,
});

// if we got here the node modules should be good to go
// import "module-alias/register";
import { Config } from "./args";
process.title = `${Config.MAIN_TITLE} Game Server`;

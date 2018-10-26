// this setups up common (global) stuff for all threads, regardless of main
// or worker threads

// we need to register the typescript paths so we can load from the root
import { readFileSync } from "fs";
import { parse } from "json5";
import { register } from "tsconfig-paths";
import { Tsconfig } from "tsconfig-paths/lib/tsconfig-loader";

/**
 * Sets up a thread and registers runtime TypeScript functions to easier
 * debugging.
 */
export function setupThread(): void {
    // yes read in sync. We don't want async stuff running without having their
    // tsconfig paths setup, or they will probably break.
    const file = readFileSync("tsconfig.json");
    const tsconfig = parse(file.toString()) as Tsconfig;

    if (!tsconfig.compilerOptions || !tsconfig.compilerOptions.paths) {
        throw new Error("Cannot setup thread as tsconfig has no paths!");
    }

    register({
        baseUrl: "./",
        paths: tsconfig.compilerOptions.paths,
    });
}

/**
 * Setups up the current thread with data from a loaded config file.
 *
 * @param processTitle - the title to set this thread to (for *Unix)
 */
export function setupThreadWithConfig(processTitle: string): void {
    process.title = processTitle || "Cerveau Game Server";
}

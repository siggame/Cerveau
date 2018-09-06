// this setups up common (global) stuff for all threads, regardless of main
// or worker threads

// we need to register the typescript paths so we can load from the root
import { readFileSync } from "fs";
import { parse } from "json5";
import { register } from "tsconfig-paths";

/**
 * Sets up a thread and registers runtime TypeScript functions to easier
 * debugging.
 */
export function setupThread(): void {
    const tsconfig = parse(readFileSync("tsconfig.json").toString()) as {
        compilerOptions: {
            paths: {
                [key: string]: string[];
            };
        };
    };

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

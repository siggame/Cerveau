import { Gamelog } from "@cadre/ts-utils/cadre";
import { basename } from "path";
import { Config } from "~/core/config";
import { Immutable, momentString } from "~/utils";

// Typings bug. No default export exist for this library, yet TS thinks there should be.
// This side steps the bug by reverting to old school requires.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const sanitizeFilename = require("sanitize-filename") as typeof import("sanitize-filename");

/** The extension for gamelog files. */
export const GAMELOG_EXTENSION = ".json.gz";

/**
 * Formats a filename.
 *
 * @param gameName - The name of the game.
 * @param gameSession - The game session id.
 * @param moment - The moment string.
 * @returns A string that would be the filename.
 */
export function filenameFormat(
    gameName?: string,
    gameSession?: string,
    moment?: string,
): string {
    if (Config.ARENA_MODE) {
        // TODO: upgrade arena so it can get the "real" filename with
        //       the moment string in it via REST API
        return `${gameName}-${gameSession}`;
    }

    return `${gameName}-${gameSession}-${moment}`;
}

/**
 * Returns a url string to the gamelog.
 *
 * @param filename - The filename of the url.
 * @param includeHostname - True if the hostname should be part of the URL,
 * false otherwise for just he uri.
 * @returns The url to the gamelog.
 */
export function getURL(filename: string, includeHostname = true): string {
    let hostname = "";
    if (includeHostname) {
        // Note: __HOSTNAME__ is expected to be overwritten by clients,
        // as we can't know for certain what hostname they used to connect
        // to us via.
        hostname = `http://__HOSTNAME__:${Config.HTTP_PORT}`;
    }

    const baseFilename = basename(filename, GAMELOG_EXTENSION);

    return `${hostname}/gamelog/${baseFilename}`;
}

/**
 * Returns the expected filename for a gamelog.
 *
 * @param gamelogData - A partial interface of the gamelog data to get the
 * filename from.
 * @param gamelogData.gameName - The name of the game to format the filename for.
 * @param gamelogData.gameSession - The game session id.
 * @param gamelogData.epoch - Optional epoch.
 * @returns The string filename (just name, no path), expected for the data.
 */
export function filenameFor(gamelogData: {
    /** The name of the game to format the filename for. */
    gameName: string;
    /** The game session id. */
    gameSession: string;
    /** Optional epoch. */
    epoch?: number;
}): string {
    return sanitizeFilename(
        filenameFormat(
            gamelogData.gameName,
            gamelogData.gameSession,
            gamelogData.epoch === undefined
                ? "unknown"
                : momentString(gamelogData.epoch),
        ),
    );
}

/**
 * Returns a url to the visualizer for said gamelog.
 *
 * @param gamelogOrFilename - The gamelog to format a visualizer url for.
 * @returns - Undefined if no visualizer set, url to the gamelog in visualizer otherwise.
 */
export function getVisualizerURL(
    gamelogOrFilename: Immutable<Gamelog> | string,
): string | undefined {
    const vis = Config.VISUALIZER_URL;
    if (vis) {
        const filename =
            typeof gamelogOrFilename === "string"
                ? gamelogOrFilename
                : filenameFor(gamelogOrFilename);
        const url = getURL(filename);

        return `${vis}?log=${encodeURIComponent(url)}`;
    }
}

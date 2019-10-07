import { IGamelog } from "@cadre/ts-utils/cadre";
import { basename } from "path";
import sanitizeFilename from "sanitize-filename";
import { Config } from "~/core/config";
import { Immutable, momentString } from "~/utils";

/** The extension for gamelog files */
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
export function getURL(
    filename: string,
    includeHostname: boolean = true,
): string {
    let hostname = "";
    if (includeHostname) {
        // Note: __HOSTNAME__ is expected to be overwritten by clients,
        // as we can't know for certain what hostname they used to connect
        // to us via.
        // tslint:disable-next-line:no-http-string
        hostname = `http://__HOSTNAME__:${Config.HTTP_PORT}`;
    }

    const baseFilename = basename(filename, GAMELOG_EXTENSION);

    return `${hostname}/gamelog/${baseFilename}`;
}

/**
 * Returns a url to the visualizer for said gamelog
 * @param gamelogOrFilename the gamelog to format a visualizer url for
 * @param visualizerURL url to visualizer, if calling statically
 * @returns - Undefined if no visualizer set, url to the gamelog in visualizer otherwise
 */
export function getVisualizerURL(
    gamelogOrFilename: Immutable<IGamelog> | string,
    visualizerURL?: string,
): string | undefined {
    const vis = Config.VISUALIZER_URL;
    if (vis) {
        const filename = typeof gamelogOrFilename === "string"
            ? gamelogOrFilename
            : filenameFor(gamelogOrFilename);
        const url = getURL(filename);

        return `${vis}?log=${encodeURIComponent(url)}`;
    }
}

/**
 * Returns the expected filename for a gamelog.
 *
 * @param gamelogData - A partial interface of the gamelog data to get the
 * filename from.
 * @returns the string filename (just name, no path), expected for the data.
 */
export function filenameFor(gamelogData: {
    gameName: string;
    gameSession: string;
    epoch?: number;
}): string {
    return sanitizeFilename(filenameFormat(
        gamelogData.gameName,
        gamelogData.gameSession,
        gamelogData.epoch === undefined
            ? "unknown"
            : momentString(gamelogData.epoch),
    ));
}

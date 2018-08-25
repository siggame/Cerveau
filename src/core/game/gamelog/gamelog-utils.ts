import { basename } from "path";
import * as sanitizeFilename from "sanitize-filename";
import { Config } from "~/core/config";
import { IGamelog } from "~/core/game";
import { isObject, momentString } from "~/utils";

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
    gamelogOrFilename: IGamelog | string,
    visualizerURL?: string,
): string | undefined {
    const vis = Config.VISUALIZER_URL;
    if (vis) {
        const filename = typeof gamelogOrFilename === "string"
            ? gamelogOrFilename
            : filenameFor(
                gamelogOrFilename.gameName,
                gamelogOrFilename.gameSession,
                gamelogOrFilename.epoch,
            );
        const url = getURL(filename);

        return `${vis}?log=${encodeURIComponent(url)}`;
    }
}

/**
 * Returns the expected filename for a gamelog
 * @param gameName - name of the game
 * @param gameSession - name of the session
 * @param epoch - when the gamelog was logged
 * @returns the filename for the given game settings
 */
export function filenameFor(gameName: string, gameSession: string, epoch?: number): string;
export function filenameFor(
    /** the with a gameName and gameSession to get for */
    gamelog: IGamelog,
): string;

export function filenameFor(gameName: string | IGamelog, gameSession?: string, epoch?: number): string {
    if (isObject(gameName)) {
        gameSession = gameName.gameSession;
        epoch = gameName.epoch;
        gameName = gameName.gameName;
    }

    let moment = "unknown";
    if (epoch) {
        moment = momentString(epoch);
    }

    return sanitizeFilename(filenameFormat(gameName, gameSession, moment));
}

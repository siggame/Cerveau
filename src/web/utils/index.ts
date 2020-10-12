import { hostname } from "os";
import { GamelogInfo } from "~/core/game";
import { Immutable } from "~/utils";

const defaultHostname = hostname();

/**
 * Attempts to format a url with a known hostname used to connect to us.
 *
 * @param url - The URL to attempt to format.
 * @param host - The hostname to replace within the url.
 * @returns The paramter `url` with the hostname injected if found.
 */
function formatHostname(
    url: string | undefined,
    host: string | undefined,
): string {
    return url ? url.replace("__HOSTNAME__", host || defaultHostname) : "";
}

/**
 * Formats gamelog infos from the a game logger into the expected web format, filling in host names in the info.
 *
 * @param gamelogInfos - The array of infos to format. It will not be mutated.
 * @param host - An optional hostname to use. Otherwise the os hostname is used.
 * @returns A new array of new gamelog infos with host names filled in.
 */
export function formatGamelogInfos(
    gamelogInfos: Immutable<GamelogInfo[]>,
    host?: string,
): GamelogInfo[] {
    return gamelogInfos.map((info) => ({
        ...info,
        // replace __HOSTNAME__ with the request's host for them, or a default hostname
        visualizerUrl: formatHostname(info.visualizerUrl, host),
        uri: formatHostname(info.uri, host),
    }));
}

import { hostname } from "os";
import { IGamelogInfo } from "~/core/game";
import { Immutable } from "~/utils";

const defaultHostname = hostname();

function formatHostname(url: string | undefined, host: string | undefined): string {
    return url
        ? url.replace("__HOSTNAME__", host || defaultHostname)
        : "";
}

/**
 * Formats gamelog infos from the a game logger into the expected web format, filling in host names in the info.
 *
 * @param gamelogInfos - The array of infos to format. It will not be mutated.
 * @param host - An optional hostname to use. Otherwise the os hostname is used.
 * @returns A new array of new gamelog infos with host names filled in.
 */
export function formatGamelogInfos(
    gamelogInfos: Immutable<IGamelogInfo[]>,
    host?: string,
): IGamelogInfo[] {
    return gamelogInfos.map((info) => ({
        ...info,
        // replace __HOSTNAME__ with the request's host for them, or a default hostname
        visualizerUrl: formatHostname(info.visualizerUrl, host),
        uri: formatHostname(info.uri, host),
    }));
}

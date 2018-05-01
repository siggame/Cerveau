// Exposed various uri schemes for other applications to query data from Cerveau
// Basically http responses that are not HTML, probably JSON

// import { Config } from "../../core/args";
import { Lobby } from "../../core/server/index";
// import { app } from "../app";

interface IRoomInfo {
    status: "empty" | "open" | "running" | "over";
    gameName: string;
    gameSession: string;
    gamelogFilename: string | undefined;
    numberOfPlayers: number;
    clients: Array<{
        name: string;
        index: number | undefined;
        spectating: boolean;
    }>;
}

/**
 * Gets the info for some session of some game
 *
 * @param gameAlias - name of the game
 * @param id - id of the session of that gameName
 * @returns information about the session for the api
 */
export function getRoomInfo(gameAlias: string, id: string): {

} | {
    error: string,
} {
    const lobby = Lobby.getInstance();
    const room = lobby.getRoom(gameAlias, id);

    if (room instanceof Error) {
        return {
            error: room.message,
        };
    }

    // If we got there, then we know the game name is valid now so there
    // has to be a namespace.
    const gameName = lobby.getGameNameForAlias(gameAlias)!;
    const gameNamespace = lobby.getGameNamespace(gameName)!;

    const info: IRoomInfo = {
        status: "empty",
        gameName,
        gameSession: id,
        gamelogFilename: undefined,
        numberOfPlayers: gameNamespace.GameManager.requiredNumberOfPlayers,
        clients: [],
    };

    if (!room) {
        // empty AND open to anyone
        return info;
    }

    // if the game session was found there should be some clients...
    for (const client of room.clients) {
        info.clients.push({
            name: client.name,
            index: client.playerIndex,
            spectating: client.isSpectating,
        });
    }

    if (!room.isRunning() && !room.isOver()) {
        // it has clients, but it still open more more before it starts running
        info.status = "open";
        return info;
    }

    if (room.isRunning()) {
        // on a separate thread running the game
        info.status = "running";
        return info;
    }

    // otherwise that game session should be over
    if (room.isOver()) {
        info.status = "over";
        info.gamelogFilename = room.gamelogFilename;

        /*
        for (const winner of room.winners!) {
            // FIXME: this is dumb
            const client = info.clients.find((c) => c.index === winner.index);
        }

        for(i = 0; i < room.losers.length; i++) {
            var loser = room.losers[i];
            client = info.clients[loser.index];

            client.lost = true;
            client.reason = loser.reason;
            client.disconnected = loser.disconnected;
            client.timedOut = loser.timedOut;
        }
        */

        return info;
    }

    return {
        error: "Requested game name and room are in an unexpected state of running while over.",
    };
}

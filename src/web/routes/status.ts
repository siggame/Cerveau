// Exposed various uri schemes for other applications to query data from Cerveau
// Basically http responses that are not HTML, probably JSON

import { Express } from "express";
import { Config } from "~/core/config";
import { Lobby } from "~/core/server/lobby";
import { objectHasProperty } from "~/utils";

/** Information about the room to be returned via the status API. */
interface IRoomInfo {
    status: "empty" | "open" | "running" | "over";
    gameName: string;
    gameSession: string;
    requiredNumberOfPlayers: number;
    gamelogFilename?: string | null;

    clients: Array<{
        // required
        name: string;
        spectating: boolean;

        // when over
        lost?: boolean;
        won?: boolean;
        reason?: string;
        disconnected?: boolean;
        timedOut?: boolean;
    }>;
}

/**
 * Gets the info for some session of some game
 *
 * @param gameAlias - name of the game
 * @param id - id of the session of that gameName
 * @returns information about the session for the api
 */
function getRoomInfo(gameAlias: string, id: string): { error: string } | IRoomInfo {
    const lobby = Lobby.getInstance();
    const room = lobby.getRoom(gameAlias, id);

    if (room instanceof Error) {
        return { error: room.message };
    }

    // If we got there, then we know the game name is valid now so there
    // has to be a namespace.
    const gameName = lobby.getGameNameForAlias(gameAlias);

    if (!gameName) {
        return { error: `${gameAlias} is no known game` };
    }

    const gameNamespace = lobby.getGameNamespace(gameName);

    if (!gameNamespace) {
        return { error: `${gameAlias} is no known game` };
    }

    const { requiredNumberOfPlayers } = gameNamespace.GameManager;

    const info: IRoomInfo = {
        status: "empty",
        gameName,
        gameSession: id,
        requiredNumberOfPlayers,
        clients: [],
    };

    if (!room) {
        // No room exists, so it is empty AND open to anyone
        return {
            status: "empty",
            gameName,
            gameSession: id,
            requiredNumberOfPlayers,
            clients: [],
        };
    }

    // if the game session was found there should be some clients...
    info.clients = room.clients.map((client) => ({
        name: client.name,
        spectating: client.isSpectating,
    }));

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
        info.gamelogFilename = room.gamelogFilename || null;

        for (let i = 0; room.clients.length; i++) {
            const client = room.clients[i];
            const clientInfo = info.clients[i];

            const { player } = client;
            if (player) {
                clientInfo.lost = player.lost;
                clientInfo.won = player.won;
                clientInfo.reason = player.reasonLost || player.reasonWon;
                clientInfo.disconnected = client.hasDisconnected();
                clientInfo.timedOut = client.hasTimedOut();
            }
        }

        return info;
    }

    return {
        error: "Requested game name and room are in an unexpected state of running while over.",
    };
}

/**
 * Registers the status route with some express app
 *
 * @param app - The Express app instance to register the route on
 */
export function registerRouteStatus(app: Express): void {
    if (!Config.API_ENABLED) {
        return;
    }

    /**
     * @apiGroup API
     */

    /**
     * @api {get} /status/:gameName/:gameSession Status
     * @apiName Status
     * @apiGroup API
     * @apiDescription When given a gameName and session id, responds with json
     * data about what is going on in that game session, including what clients
     * are connected.
     * @apiParam {string} gameName The name of the game (or an alias),
     * must be a valid game on the server.
     * @apiParam {string} gameSession The session id of the game you want to
     * check the status of.
     *
     * @apiSuccess {string} gameName  The actual name of the game,
     * e.g. "chess" -> "Chess".
     * @apiSuccess {string} gameSession The id of the session in that game.
     * @apiSuccess {string} gamelogFilename The filename (id) of the gamelog.
     * To get the actual gamelog use the /gamelog/:id part of the API. null
     * means the gamelog does not exist yet because it is still being written
     * to the filesystem.
     * @apiSuccess {string} status What the status of this game session is:
     *  * "empty" if the game session is valid, but does not exist because no
     *    clients have ever connected to it.
     *  * "open" if the game session has had a least 1 client connect, but the
     *    game has not started.
     *  * "running" if all players have connected, and the game is actively in
     *    progress, but not over.
     *  * "over" if the game session has ran to completion and clients have
     *    disconnected.
     *  * "error" otherwise, such as if the gameName was invalid.
     * @apiSuccess {number} numberOfPlayers The number of clients that are
     * playing needed to connect to make the game session start running.
     * @apiSuccess {Client[]} clients An array of clients currently in that
     * game session.
     *
     * @apiSuccess (Client) {number} [index] If the player requested, or was
     * assigned, a player index. When a game session reaches "running" this
     * will be set.
     * @apiSuccess (Client) {string} name The name of the client.
     * @apiSuccess (Client) {boolean} spectating If the client is a spectator
     * (not a playing client). Spectators will not have indexes.
     * @apiSuccess (Client) {boolean} [disconnected] If the client disconnected
     * unexpectedly during the game.
     * @apiSuccess (Client) {boolean} [timedOut] If the client timedOut and we
     * were forced to disconnect them during the game.
     * @apiSuccess (Client) {boolean} [won] If the player won this will be set,
     * and be true.
     * @apiSuccess (Client) {boolean} [lost] If the player lost this will be
     * set, and be true.
     * @apiSuccess (Client) {string} [reason] If the player won or lost this
     * will be the human readable reason why they did so.
     *
     * @apiSuccessExample {json} Empty
     *  {
     *      status: "empty",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      requiredNumberOfPlayers: 2
     *  }
     *
     * @apiSuccessExample {json} Open
     *  {
     *      status: "open",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      requiredNumberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              spectating: false
     *          }
     *      ]
     *   }
     *
     * @apiSuccessExample {json} Running
     *  {
     *      status: "running",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      requiredNumberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              spectating: false
     *          },
     *          {
     *              name: "Chess Python Player",
     *              spectating: false
     *          }
     *      ]
     *  }
     *
     * @apiSuccessExample {json} Over
     *  {
     *      status: "over",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      gamelogFilename: "2016.03.01.11.54.30.868-Chess-1",
     *      requiredNumberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              spectating: false,
     *              won: true,
     *              lost: false,
     *              reason: "Checkmate!"
     *          },
     *          {
     *              name: "Chess Python Player",
     *              spectating: false,
     *              won: false,
     *              lost: true,
     *              reason: "Checkmated."
     *          }
     *      ]
     *  }
     *
     * @apiSuccessExample {json} Almost Over
     *  In this example the game is over, but the gamelog is still being
     *  handled internally and is not available via the `gamelog/` API yet.
     *  {
     *      status: "over",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      gamelogFilename: null,
     *      requiredNumberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              spectating: false,
     *              won: true,
     *              lost: false,
     *              reason: "Checkmate!"
     *          },
     *          {
     *              name: "Chess Python Player",
     *              spectating: false,
     *              won: false,
     *              lost: true,
     *              reason: "Checkmated."
     *          }
     *      ]
     *  }
     *
     *
     *
     * @apiError {string} error A human readable string about what the error
     * was.
     * @apiError {string} [gameName] If the request was valid, but the gameName
     * was not a valid alias for a game, this is the gameName you sent us.
     *
     * @apiErrorExample {json} Unknown GameName
     *  HTTP/1.1 400 Bad Request
     *  {
     *      error: "Game name not valid",
     *      gameName: "unknownGameName"
     *  }
     */
    app.get("/status/:gameName/:gameSession", async (req, res) => {
        const params = req.params as {
            gameName: unknown;
            gameSession: unknown;
        };

        const gameName = String(params.gameName);
        const gameSession = String(params.gameSession);

        let info: { error: string } | IRoomInfo;
        if (!gameName || !gameSession) {
            info = { error: "gameName and gameSession are required" };

            return;
        }
        else {
            info = getRoomInfo(gameName, gameSession);
        }

        if (objectHasProperty(info, "error")) {
            res.status(400);
        }

        res.json(info);
    });
}

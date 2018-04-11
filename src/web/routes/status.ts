// Exposed various uri schemes for other applications to query data from Cerveau
// Basically http responses that are not HTML, probably JSON

import { Config } from "../../core/args";
import { Lobby } from "../../core/server/index";
import { app } from "../app";

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
 * @param gameName - name of the game
 * @param id - id of the session of that gameName
 * @returns information about the session for the api
 */
function getRoomInfo(gameName: string, id: string): {

} | {
    error: string,
} {
    const lobby = Lobby.getInstance();
    try {
        gameName = lobby.getGameNameForAlias(gameName);
    }
    catch (err) {
        return {
            error: err.message,
        };
    }

    const room = lobby.getRoom(gameName, id);

    const info: IRoomInfo = {
        status: "empty",
        gameName,
        gameSession: id,
        gamelogFilename: undefined,
        numberOfPlayers: room.gameNamespace, // why any?
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
        // on a seperate thread running the game
        info.status = "running";
        return info;
    }

    // otherwise that game session should be over
    if (room.isOver()) {
        info.status = "over";
        info.gamelogFilename = room.gamelogFilename;

        for (const winner of room.winners) {
            // FIXME: this is dumb
            const client = info.clients.find((c) => c.index === winner.playerIndex);
        }

        for(i = 0; i < room.losers.length; i++) {
            var loser = room.losers[i];
            client = info.clients[loser.index];

            client.lost = true;
            client.reason = loser.reason;
            client.disconnected = loser.disconnected;
            client.timedOut = loser.timedOut;
        }

        return info;
    }

    return {
        error: "Requested game name and room are in an unexpected state of running while over.",
    };
}

if (app && Config.API_ENABLED) {
    /**
     * @apiGroup API
     */

    /**
     * @api {get} /status/:gameName/:gameSession Status
     * @apiName Status
     * @apiGroup API
     * @apiDescription When given a gameName and session id, responds with json data about what is going on in that game session, including what clients are connected.
     * @apiParam {String} gameName      The name of the game (or an alias), must be a valid game on the server.
     * @apiParam {String} gameSession   The session id of the game you want to check the status of.
     *
     * @apiSuccess {String} gameName                    The actual name of the game, e.g. "chess" -> "Chess".
     * @apiSuccess {String} gameSession                 The id of the session in that game.
     * @apiSuccess {String} gamelogFilename             The filename (id) of the gamelog. To get the actual gamelog use the /gamelog/:id part of the API. null means the gamelog does not exist yet because it is still being written to the filesystem
     * @apiSuccess {String} status                      What the status of this game session is:
     *  * "empty" if the game session is valid, but does not exist because no clients have ever connected to it.
     *  * "open" if the game session has had a least 1 client connect, but the game has not started.
     *  * "running" if all players have connected, and the game is actively in progress, but not over.
     *  * "over" if the game session has ran to completion and clients have disconnected.
     *  * "error" otherwise, such as if the gameName was invalid.
     * @apiSuccess {Number} numberOfPlayers         The number of clients that are playing needed to connect to make the game session start running.
     * @apiSuccess {Client[]} clients               An array of clients currently in that game session.
     *
     * @apiSuccess (Client) {Number} [index]            If the player requested, or was assigned, a player index. When a game session reaches "running" this will be set.
     * @apiSuccess (Client) {String} name               The name of the client.
     * @apiSuccess (Client) {Boolean} spectating        If the client is a spectator (not a playing client). Spectators will not have indexes.
     * @apiSuccess (Client) {Boolean} [disconnected]    If the client disconnected unexpectedly during the game.
     * @apiSuccess (Client) {Boolean} [timedOut]          If the client timedOut and we were forced to disconnect them during the game.
     * @apiSuccess (Client) {Boolean} [won]             If the player won this will be set, and be true.
     * @apiSuccess (Client) {Boolean} [lost]            If the player lost this will be set, and be true.
     * @apiSuccess (Client) {String} [reason]           If the player won or lost this will be the human readable reason why they did so.
     *
     * @apiExample {json} Empty
     *  {
     *      status: "empty",
     *      gameName: "Chess",
     *      gameSession: "1"
     *  }
     *
     * @apiExample {json} Open
     *  {
     *      status: "open",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      numberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              spectating: false
     *          }
     *      ]
     *   }
     *
     * @apiExample {json} Running
     *  {
     *      status: "running",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      numberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              index: 0,
     *              spectating: false
     *          },
     *          {
     *              name: "Chess Python Player",
     *              index: 1,
     *              spectating: false
     *          }
     *      ]
     *  }
     *
     * @apiExample {json} Over
     *  {
     *      status: "over",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      gamelogFilename: "2016.03.01.11.54.30.868-Chess-1",
     *      numberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              index: 0,
     *              spectating: false,
     *              won: true,
     *              reason: "Checkmate!"
     *          },
     *          {
     *              name: "Chess Python Player",
     *              index: 1,
     *              spectating: false,
     *              lost: true,
     *              reason: "Checkmated."
     *          }
     *      ]
     *  }
     *
     *
     *
     * @apiError {String} error                     A human readable string about what the error was
     * @apiError {String} [gameName]                If the request was valid, but the gameName was not a valid alias for a game, this is the gameName you sent us.
     *
     * @apiErrorExample {json} Unknown GameName
     *  HTTP/1.1 400 Bad Request
     *  {
     *      error: "Game name not valid",
     *      gameName: "unknownGameName"
     *  }
     */
    app.get("/status/:gameName/:gameSession", function(req, res) {
        var gameName = req.params.gameName;
        var id = req.params.gameSession;

        var response;

        if(gameName && id) {
            response = _getSessionInfo(gameName, id);
        }

        response = response || { error: "gameName or gameSession not sent." };

        if(response.error) {
            response.status = "error";
            res.status(400); // bad request
        }

        res.json(response);
    });


    /**
     * @api {get} /gamelog/:id/ Gamelog
     * @apiName Get Gamelog
     * @apiGroup API
     * @apiDescription Simply given the id of a gamelog, responds with the gamelog if found. See [Gamelog formatting documentation](https://github.com/siggame/Cadre/blob/master/gamelog-format.md) for more infomation.
     * @apiParam {String} id    id of the gamelog, this is sent to clients when a game is over, and in status when a game is over.
     * @apiError (404) error    if the gamelog was not found.
     */
    app.get("/gamelog/:filename", function(req, res) {
        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let filename = req.params.filename || "";
        if(filename.endsWith(".json")) {
            filename = filename.replace(/\.[^/.]+$/, ""); // remove extension
        }

        lobby.gameLogger.getGamelog(filename, function(gamelog) {
            if(!gamelog) {
                res.status(404); // not found
                gamelog = {
                    error: "Gamelog not found.",
                };
            }

            res.json(gamelog);
        });
    });

    /**
     * @api {delete} /gamelog/:id/ Gamelog
     * @apiName Delete Gamelog
     * @apiGroup API
     * @apiDescription Simply given the id of a gamelog, tries to delete that gamelog.
     * @apiParam {String} id    id of the gamelog, this is sent to clients when a game is over, and in status when a game is over.
     *
     * @apiSuccess {Boolean} success        If the deletion was a success
     * @apiError (404) success              false if not found
     * @apiError (500) success              false if an error in deletion
     */
    app.delete("/gamelog/:filename", function(req, res) {
        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        lobby.gameLogger.deleteGamelog(req.params.filename, function(found, err) {
            var response = {
                success: Boolean(found),
            };

            if(!found) {
                res.status(404); // not found
                response.error = "Gamelog not found.";
            }

            if(err) {
                res.status(500); // internal server error
                response.error = err.message;
            }

            res.json(response);
        });
    });
};

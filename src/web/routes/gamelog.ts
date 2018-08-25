import { Express } from "express";
import { Lobby } from "~/core/server";

/**
 * Registers the gamelog/ route on a given Express app.
 *
 * @param app - The express app to register the route on.
 */
export function registerRouteGamelog(app: Express): void {
    const lobby = Lobby.getInstance();

    /**
     * @api {get} /gamelog/:filename/ Gamelog
     * @apiName Get Gamelog
     * @apiGroup API
     * @apiDescription Simply given the id of a gamelog, responds with the
     * gamelog If found. See [Gamelog formatting documentation](
     * https://github.com/siggame/Cadre/blob/master/gamelog-format.md) for more
     * information.
     * @apiParam {string} filename The filename (with no extension) of the
     * gamelog, this is sent to clients when a game is over,
     * and in status when a game is over.
     *
     * @apiSuccessExample {json} Gamelog found
     * {
     *      "gameName": "Anarchy",
     *      "gameSession": "1",
     *      "constants": { "DELTA_REMOVED": "&RM","DELTA_LIST_LENGTH": "&LEN" },
     *      "deltas": [ "A bunch of delta objects, not this string" ],
     *      "epoch": 1525474117946,
     *      "winners":[
     *          {
     *              "index": 1,
     *              "id": "1",
     *              "name":
     *              "Anarchy Lua Player",
     *              "reason": "Max turns reached (200) - You had the most buildings not burned down.",
     *              "disconnected": false,
     *              "timedOut": false
     *          }
     *      ],
     *      "losers":[
     *          {
     *              "index": 0,
     *              "id": "0",
     *              "name": "Anarchy JavaScript Player",
     *              "reason": "Max turns reached (200) - You had more buildings burned down than another player.",
     *              "disconnected": false,
     *              "timedOut": false
     *          }
     *      ],
     *      "settings":{
     *          "key": "value pairs of all the game settings used to initialize the game."
     *      }
     * }
     *
     * @apiError (404 Error) {string} error If the gamelog was not found.
     * @apiErrorExample {json} Gamelog not found
     * {
     *     "error": "Gamelog not found."
     * }
     */
    app.get("/gamelog/:filename", async (req, res, next) => {
        const params = req.params as {
            filename: unknown;
        };

        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        const filename = String(params.filename);
        const stream = await lobby.gamelogManager.getGamelogFileStream(
            filename,
        );

        if (!stream) {
            res.status(404);
            res.json({ error: "Gamelog not found." });

            return;
        }

        // Else it was ok!
        res.status(200);

        // The file stream is the gamelog already compressed as a gzipped json.
        // We don't need to process it or anything like that, we can just setup
        // the HTTP headers and pipe the file contents straight to the body.
        res.header("Content-Encoding", "gzip");
        res.header("Content-Type", "application/json");
        stream.pipe(res);
    });
}

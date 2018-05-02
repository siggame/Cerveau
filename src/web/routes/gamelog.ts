import { Lobby } from "~/core/server";
import { app } from "../app";

if (app) {
    const lobby = Lobby.getInstance();

    /**
     * @api {get} /gamelog/:id/ Gamelog
     * @apiName Get Gamelog
     * @apiGroup API
     * @apiDescription Simply given the id of a gamelog, responds with the
     * gamelog If found. See [Gamelog formatting documentation](
     * https://github.com/siggame/Cadre/blob/master/gamelog-format.md) for more
     * information.
     * @apiParam {String} id The id of the gamelog, this is sent to clients
     * when a game is over, and in status when a game is over.
     * @apiError (404) error If the gamelog was not found.
     */
    app.get("/gamelog/:filename", async (req, res, next) => {
        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        const filename: string = req.params.filename || "";
        const stream = await lobby.gameLogger.getGamelogFileStream(filename);

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

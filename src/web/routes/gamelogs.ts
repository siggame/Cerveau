import { Express } from "express";
import { Lobby } from "~/core/server";

/**
 * Registers the gamelogs/ route on a given Express app.
 *
 * @param app - The express app to register the route on.
 */
export function registerRouteGamelogs(app: Express): void {
    const lobby = Lobby.getInstance();

    /**
     * @api {get} /gamelogs Gamelogs
     * @apiName Get Gamelogs
     * @apiGroup API
     * @apiDescription Gets a list of gamelog ids (filenames) that are
     * available to get.
     *
     * @apiSuccessExample {json} Gamelogs found
     * [
     *   "2018.03.07.15.28.57.858-Anarchy-2.json.gz",
     *   "2018.04.25.14.35.18.795-Chess-1.json.gz",
     *   "2018.05.25.11.06.21.462-Spiders-Foo.json.gz"
     * ]
     */
    app.get("/gamelogs/", (req, res) => {
        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        res.status(200);
        res.json(
            lobby.gamelogManager.gamelogInfos.map((info) => info.filename),
        );
    });
}

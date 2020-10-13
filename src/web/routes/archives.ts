import { Express } from "express";
import { Config } from "~/core/config";
import { Lobby } from "~/core/server/lobby";
import { formatGamelogInfos } from "~/web/utils";

const DEFAULT_PAGE_COUNT = 20;

/**
 * Registers the archives/ route with a given Express app.
 *
 * @param app - The Express app instance to register the route to.
 */
export function registerRouteArchives(app: Express): void {
    if (Config.ARENA_MODE) {
        return;
    }

    const lobby = Lobby.getInstance();

    app.get("/archives/:gameName?/:pageStart?/:pageCount?", (req, res) => {
        const params = req.params as {
            /** The name of the game. */
            gameName: unknown;
            /** The start index to grab gamelogs starting at. */
            pageStart: unknown;
            /** The number of entries to get for this page. */
            pageCount: unknown;
        };

        const gameName = String(params.gameName || "all");

        let pageStart = Number(params.pageStart);
        if (isNaN(pageStart)) {
            pageStart = 1; // starting page
        }

        let pageCount = Number(params.pageCount);
        if (isNaN(pageCount)) {
            pageCount = DEFAULT_PAGE_COUNT; // starting page
        }

        const { gamelogInfos } = lobby.gamelogManager;
        const startIndex = Math.max(
            gamelogInfos.length - pageStart * pageCount,
            0,
        );
        const endIndex = startIndex + pageCount;

        // Because logs (all the gamelogs GamelogManager found) is pre-sorted
        // with the newest gamelogs at the END, startIndex starts at the end.
        // We want to first show the NEWEST gamelogs.
        const gamelogs = formatGamelogInfos(
            gamelogInfos.slice(startIndex, endIndex).reverse(),
            req.headers.host,
        );

        const newerUri =
            endIndex < gamelogInfos.length
                ? `/archives/${gameName}/${pageStart - 1}`
                : undefined;

        const olderUri =
            startIndex > 0
                ? `/archives/${gameName}/${pageStart + 1}`
                : undefined;

        res.render("archives", {
            gamelogs,
            newerUri,
            olderUri,
        });
    });
}

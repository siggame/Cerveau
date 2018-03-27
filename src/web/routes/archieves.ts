import { IGamelogInfo } from "../../core/game";
import { Lobby } from "../../core/server"; // TODO: why does src not work?
import { app } from "../app";

if (app) {
    app.get("/archives/:gameName?/:pageStart?/:pageCount?", async (req, res) => {
        const gameName = req.params.gameName || "all";

        let pageStart = Number(req.params.pageStart);
        if (isNaN(pageStart)) {
            pageStart = 1; // starting page
        }

        let pageCount = Number(req.params.pageCount);
        if (isNaN(pageCount)) {
            pageCount = 20; // default page count
        }

        const logs = await Lobby.getInstance().gameLogger.getLogs();
        const gamelogs: IGamelogInfo[] = [];

        const startIndex = Math.max(logs.length - (pageStart * pageCount), 0);
        const endIndex = Math.min(startIndex + pageCount, logs.length);

        // because logs (all the gamelogs GameLogger found) is pre-sorted with
        // the newest gamelogs at the END, startIndex starts at the end.
        // We want to first show the NEWEST gamelogs
        // also Array.slice is slow at the time of writting this code
        for (let i = endIndex - 1; i >= startIndex; i--) {
            gamelogs.push(logs[i]);
        }

        const newerUri = endIndex < logs.length
            ? `/archives/${gameName}/${pageStart - 1}`
            : undefined;

        const olderUri = startIndex > 0
            ? `/archives/${gameName}/${pageStart + 1}`
            : undefined;

        res.render("archives", {
            gamelogs,
            newerUri,
            olderUri,
        });
    });
}

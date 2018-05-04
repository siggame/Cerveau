import { Config } from "../../core/args";
import { Lobby } from "../../core/server";
import { app } from "../app";

// because this is also the index, we need to export barrels
export * from "./archives";
export * from "./gamelog";
export * from "./status";

// var getGameInfos = require("./getGameInfos");
// var formatGamelogs = require("./formatGamelogs");

const MAX_GAMELOGS_ON_INDEX = 10;

const games: Array<{
    name: string;
    description: string;
}> = [];

if (app && Config.WEB_ENABLED) {
    // then we need to show them the list of all games this server can play,
    // as well as the most recent game logs

    const lobby = Lobby.getInstance();
    lobby.gamesInitializedPromise.then(() => {
        for (const gameName of Object.keys(lobby.gameNamespaces)) {
            games.push({
                name: gameName,
                description: "TODO: do",
            });
        }
    });

    app.get("/", async (req, res) => {
        const logs = lobby.gamelogManager.gamelogInfos;

        // select the last 10 gamelogs from all the logs to render on the index
        const gamelogs = logs.slice(-MAX_GAMELOGS_ON_INDEX).reverse();

        res.render("index.hbs", {
            games,
            gamelogs,
            moreGamelogs: (gamelogs.length === MAX_GAMELOGS_ON_INDEX && logs.length > gamelogs.length),
        });
    });
}

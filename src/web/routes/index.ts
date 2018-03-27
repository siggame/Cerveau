import { Config } from "../../core/args";
import { IGamelogInfo } from "../../core/game/index";
import { Lobby } from "../../core/server";
import { app, appExists } from "../app";

// var getGameInfos = require("./getGameInfos");
// var formatGamelogs = require("./formatGamelogs");

const MAX_GAMELOGS_ON_INDEX = 10;

const games: Array<{
    gameName: string;
    description: string;
}> = [];

if (app) {
    if (Config.WEB_ENABLED) {
        // then we need to show them the list of all games this server can play,
        // as well as the most recent game logs

        for (const gameName of Object.keys(Lobby.getInstance().gameNamespaces)) {
            games.push({
                gameName,
                description: "TODO: do",
            });
        }

        app.get("/", async (req, res) => {
            const logs = await Lobby.getInstance().gameLogger.getLogs();
            const gamelogs: IGamelogInfo[] = [];
            for (let i = logs.length; i < MAX_GAMELOGS_ON_INDEX && i >= 0; i--) {
                gamelogs.push(logs[i]);
            }

            res.render("index", {
                games,
                gamelogs,
                moreGamelogs: (gamelogs.length === MAX_GAMELOGS_ON_INDEX && logs.length > gamelogs.length),
            });
        });
    }
}

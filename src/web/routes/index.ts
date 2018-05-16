import { Config } from "~/core/config";
import { ISettingsSchema } from "~/core/game";
import { Lobby } from "~/core/server";
import { app } from "../app";

// because this is also the index, we need to export barrels
export * from "./archives";
export * from "./gamelog";
export * from "./status";

// var getGameInfos = require("./getGameInfos");
// var formatGamelogs = require("./formatGamelogs");

const MAX_GAMELOGS_ON_INDEX = 10;

/** Setting for the view to expect. */
type Setting = ISettingsSchema<any> & {
    name: string;
};

const games: Array<{
    name: string;
    description: string;
    settings: Setting[];
}> = [];

if (app && Config.WEB_ENABLED) {
    // then we need to show them the list of all games this server can play,
    // as well as the most recent game logs

    const lobby = Lobby.getInstance();
    lobby.gamesInitializedPromise.then(() => {
        for (const gameName of Object.keys(lobby.gameNamespaces).sort()) {
            const namespace = lobby.gameNamespaces[gameName]!;
            const schema = namespace.gameSettingsManager.schema;

            const settings = [] as Setting[];
            for (const name of Object.keys(schema)) {
                const setting: ISettingsSchema<any> = (schema as any)[name];

                settings.push({ name, ...setting });
            }

            games.push({
                name: gameName,
                description: "TODO: do",
                settings,
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

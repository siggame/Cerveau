import { Express } from "express";
import { ISettingsSchema } from "~/core/game";
import { Lobby } from "~/core/server";

// because this is also the index, we need to export barrels

export * from "./archives";
export * from "./gamelog";
export * from "./status";

// var getGameInfos = require("./getGameInfos");
// var formatGamelogs = require("./formatGamelogs");

const MAX_GAMELOGS_ON_INDEX = 10;

/** Setting for the view to expect. */
type Setting = ISettingsSchema<unknown> & {
    name: string;
};

const games: Array<{
    name: string;
    description: string;
    settings: Setting[];
}> = [];

// if (app && Config.WEB_ENABLED) {
/**
 * Registers the index route for an Express app.
 *
 * @param app - The Express app instance to register the route on.
 */
export function registerRouteIndex(app: Express): void {
    // then we need to show them the list of all games this server can play,
    // as well as the most recent game logs

    const lobby = Lobby.getInstance();
    lobby.gamesInitializedPromise.then(() => {
        for (const gameName of Array.from(lobby.gameNamespaces.keys()).sort()) {
            const namespace = lobby.gameNamespaces.get(gameName);
            if (!namespace) {
                throw new Error(`${namespace} is not a game namespace!`);
            }

            const schema = namespace.gameSettingsManager.schema;

            // Clone all the settings in the schema to a version with its
            // name included for the index page to show game settings by name.
            const settings = [] as Setting[];
            for (const [ name, settingSchema ] of Object.entries(schema)) {
                settings.push({
                    name,
                    ...settingSchema as Setting,
                });
            }

            games.push({
                name: gameName,
                description: "", // TODO: do
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

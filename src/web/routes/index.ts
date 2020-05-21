import { Express } from "express";
import { URL } from "url";
import { SettingsSchema, SettingsSchemas } from "~/core/game";
import { Lobby } from "~/core/server";
import { formatGamelogInfos } from "~/web/utils";

// because this is also the index, we need to export barrels

export * from "./archives";
export * from "./gamelog";
export * from "./gamelogs";
export * from "./setup";
export * from "./status";

/** Setting for the view to expect. */
type Setting = SettingsSchema & {
    /** The name of the setting. */
    name: string;
};

const MAX_GAMELOGS_ON_INDEX = 10;

const games: Array<{
    /** The unique name of the game, used as an ID. */
    name: string;
    /** The human readable description of the game. Should be brief. */
    description: string;
    /** A list of settings available in this game. */
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
        for (const gameName of Array.from(
            lobby.gameNamespaces.keys(),
        ).sort()) {
            const namespace = lobby.gameNamespaces.get(gameName);
            if (!namespace) {
                throw new Error(`${namespace} is not a game namespace!`);
            }

            // Clone all the settings in the schema to a version with its
            // name included for the index page to show game settings by name.
            const settings = Object.keys(namespace.gameSettingsManager.schema)
                .sort()
                .map((name) => ({
                    name,
                    ...(namespace.gameSettingsManager
                        .schema as SettingsSchemas)[name],
                }));

            games.push({
                name: gameName,
                description: "", // TODO: do
                settings,
            });
        }
    });

    app.get("/", (req, res) => {
        // get the current gamelogs
        const logs = lobby.gamelogManager.gamelogInfos;
        const hostUrl = req.headers.host
            ? new URL(`http://${req.headers.host}/`)
            : undefined;

        const gamelogs = formatGamelogInfos(
            logs
                .slice(-MAX_GAMELOGS_ON_INDEX) // select the last 10 gamelogs from all the logs to render on the index
                .reverse(), // reverse the order, so that the last is the first element (latest) in the array
            hostUrl && hostUrl.hostname,
        );

        const activeRooms = lobby.getActiveRooms();

        res.render("index.hbs", {
            games,
            gamelogs,
            moreGamelogs:
                gamelogs.length === MAX_GAMELOGS_ON_INDEX && // If we're showing the max number of gamelogs now
                logs.length > gamelogs.length, // and there are still more logs remaining to show
            rooms: activeRooms.map((room) => ({
                id: room.id,
                gameName: room.gameNamespace.gameName,
                isRunning: room.isRunning(),
                clients: room.clients.map(({ name }) => name).join(", "),
                timeCreated: Number(room.timeCreated),
            })),
            hasActiveRooms: activeRooms.length > 0,
        });
    });
}

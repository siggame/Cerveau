import { isObject } from "~/utils";
import { Config } from "../../core/args";
import { Lobby } from "../../core/server";
import { app } from "../app";

const DEFAULT_PAGE_COUNT = 20;

if (app && Config.ARENA_MODE) {
    // Only expose this route for the arena.

    const lobby = Lobby.getInstance();

    app.post("/setup", async (req, res) => {
        if (!req.body || !isObject(req.body)) {
            res.status(400);
            res.json({ error: "No body sent." });
            return;
        }

        const errors = [] as string[];
        const gameAlias = String(req.body.gameName);
        const gameName = lobby.getGameNameForAlias(gameAlias);
        const gameNamespace = lobby.getGameNamespace(gameName);
        let numPlayers = -1;
        if (!gameName) {
            errors.push(`gameName ${gameAlias} is not a known game alias`);
        }
        else {
            numPlayers = gameNamespace!.GameManager.requiredNumberOfPlayers;
        }

        const session = String(req.body.session);
        if (!session || session === "*" || session === "new") {
            errors.push(`session ${session} is not valid`);
        }

        const gameSettings = req.body.gameSettings;
        if (!gameSettings) {
            errors.push("gameSettings is required");
        }
        else if (!gameSettings.playerNames) {
            errors.push("gameSettings.playerNames is required");
        }
        else if (!Array.isArray(gameSettings.playerNames)) {
            errors.push("gameSettings.playerNames must be an array");
        }
        else if (gameNamespace && gameSettings.playerNames.length !== numPlayers) {
            errors.push(`gameSettings.playerNames must be an array of length ${numPlayers}`);
        }

        if (errors.length > 0) {
            res.status(400);
            res.json({ error: errors.join("\n") });
            return;
        }

        // if we got here we know the structure of the body is sound.
        lobby.setup(req.body);
        res.status(200); // it was ok
        res.json({}); // empty object
    });
}

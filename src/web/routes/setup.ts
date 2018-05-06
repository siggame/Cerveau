import { isObject } from "~/utils";
import { Config } from "../../core/args";
import { Lobby } from "../../core/server";
import { app } from "../app";

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
        const gameNamespace = lobby.getGameNamespace(gameAlias);
        let numPlayers = -1;
        if (!gameNamespace) {
            errors.push(`gameName ${gameAlias} is not a known game alias`);
        }
        else {
            numPlayers = gameNamespace.GameManager.requiredNumberOfPlayers;
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

        if (errors.length === 0) {
            const error = lobby.setup(req.body as any);
            if (error) {
                errors.push(error);
            }
            else {
                // else it has now been setup successfully!
                res.status(200); // it was ok
                res.json({}); // empty object

                return; // to not respond with 400 below
            }
        }

        res.status(400);
        res.json({ error: errors.join("\n") });
    });
}

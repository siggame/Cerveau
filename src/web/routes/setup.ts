import { Express } from "express";
import { Config } from "~/core/config";
import { Lobby } from "~/core/server";
import { isObject } from "~/utils";

/**
 * Registers the setup/ route on an express app.
 *
 * @param app - The app to register the route on.
 */
export function registerRouteSetup(app: Express): void {
    // Only expose this route for the arena.
    if (!Config.ARENA_MODE) {
        return;
    }

    const lobby = Lobby.getInstance();

    /**
     * @api {post} /setup/ Setup
     * @apiName Setup game session
     * @apiGroup API
     * @apiDescription Sets up (reserves) a game session for specific clients
     * to play. Intended to be used **only** by the Arena, as this is disabled
     * in normal play.
     * The POST body **must** be valid JSON.
     *
     * @apiParam {string} gameName The name of the game (or alias) that the
     * clients will be playing.
     * @apiParam {string} session The id of the session to setup. Must not
     * conflict with any other sessions, and clients will need to connect to
     * this id when connecting to the game server after this succeeds.
     * when a game is over, and in status when a game is over.
     * @apiParam {string} [password] An optional string to password protect
     * the room setting up. When set all clients connecting must provide this
     * same password to connect.
     * @apiParam {GameSettings} gameSettings A key/value object of valid game
     * settings for the game. The only **required** gameSettings are
     * `playerNames`.
     * @apiParam {string[]} gameSettings.playerNames An array of strings to
     * force the clients player names to be. Must be an array of the exact same
     * length as the number of players for the game. When clients connect
     * these names will override the name they claim to use. So connect them
     * in order of who they are.
     * (e.g. Player 0 should connect first to get the first name).
     * game-settings.ts file for more information.
     *
     * @apiSuccessExample {json} Success Response
     * {}
     *
     * @apiError (400 Error) error A human readable message explaining why the sent
     * parameters do not work to setup a game session. No game session will be
     * set up in this case.
     * @apiErrorExample {json} Error Response
     * {
     *     "error": "gameName 'undefined' is not a known game alias"
     * }
     */
    app.post("/setup", async (req, res) => {
        if (!isObject(req.body as unknown)) {
            res.status(400);
            res.json({ error: "No body sent." });

            return;
        }

        const body = req.body as {
            gameName: unknown;
            gameSettings: unknown;
            password: unknown;
            session: unknown;
        };

        const errors = [] as string[];

        const gameAlias = String(body.gameName);
        const gameNamespace = lobby.getGameNamespace(gameAlias);
        let numPlayers = -1;
        if (!gameNamespace) {
            errors.push(`gameName '${gameAlias}' is not a known game alias`);
        }
        else {
            numPlayers = gameNamespace.GameManager.requiredNumberOfPlayers;
        }

        if (typeof body.session !== "string") {
            errors.push(`session id required`);
        }
        else if (body.session === "*" || body.session === "new") {
            errors.push(`session '${body.session}' is a reserved session name`);
        }
        const session = String(body.session);

        const gameSettings = body.gameSettings;
        if (!gameSettings || !isObject(gameSettings)) {
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

        let password: string | undefined;
        if (body.password) {
            if (typeof body.password === "string") {
                password = body.password;
            }
            else {
                errors.push("password must be a string");
            }
        }

        if (errors.length === 0 && isObject(gameSettings)) {
            const error = lobby.setup({
                gameAlias,
                gameSettings,
                password,
                session,
            });

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

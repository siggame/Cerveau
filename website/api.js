// Exposed various uri schemes for other applications to query data from Cerveau
// Basically http responses that are not HTML, probably JSON

var app = require("./app");

module.exports = function(args) {
    var lobby = args.lobby;

    /**
     * @apiGroup API
     */

    /**
     * @api {get} /status/:gameName/:gameSession Status
     * @apiName Status
     * @apiGroup API
     * @apiDescription When given a gameName and gameSession, responds with json data about what is going on in that game session, incuding what clients are connected.
     * @apiParam {String} gameName      The name of the game (or an alias), must be a valid game on the server.
     * @apiParam {String} gameSession   The session id of the game you want to check the status of.
     *
     * @apiSuccess {String} gameName            The actual name of the game, e.g. "chess" -> "Chess"
     * @apiSuccess {Strong} gameSession         The id of the session in that game
     * @apiSuccess {String} status              What the status of this game session is:
     *  * "empty" if the game session is valid, but does not exist because no clients have ever connected to it.
     *  * "open" if the game session has had a least 1 client connect, but the game has not started.
     *  * "running" if all players have connected, and the game is actively in progress, but not over.
     *  * "over" if the game session has ran to completion and clients have disconected.
     *  * "error" otherwise, such as if the gameName was invalid.
     * @apiSuccess {Number} numberOfPlayers     The number of clients that are playing needed to connect to make the game session start running
     * @apiSuccess {Client[]} clients           An array of clients currently in that game session.
     *
     * @apiSuccess (Client) {Number} [index]        If the player requested, or was assigned, a player index. When a game session reaches "running" this will be set.
     * @apiSuccess (Client) {String} name           The name of the client
     * @apiSuccess (Client) {Boolean} spectating    If they client is a spectator (not a playing client).
     * @apiSuccess (Client) {Boolean} [won]         If the player won this will be set, and be true
     * @apiSuccess (Client) {Boolean} [lost         If the player lost this will be set, and be true
     *
     * @apiExample {json} Empty
     *  {
     *      status: "empty",
     *      gameName: "Chess",
     *      gameSession: "1"
     *  }
     *
     * @apiExample {json} Open
     *  {
     *      status: "open",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      numberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              spectating: false
     *          }
     *      ]
     *   }
     *
     * @apiExample {json} Running
     *  {
     *      status: "running",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      numberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              index: 0,
     *              spectating: false
     *          },
     *          {
     *              name: "Chess Python Player",
     *              index: 1,
     *              spectating: false
     *          }
     *      ]
     *  }
     *
     * @apiExample {json} Over
     *  {
     *      status: "over",
     *      gameName: "Chess",
     *      gameSession: "1",
     *      numberOfPlayers: 2,
     *      clients: [
     *          {
     *              name: "Chess Lua Player",
     *              index: 0,
     *              spectating: false,
     *              won: true
     *          },
     *          {
     *              name: "Chess Python Player",
     *              index: 1,
     *              spectating: false,
     *              lost: true
     *          }
     *      ]
     *  }
     *
     *
     *
     * @apiError {String} error                     A human readable string about what the error was
     * @apiError {String} [gameName]                If the request was valid, but the gameName was not a valid alias for a game, this is the gameName you sent us.
     *
     * @apiErrorExample {json} Unknown GameName
     *  HTTP/1.1 400 Bad Request
     *  {
     *      error: "Game name not valid",
     *      gameName: "unknownGameName"
     *  }
     */
    app.get('/status/:gameName/:gameSession', function(req, res) {
        var response;
        if(req.params.gameName !== undefined && req.params.gameSession !== undefined) {
            response = lobby.getGameSessionInfo(req.params.gameName, req.params.gameSession);
        }
        else {
            response = { error: "gameName or gameSession not sent." };
        }

        if(response.error) {
            res.status(400); // bad request
        }

        res.json(response);
    });


    /**
     * @api {get} /gamelog/:id/ Gamelog
     * @apiName Gamelog
     * @apiGroup API
     * @apiDescription Simply given the id of a gamelog, responds with the gamelog if found. See [Gamelog formatting documentation](https://github.com/siggame/Cadre/blob/master/gamelog-format.md) for more infomation.
     * @apiParam {String} id    id of the gamelog, this is sent to clients when a game is over.
     */
    app.get('/gamelog/:filename', function(req, res) {
        var response = {}

        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        lobby.gameLogger.getGamelog(req.params.filename, function(gamelog) {
            res.json(gamelog || {
                error: "Gamelog not found.",
            });
        });
    });
};

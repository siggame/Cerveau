// Exposed various uri schemes for other applications to query data from Cerveau
// Basically http responses that are not HTML, probably JSON

var app = require("./app");

module.exports = function(args) {
    var lobby = args.lobby;

    app.get('/status/:gameName/:gameSession', function(req, res) {
        var response = {};
        if(req.params.gameName && req.params.gameSession) {
            var info = lobby.getGameSessionInfo(req.params.gameName, req.params.gameSession);
            if(!info.error) {
                response = info;
                response.status = (info.over === true ? "over" : "running");
                response.gamelog = undefined;
            }
            else {
                if(info.sessionID !== undefined) {
                    response.status = "open";
                }
                else {
                    response.status = "error";
                    response.error = info.error;
                    response.gameName = info.gameName;
                }
            }
        }
        else {
            response.status = "error";
            response.error = "gameName or gameSession not sent!";
        }

        res.json(response);
    });

    app.get('/gamelog/:gameName/:gameSession/:requestedEpoch?', function(req, res) {
        var response = {}

        // cross origin safety
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        if(!req.params.gameName || !req.params.gameSession) {
            res.json({
                error: "gameName or gameSession not sent!",
            });
        }
        else {
            var epoch = Number(req.params.requestedEpoch) || undefined;

            lobby.gameLogger.getGamelog(req.params.gameName, req.params.gameSession, epoch, function(gamelog) {
                if(gamelog) {
                    res.json(gamelog);
                }
                else {
                    res.json({
                        error: "gamelog not found",
                    });
                }
            });
        }
    });

    app.get('/visualize/:gameName/:gameSession/:requestedEpoch?', function(req, res) {
        res.render('visualize', req.params);
    });
};

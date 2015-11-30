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

    app.get('/visualize/:filename', function(req, res) {
        res.render('visualize', req.params);
    });

    app.get('/chesser/:filename?', function(req, res) {
        res.render('chesser', req.params);
    });
};

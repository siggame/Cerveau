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
        if(!req.params.gameName || !req.params.gameSession) {
            response.error = "gameName or gameSession not sent!";
        }
        else {
            req.params.requestedEpoch = req.params.requestedEpoch || 0;
            var gamelog = lobby.gameLogger.getLog(req.params.gameName, req.params.gameSession, req.params.requestedEpoch);

            if(gamelog) {
                response = gamelog;
            }
            else {
                response.error ="gamelog not found";
            }
        }

        res.json(response);
    });

    app.get('/visualize/:gameName/:gameSession/:requestedEpoch?', function(req, res) {
        res.render('visualize', req.params);
    });
};

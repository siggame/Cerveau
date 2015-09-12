var app = require(__basedir + "/app");
var getGameInfos = require("./getGameInfos");

module.exports = function(args) {
    var lobby = args.lobby;

    app.get('/', function(req, res){
        var gameInfos = getGameInfos();

        var games = [];
        for(var gameName in gameInfos) {
            if(gameInfos.hasOwnProperty(gameName)) {
                var gameInfo = gameInfos[gameName];
                games.push({
                    name: gameName,
                    description: gameInfo.Game.description,
                });
            }
        }

        games.sort(function(a, b) {
            return a.name.toLowerCase() > b.name.toLowerCase();
        });

        var logs = lobby.gameLogger.getLogs();
        var gamelogs = [];
        for(var i = 0; i < logs.length; i++) {
            var log = logs[i];
            gamelogs.push({
                game: log.gameName,
                session: log.gameSession,
                epoch: log.epoch,
                uri: log.gameName + "/" + log.gameSession + "/" + log.epoch,
            });
        }

        res.render('index', {
            games: games,
            gamelogs: gamelogs,
        });
    });

    // TODO: maybe more to /routes and have that auto require files like this?
    require("./api")(args);
    require("./documentation")(args);
};

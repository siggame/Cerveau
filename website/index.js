var app = require("./app");
var getGameInfos = require("./getGameInfos");

module.exports = function(args) {
    if(args.web) {
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

            var maxGamelogsOnIndex = 10;
            lobby.gameLogger.getLogs(function(logs) {
                var error = !logs;
                logs = logs || [];

                var gamelogs = [];
                var i = logs.length;

                while(i-- && gamelogs.length < maxGamelogsOnIndex) {
                    var log = logs[i];
                    gamelogs.push({
                        game: log.gameName,
                        session: log.gameSession,
                        epoch: log.epoch,
                        uri: lobby.gameLogger.filenameFor(log),
                    });
                }

                res.render("index", {
                    games: games,
                    gamelogs: gamelogs,
                    moreGamelogs: (gamelogs.length === maxGamelogsOnIndex && logs.length > gamelogs.length),
                });
            });
        });

        // TODO: maybe move to /routes and have that auto require files like this?
        require("./documentation")(args);
        require("./achieves")(args);
    }

    if(args.api) {
        require("./api")(args);
    }
};

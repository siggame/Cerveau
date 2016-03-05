var _init = {};

var formatGamelogs = function(logs, args) {
    var gamelogs = [];
    for(var i = 0; i < logs.length; i++) {
        var log = logs[i];
        gamelogs.push({
            game: log.gameName,
            session: log.gameSession,
            epoch: log.epoch,
            visualizer: log.gameName === "Chess" && _init.host ? "http://" + _init.host + ":5400/?file=" : "/visualize/",
            uri: _init.lobby.gameLogger.filenameFor(log),
        });
    }
    return gamelogs;
};

formatGamelogs.init = function(lobby, host) {
    _init.lobby = lobby;
    _init.host = host === "0.0.0.0" ? undefined : host;
};

module.exports = formatGamelogs;

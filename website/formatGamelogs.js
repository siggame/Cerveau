var _init = {};

var formatGamelogs = function(logs, args) {
    var gamelogs = [];
    for(var i = 0; i < logs.length; i++) {
        var log = logs[i];
        gamelogs.push({
            game: log.gameName,
            session: log.gameSession,
            epoch: log.epoch,
            visualizer: log.gameName === "Chess" && _init.args.chesser ? _init.args.chesser + "?file=" : "/visualize/",
            uri: _init.lobby.gameLogger.filenameFor(log),
        });
    }
    return gamelogs;
};

formatGamelogs.init = function(lobby, args) {
    _init.lobby = lobby;
    _init.args = args;
};

module.exports = formatGamelogs;

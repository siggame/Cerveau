var _init = {};

/**
 * A ulitily function for the website to format a list of gamelogs into view appropriate data
 * @param {Array.<Object>} logs - array of gamelogs
 * @returns {Array.<Object>} array of lighter weight object gamelogs for the view(s)
 */
var formatGamelogs = function(logs) {
    var gamelogs = [];
    var gameLogger = _init.lobby.gameLogger;
    for(var i = 0; i < logs.length; i++) {
        var log = logs[i];

        var filename = gameLogger.filenameFor(log);

        gamelogs.push({
            game: log.gameName,
            session: log.gameSession,
            epoch: log.epoch,
            gamelogURL: gameLogger.getSlug(filename),
            visualizerURL: gameLogger.getVisualizerURL(filename),
        });
    }
    return gamelogs;
};

formatGamelogs.init = function(lobby, args) {
    _init.lobby = lobby;
    _init.args = args;
};

module.exports = formatGamelogs;

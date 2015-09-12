var utilities = require("./utilities/");
var Class = utilities.Class;
var fs = require('fs');
var path = require('path');
var moment = require('moment');

/**
 * @class GameLogger: a simple manager that attaches to a directory and logs games (creates gamelogs) into that folder, as well as retrieves them from.
 */
var GameLogger = Class({
    /**
     * @param {string} dir: path to directory to log games into, and to read them from
     * @param {Array.<string>} gameNames: strings of all games that could be logged
     */
    init: function(dir, gameNames) {
        this.gamelogExtension = ".joue";
        this.gamelogDirectory = dir || 'gamelogs/';
        this.gamelogs = []; // simple array of gamelogs, not indexed by gameName, sessionID, epoch like this.gamelogFor

        this.gamelogFor = {};
        for(var i = 0; i < gameNames.length; i++) {
            this.gamelogFor[gameNames[i]] = {};
        }

        var filenames = utilities.getFiles(this.gamelogDirectory);
        for(var i = 0; i < filenames.length; i++) {
            var filename = filenames[i];
            if(filename.endsWith(this.gamelogExtension)) {
                (function(self, filename) {
                    fs.readFile(self.gamelogDirectory + filename, 'utf8', function (err, data) {
                        if (err) {
                            throw err;
                        }
                        var name = filename.substring(0, filename.length - self.gamelogExtension.length);
                        var gamelog = JSON.parse(data);

                        self.gamelogFor[gamelog.gameName] = self.gamelogFor[gamelog.gameName] || {}; // for gamelogs that had their plugin removed.
                        self.gamelogFor[gamelog.gameName][gamelog.gameSession] = self.gamelogFor[gamelog.gameName][gamelog.gameSession] || {};
                        self.gamelogFor[gamelog.gameName][gamelog.gameSession][gamelog.epoch] = gamelog;
                        self.gamelogs.push(gamelog);
                    });
                })(this, filename);
            }
        }
    },

    /**
     * Creates a gamelog for the game in the directory set during init
     *
     * @param {Object} the gamelog which should be serializable to json representation of the gamelog
     */
    log: function(gamelog) {
        var serialized = JSON.stringify(gamelog);
        var filename = moment(gamelog.epoch).format("YYYY.MM.DD.HH.mm.ss.SSS") + "-" + gamelog.gameName + "-" + gamelog.gameSession;

        // store it in memory, no need to read the file back in and deserialize it.
        this.gamelogFor[gamelog.gameName][gamelog.gameSession] = this.gamelogFor[gamelog.gameName][gamelog.gameSession] || {};
        this.gamelogFor[gamelog.gameName][gamelog.gameSession][gamelog.epoch] = gamelog;
        this.gamelogs.push(gamelog);

        fs.writeFile(this.gamelogDirectory + filename + this.gamelogExtension, serialized, function(err) {
            if(err) {
                console.error("Gamelog Write Error:", err);
            }
        }); 
    },

    /**
     * Gets all the gamelogs this GameLogger knows of.
     * 
     * @returns {Array<Object>} array of gamelogs matching
     */
    getLogs: function(filter) {
        // TODO: use the filter in the future
        return this.gamelogs;
    },

    /**
     * Gets the first game log matching the gameName, sessionID, and (optional) epoch
     *
     * @param {string} name of the game you want a log for
     * @param {string} id of the session that for the game
     * @param {number} (optional) epoch for the specific game ran of session id
     * @returns {Object|undefined} gamelog matching passed in parameters, or undefined if doesn't exist
     */
    getLog: function(gameName, sessionID, epoch) {
        if(!this.gamelogFor[gameName] || !this.gamelogFor[gameName][sessionID]) {
            return;
        }

        if(!epoch) { // then give them the latest gamelog
            var maxEpoch = 0;
            var gamelog = undefined;
            for(var gamelogEpoch in this.gamelogFor[gameName][sessionID]) {
                if(gamelogEpoch > maxEpoch) {
                    gamelog = this.gamelogFor[gameName][sessionID][gamelogEpoch];
                }
            }

            return gamelog;
        }
        else {
            return this.gamelogFor[gameName][sessionID][epoch];
        }
    }
});

module.exports = GameLogger;

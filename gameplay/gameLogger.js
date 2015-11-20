var utilities = require(__basedir + "/utilities/");
var Class = utilities.Class;
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');
var moment = require('moment');
var format = require("string-format");
var extend = require("extend");
var log = require("./log");

/**
 * @class GameLogger: a simple manager that attaches to a directory and logs games (creates gamelogs) into that folder, as well as retrieves them from.
 */
var GameLogger = Class({
    /**
     * @param {Array.<string>} gameNames - strings of all games that could be logged
     * @param {string} [dir] - path to directory to log games into, and to read them from
     */
    init: function(gameNames, options) {
        this.gamelogDirectory = (options && options.directory) || 'output/gamelogs/';

        if(options && options.arenaMode) {
            this._filenameFormat = "{gameName}-{gameSession}"; // TODO: upgrade arena so it can get the "real" filename with the moment string in it via RESTful API
        }
    },

    gamelogExtension: ".json.gz",
    usingCompression: true,
    _filenameFormat: "{moment}-{gameName}-{gameSession}", // default format

    /**
     * Creates a gamelog for the game in the directory set during init
     *
     * @param {Object} gamelog - the gamelog which should be serializable to json representation of the gamelog
     */
    log: function(gamelog) {
        var serialized = JSON.stringify(gamelog);
        var filename = this.filenameFor(gamelog);

        var path = (this.gamelogDirectory + filename + this.gamelogExtension);
        var writeSteam = fs.createWriteStream(path, 'utf8');
        var gzip = zlib.createGzip();

        gzip.on("error", function(err) {
            log.error("Could not save gamelog '" + gamelog.gameName + "' - '" + gamelog.gameSession + "'.", err);
        });

        gzip.pipe(writeSteam);
        gzip.write(serialized);
        gzip.end();
    },

    /**
     * Gets all the gamelogs this GameLogger knows of.
     * 
     * @returns {Array<Object>} array of gamelogs matching
     */
    getLogs: function(filter) {
        // TODO: use the filter in the future
        return []; // TODO: get back to working?
    },

    /**
     * Returns the expected filename to gamelog
     *
     * @static
     * @param {string|Object} gameName - name of the game, or an object with these parms as key/values
     * @param (string) gameSession - name of the session
     * @param {number} epoch - when thge gamelog was logged
     */
    filenameFor: function(gameName, gameSession, epoch) {
        var obj = {};
        if(typeof(gameName) === "object") {
            extend(obj, gameName);
        }
        else {
            obj.gameName = gameName;
            obj.gameSession = gameSession;
            obj.epoch = epoch;
        }

        if(obj.epoch) {
            obj.moment = utilities.momentString(obj.epoch)
        }

        return this._filenameFormat.format(obj);
    },

    /**
     * Gets the first game log matching the gameName, sessionID, and (optional) epoch
     *
     * @param {string} filename - the base filename (without gamelog extension) you want in output/gamelogs/
     * @returns {Object|undefined} gamelog matching passed in parameters, or undefined if doesn't exist
     */
    getGamelog: function(filename, callback) {
        var gamelogPath = path.join(this.gamelogDirectory, filename + this.gamelogExtension);

        fs.stat(gamelogPath, function(err, stats) {
            if(err || !stats.isFile()) {
                if(callback) {
                    callback(); // send no gamelog, as we couldn't find it
                }

                return;
            }

            var strings = [];
            var readStream = fs.createReadStream(gamelogPath)
                .pipe(zlib.createGunzip()) // Un-Gzip
                .on("data", function(buffer) {
                    strings.push(buffer.toString('utf8'));
                })
                .on("end", function() {
                    try {
                        var gamelog = JSON.parse(strings.join(''));
                    }
                    catch(err) {
                        return callback({
                            "error": "Error parsing gamelog."
                        });
                    }

                    callback(gamelog);
                });
        });
    },
});

module.exports = GameLogger;

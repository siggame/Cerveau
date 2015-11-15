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
        this.gamelogExtension = ".json.gz";
        this.usingCompression = true;
        this.gamelogDirectory = (options && options.directory) || 'output/gamelogs/';

        this._filenameFormat = "{moment}-{gameName}-{gameSession}";
        if(options && options.arenaMode) {
            this._filenameFormat = "{gameName}-{gameSession}"; // TODO: upgrade arena so it can get the "real" filename with the moment string in it via RESTful API
        }
    },

    /**
     * Creates a gamelog for the game in the directory set during init
     *
     * @param {Object} gamelog - the gamelog which should be serializable to json representation of the gamelog
     */
    log: function(gamelog) {
        var serialized = JSON.stringify(gamelog);
        var filename = this._filenameFor(gamelog);

        var path = (this.gamelogDirectory + filename);
        var writeSteam = fs.createWriteStream(path, 'utf8');
        var gzip = zlib.createGzip();

        gzip.on("error", function(err) {
            log.error("Could not save gamelog '" + gamelog.gameName + "' - '" + gamelog.gameSession + "'.", err);
        });

        gzip.pipe(writeSteam);
        gzip.write(serialized);
        gzip.end();

        delete gamelog;
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

    _filenameFor: function(gameName, gameSession, epoch) {
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

        return this._filenameFormat.format(obj) + this.gamelogExtension;
    },

    /**
     * Gets the first game log matching the gameName, sessionID, and (optional) epoch
     *
     * @param {string} gameName - name of the game you want a log for
     * @param {string} sessionID - id of the session that for the game
     * @param {number} [epoch] - the epoch for the specific game ran of session id
     * @returns {Object|undefined} gamelog matching passed in parameters, or undefined if doesn't exist
     */
    getGamelog: function(gameName, gameSession, epoch, callback) {
        var filename = this._filenameFor(gameName, gameSession, epoch);
        var gamelogPath = path.join(this.gamelogDirectory, filename);

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
                    var gamelog = JSON.parse(strings.join(''));
                    callback(gamelog);
                });
        });
    },
});

module.exports = GameLogger;

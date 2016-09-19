var utilities = require(__basedir + "/utilities/");
var Class = utilities.Class;
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');
var moment = require('moment');
var extend = require("extend");
var sanitize = require("sanitize-filename");
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

        if(options.arena) {
            this._filenameFormat = "{gameName}-{gameSession}"; // TODO: upgrade arena so it can get the "real" filename with the moment string in it via RESTful API
        }

        this._host = options.host;
        this._port = options.httpPort;
        this._visualizerURL = options.visualizerURL;
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
     * Gets all the gamelogs in output/gamelogs. The gamelogs are not complete, but rather a "shallow" gamelog.
     */
    getLogs: function(callback) {
        var self = this;
        fs.readdir(this.gamelogDirectory, function(err, files) {
            if(err) {
                return callback();
            }

            var gamelogs = [];
            for(var i = 0; i < files.length; i++) {
                var filename = files[i];
                if(filename.endsWith(self.gamelogExtension)) { // then it is a gamelog
                    var split = filename.split("-");
                    if(split.length === 3) { // then we can figure out what the game is based on file name
                        var session = split[2];
                        gamelogs.push({
                            filename: filename,
                            epoch: utilities.unMomentString(split[0]),
                            gameName: split[1],
                            gameSession: session.substring(0, session.length - self.gamelogExtension.length),
                        });
                    }
                }
            }

            callback(gamelogs);
        });
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
            obj.moment = utilities.momentString(obj.epoch);
        }

        return sanitize(this._filenameFormat.format(obj));
    },

    /**
     * checks to see if the filename maps to a gamelog
     *
     * @param {string} filename - the base filename (without gamelog extension) you want in output/gamelogs/
     * @param {function} callback - passes the true path to the file if exists, no args otherwise
     */
    _checkGamelog: function(filename, callback) {
        var gamelogPath = path.join(this.gamelogDirectory, filename + this.gamelogExtension);

        fs.stat(gamelogPath, function(err, stats) {
            callback(err || !stats.isFile() ? undefined : gamelogPath, err);
        });
    },

    /**
     * Gets the first gamelog matching the filename, without the extension
     *
     * @param {string} filename - the base filename (without gamelog extension) you want in output/gamelogs/
     * @param {function} callback - passes the gamelog matching passed in parameters, or undefined if no gamelog. second arg is error.
     */
    getGamelog: function(filename, callback) {
        this._checkGamelog(filename, function gamelogChecked(gamelogPath) {
            if(!gamelogPath) {
                return callback();
            }

            var strings = [];
            var readStream = fs.createReadStream(gamelogPath)
                .pipe(zlib.createGunzip()) // Un-Gzip
                .on("data", function(buffer) {
                    strings.push(buffer.toString('utf8'));
                })
                .on("end", function() {
                    var gamelog;
                    try {
                        gamelog = JSON.parse(strings.join(''));
                    }
                    catch(err) {
                        return callback(undefined, {
                            "error": "Error parsing gamelog."
                        });
                    }

                    callback(gamelog);
                });
        });
    },

    /**
     * Deletes the first gamelog matching the filename, without the extension
     *
     * @param {string} filename - the base filename (without gamelog extension) you want in output/gamelogs/
     * @param {function} callback - passes the a boolean if it was scuessfully deleted, and the error if error happened.
     */
    deleteGamelog: function(filename, callback) {
        this._checkGamelog(filename, function gamelogChecked(gamelogPath) {
            if(!gamelogPath) {
                return callback(false);
            }

            fs.unlink(gamelogPath, function(err) {
                callback(!err, err);
            });
        });
    },

    /**
     * Returns a url string to the gamelog
     * @param {string} filename - filename of the url, or the gamelog itself
     */
    getURL: function(filename) {
        if(typeof(filename) === "object") {
            filname = this.filenameFor(filename);
        }

        return "http://{}:{}/gamelog/{}".format(
            this._host,
            this._port,
            filename
        );
    },

    /**
     * Returns a url to the visualizer for said gamelog
     * @param {tring|Object} gamelog - string gamelog filename or the gamelog itself
     * @returns {string|undefined} undefined if no visualizer, url to the gamelog in visualizer otherwise
     */
    getVisualizerURL: function(gamelog) {
        if(this._visualizerURL) {
            var url = this.getURL(gamelog);

            return this._visualizerURL + "?log=" + encodeURIComponent(url);
        }
    },
});

module.exports = GameLogger;

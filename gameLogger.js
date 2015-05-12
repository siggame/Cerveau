var Class = require("./utilities/class");
var fs = require('fs');
var path = require('path');
var moment = require('moment');

/// simple function to get files in a directory. TODO: might move to our own FileIO ultilites file.
function getFiles(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
};

/// @class GameLogger: a simple manager that attaches to a directory and logs games (creates gamelogs) into that folder, as well as retrieves them from.
var GameLogger = Class({
	// @param {string} dir: path to directory to log games into, and to read them from
	// @param {Array.<string>} gameNames: strings of all games that could be logged
	init: function(dir, gameNames) {
		this.gamelogExtension = ".joue";
		this.gamelogsDirectory = dir || 'gamelogs/';

		this.gamelogs = {};
		for(var i = 0; i < gameNames.length; i++) {
			this.gamelogs[gameNames[i]] = {};
		}

		var filenames = getFiles(this.gamelogsDirectory);
		for(var i = 0; i < filenames.length; i++) {
			var filename = filenames[i];
			if(filename.endsWith(this.gamelogExtension)) {
				(function(self, filename) {
					fs.readFile(self.gamelogsDirectory + filename, 'utf8', function (err, data) {
						if (err) {
							throw err;
						}
						var name = filename.substring(0, filename.length - self.gamelogExtension.length);
						var gamelog = JSON.parse(data);

						self.gamelogs[gamelog.gameName] = self.gamelogs[gamelog.gameName] || {}; // for gamelogs that had their plugin removed.
						self.gamelogs[gamelog.gameName][gamelog.gameSession] = self.gamelogs[gamelog.gameName][gamelog.gameSession] || {};
						self.gamelogs[gamelog.gameName][gamelog.gameSession][gamelog.epoch] = gamelog;
					});
				})(this, filename);
			}
		}
	},

	/// creates a gamelog for the game in the directory set during init
	// @param gamelog {object} valid json representation of the gamelog
	log: function(gamelog) {
		var serialized = JSON.stringify(gamelog);
		var filename = moment(gamelog.epoch).format("YYYY.MM.DD.HH.mm.ss.SSS") + "-" + gamelog.gameName + "-" + gamelog.gameSession;

		// store it in memory, no need to read the file back in and deserialize it.
		this.gamelogs[gamelog.gameName][gamelog.gameSession] = this.gamelogs[gamelog.gameName][gamelog.gameSession] || {};
		this.gamelogs[gamelog.gameName][gamelog.gameSession][gamelog.epoch] = gamelog;

		fs.writeFile(this.gamelogsDirectory + filename + this.gamelogExtension, serialized, function(err) {
			if(err) {
				console.error("Gamelog Write Error:", err);
			}
		}); 
	},

	/// gets all the gamelogs this GameLogger knows of.
	getLogs: function(filters) {
		filters = filters || {}; // TODO: use

		return this.gamelogs;
	},

	getLog: function(gameName, sessionID, epoch) {
		if(!this.gamelogs[gameName] || !this.gamelogs[gameName][sessionID]) {
			return;
		}

		if(!epoch) { // then give them the latest gamelog
			var maxEpoch = 0;
			var gamelog = undefined;
			for(var gamelogEpoch in this.gamelogs[gameName][sessionID]) {
				if(gamelogEpoch > maxEpoch) {
					gamelog = this.gamelogs[gameName][sessionID][gamelogEpoch];
				}
			}

			return gamelog;
		}
		else {
			return this.gamelogs[gameName][sessionID][epoch];
		}
	}
});

module.exports = GameLogger;

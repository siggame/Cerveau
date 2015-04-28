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
	// @param <string> dir: path to directory to log games into, and to read them from
	init: function(dir) {
		this.gamelogExtension = ".joue";
		this.gamelogsDirectory = dir || 'gamelogs/';

		var filenames = getFiles(this.gamelogsDirectory);
		this.gamelogs = {};

		for(var i = 0; i < filenames.length; i++) {
			var filename = filenames[i];
			if(filename.endsWith(this.gamelogExtension)) {
				(function(self, filename) {
					fs.readFile(self.gamelogsDirectory + filename, 'utf8', function (err, data) {
						if (err) {
							throw err;
						}
						var name = filename.substring(0, filename.length - self.gamelogExtension.length);
						self.gamelogs[name] = JSON.parse(data);
					});
				})(this, filename);
			}
		}
	},

	/// creates a gamelog for the game in the directory set during init
	// @p
	log: function(gamelog) {
		var serialized = JSON.stringify(gamelog);
		var filename = moment(gamelog.epoch).format("YYYY.MM.DD.HH.mm.ss.SSS") + "-" + gamelog.gameName + "-" + gamelog.gameSession;

		this.gamelogs[filename] = gamelog;

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
});

module.exports = GameLogger;

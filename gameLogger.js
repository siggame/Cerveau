var Class = require("./structures/class");
var fs = require('fs');
var path = require('path');
var moment = require('moment');

function getFiles(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
};


var GameLogger = Class({
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
						console.log("found gamelog", name);
						self.gamelogs[name] = JSON.parse(data);
					});
				})(this, filename);
			}
		}
	},

	log: function(game) {
		var m = moment();
		var gamelog = {
			gameName: (game.name !== undefined ? game.name : "UNKNOWN_GAME"),
			gameSession: (game.session !== undefined ? game.session : "UNKNOWN_SESSION"),
			states: game.states,
			epoch: m.valueOf(),
		}

		var serialized = JSON.stringify(gamelog);
		var filename = m.format("YYYY.MM.DD.HH.mm.ss.SSS") + "-" + gamelog.gameName + "-" + gamelog.gameSession;

		this.gamelogs[filename] = gamelog;

		fs.writeFile(this.gamelogsDirectory + filename + this.gamelogExtension, serialized, function(err) {
			if(err) {
				console.log(err);
			}
		}); 
	},

	getLogs: function(filters) {
		filters = filters || {}; // TODO: use

		return this.gamelogs;
	},
});

module.exports = GameLogger;

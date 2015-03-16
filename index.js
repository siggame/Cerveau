var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var expressHbs = require('express3-handlebars');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
require("./extensions/string");
require("./extensions/array");

var Server = require("./server");

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
};

//http://runnable.com/U07z_Y_j9rZk1tTx/handlebars-template-examples-with-express-4-for-node-js

http.listen(3000, function(){
	console.log('---- listening on *:3000 ----');
});

var server = new Server(io);




app.engine('hbs', expressHbs({
	extname:'hbs',
	defaultLayout:'main.hbs',
	helpers: {
		formatDate: function (date, format) {
			return moment(date).format(format);
		}
	},
}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
	gameFolders = getDirectories("games/");
	games = [];
	for(var i = 0; i < gameFolders.length; i++) {
		var gameFolder = gameFolders[i];
		if(!gameFolder.startsWith("_")) {
			games.push({
				name: gameFolder,
				description: "this would be the game description...",
			});
		}
	}

	logs = server.gameLogger.getLogs();
	gamelogs = [];
	for(var filename in logs) {
		var log = logs[filename];
		gamelogs.push({
			game: log.gameName,
			session: log.gameSession,
			epoch: log.epoch,
			uri: encodeURIComponent(filename),
		});
	}

	res.render('index', {
		games: games,
		gamelogs: gamelogs,
	});
});

app.get('/visualizer', function(req, res) {
	res.render('visualizer');
});

// GET /static/style.css etc.
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/gamelogs', express.static(__dirname + '/gamelogs'));

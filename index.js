var express = require('express');
var app = express();
var http = require('http').Server(app);
var expressHbs = require('express-handlebars');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var extend = require('extend');
var argh = require("argh");
var args = argh.argv;
require("./extensions/"); // extends built in JavaScript objects. Extend with care, prototypes can get funky if you are not careful

var Server = require("./server");

// Note: most of this file is just PoC level.

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
};

//http://runnable.com/U07z_Y_j9rZk1tTx/handlebars-template-examples-with-express-4-for-node-js

http.listen(3000, function(){
	console.log('---- running on *:3000 ----');
});

var server = new Server("127.0.0.1", 3000, args); // the game server for clients to connect to




app.engine('hbs', expressHbs({
	extname:'hbs',
	defaultLayout:'main.hbs',
	helpers: {
		formatDate: function (date, format) {
			return moment(date).format(format);
		},
	},
}));
app.set('view engine', 'hbs');

var gameInfos = {};

function initGameInfos() {
	var gameFolders = getDirectories("games/");
	for(var i = 0; i < gameFolders.length; i++) {
		var gameFolder = gameFolders[i];
		if(!gameFolder.startsWith("_")) {
			gameInfos[gameFolder] = gameInfos[gameFolder] || require('./games/' + gameFolder + "/gameInfo.json");
		}
	}
};

app.get('/', function(req, res){
	initGameInfos();

	var games = [];
	for(var gameName in gameInfos) {
		if(gameInfos.hasOwnProperty(gameName)) {
			var gameInfo = gameInfos[gameName];
			games.push({
				name: gameName,
				description: gameInfo.Game.description,
			});
		}
	}

	games.sort(function(a, b) {
		return a.name.toLowerCase() > b.name.toLowerCase();
	});

	var logs = server.gameLogger.getLogs();
	var gamelogs = [];
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

var docDatas = {};
app.get('/documentation/:gameName', function(req, res) {
	var gameName = req.params.gameName;
	initGameInfos();
	var gameInfo = gameInfos[gameName];

	if(!docDatas[gameName]) {
		classes = [];

		var objects = extend({'Game': gameInfo.Game}, gameInfo.gameObjects);

		function sortNames(a, b) {
			return a.name.toLowerCase() > b.name.toLowerCase();
		};

		function formatVariable(variable) {
			if(variable.type === "dictionary") {
				variable.type = "dictionary<" + variable.keyType + ", " + variable.valueType + ">";
			}
			else if(variable.type === "array") {
				variable.type = "array<" + variable.subType + ">";
			}

			if(variable.type === "boolean" && variable['default'] !== undefined) {
				variable['default'] = String(variable['default']);
			}

			if(variable.type === "string" && variable['default'] !== undefined) {
				variable['default'] = '"' + variable['default'] + '"';
			}
		};

		var gameClass = undefined;
		for(var objName in objects) {
			if(objects.hasOwnProperty(objName)) {
				var gameObject = objects[objName];
				var docClass = extend({}, gameObject, {
					name: objName,
					attributes: [],
					functions: [],
				});

				function addTo(array, dict) {
					for(var key in dict) {
						if(!key.startsWith("_") && dict.hasOwnProperty(key)) {
							array.push(extend({name: key}, dict[key]));
						}
					}
				};

				addTo(docClass.attributes, gameObject.attributes);
				addTo(docClass.attributes, gameObject.inheritedAttributes);
				docClass.attributes.sort(sortNames);
				for(var i = 0; i < docClass.attributes.length; i++) {
					formatVariable(docClass.attributes[i]);
				}

				addTo(docClass.functions, gameObject.functions);
				addTo(docClass.functions, gameObject.inheritedFunctions);
				docClass.functions.sort(sortNames);
				for(var i = 0; i < docClass.functions; i++) {
					for(var j = 0; j < docClass.functions[i].arguments.length; j++) {
						formatVariable(docClass.functions[i].arguments[j]);
					}
				}

				classes.push(docClass);

				if(docClass.name == "Game") {
					gameClass = docClass;
				}
			}
		}

		classes.removeElement(gameClass);

		classes.sort(sortNames);
		classes.unshift(gameClass);

		docDatas[gameName] = classes;
	}

	res.render('documentation', {
		gameName: gameName,
		classes: docDatas[gameName],
	});
});



// GET /static/style.css etc.
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/gamelogs', express.static(__dirname + '/gamelogs'));

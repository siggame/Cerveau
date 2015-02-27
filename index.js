var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require("./extensions/utilities");
require("./extensions/string");
require("./extensions/array");

var Server = require("./server");

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
	console.log('---- listening on *:3000 ----');
});

var server = new Server(io);

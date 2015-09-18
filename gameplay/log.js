var colors = require("colors");
var utilities = require(__basedir + "/utilities");
var server = process._gameplayServer;
var fs = require("fs");
var util = require("util");
var cluster = require("cluster");
var _obj = {};

var log = function(/* ... */) {
    _obj.log(null, arguments);
};

_obj.error = function(/* ... */) {
    _obj.log(colors.red, arguments);
};

_obj.debug = function(/* ... */) {
    _obj.log(colors.cyan, arguments);
}

_obj.log = function(colorFunction, argsArray) {
    _obj.server = _obj.server || process._gameplayServer;

    var str = util.format.apply(util, argsArray);
    if(_obj.server && _obj.server.logging) {
        _obj.filename = (_obj.filename || ("output/logs/log-" + _obj.server.name.replace(/ /g, ".") + "-" + utilities.momentString() + ".txt"));
        fs.appendFile(_obj.filename, str + "\n");
    }

    if(!_obj.server || !_obj.server.silent) {
        if(colorFunction) {
            str = colorFunction(str);
        }
        if(_obj.server) {
            if(!_obj.nameColor) {
                var bgColor = "White";
                var color = "Black";
                var colorsArray = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan"];
                colorsArray.shuffle();

                if(!cluster.isMaster) {
                    bgColor = colorsArray.pop();
                    colorsArray.push("White");
                    colorsArray.shuffle();

                    switch(bgColor) {
                        case "Magenta":
                            colorsArray.removeElement("Red");
                            break;
                        case "Red":
                            colorsArray.removeElement("Magenta");
                    }
                    color = colorsArray.pop();
                }
                _obj.nameColor = colors[color.toLowerCase()]["bg" + bgColor];

                if(!cluster.isMaster && Math.floor(Math.random() * 2)) {
                    _obj.nameColor =  _obj.nameColor.bold;
                }
            }
            str = _obj.nameColor(_obj.server.name) + " " + str;
        }
        console.log(str);
    }
}

module.exports = log;

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
                var bgColor = "bgWhite";
                if(!cluster.isMaster) {
                    bgColor = "bg" + ["Red", "Green", "Yellow", "Blue", "Magenta", "Cyan"].randomElement()
                }
                _obj.nameColor = colors.black[bgColor];
            }
            str = _obj.nameColor(_obj.server.name) + " " + str;
        }
        console.log(str);
    }
}

module.exports = log;

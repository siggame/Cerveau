var colors = require("colors");
var utilities = require(__basedir + "/utilities");
var server = process._gameplayServer;
var fs = require("fs");
var util = require("util");
var cluster = require("cluster");
var _obj = {};

/**
 * logs variables, replaces console.log() -> log()
 *
 * @param {...*} arguments - anything you'd log just like console.log
 */
var log = function(/* ... */) {
    _obj.log(arguments);
};

/**
 * logs variables to the error steam, replaces console.error() -> log()
 *
 * @param {...*} arguments - anything you'd log just like console.log
 */
_obj.error = function(/* ... */) {
    _obj.log(arguments, colors.red);
};

/**
 * logs variables to the debug stream, replaces console.debug() -> log()
 *
 * @param {...*} arguments - anything you'd log just like console.log
 */
_obj.debug = function(/* ... */) {
    _obj.log(arguments, colors.cyan);
}

/**
 * logs to stdio and/or files
 *
 * @param {Array} argsArray - arguments to log from another function
 * @param {colors.builder} [colorFunction] - text color using the colors module
 */
_obj.log = function(argsArray, colorFunction) {
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
            if(!_obj.nameColor) { // color for the name
                var bgColor = "White";
                var color = "Black";
                var colorsArray = ["Red", "Green", "Yellow", "Blue", "Magenta", "Cyan"];
                colorsArray.shuffle();

                if(!cluster.isMaster) { // make the color random
                    bgColor = colorsArray.pop();
                    colorsArray.push("White", "Black");
                    colorsArray.shuffle();

                    switch(bgColor) {
                        case "Magenta":
                            colorsArray.removeElement("Red");
                            break;
                        case "Red":
                            colorsArray.removeElement("Magenta");
                            break;
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

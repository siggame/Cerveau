var colors = require("colors");
var utilities = require(__basedir + "/utilities");
var server = process._gameplayServer;
var fs = require("fs");
var os = require("os");
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
log.error = function(/* ... */) {
    if(arguments[0] instanceof Error) {
        var err = arguments[0];
        console.log(err.loc);
        arguments[0] = "Error logged:\n{name}\n---\n{message}\n---\n{stack}\n---\n{syscall}\n---".format(err);
    }
    _obj.log(arguments, colors.red.bold);
};

/**
 * logs variables to the debug stream, replaces console.debug() -> log()
 *
 * @param {...*} arguments - anything you'd log just like console.log
 */
log.debug = function(/* ... */) {
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

    var str = util.format.apply(util, argsArray).replace(/\\/, os.EOL);
    if(_obj.server && _obj.server.logging) {
        _obj.filename = (_obj.filename || ("output/logs/log-" + _obj.server.name.replace(/ /g, ".") + "-" + utilities.momentString() + ".txt"));
        fs.appendFile(_obj.filename, str + os.EOL);
    }

    if(_obj.server) {
        if(!_obj.server.silent) {
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
    else {
        console.log.apply(console, argsArray);
    }
}

module.exports = log;

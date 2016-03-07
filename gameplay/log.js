var colors = require("colors");
var moment = require("moment");
var utilities = require(__basedir + "/utilities");
var server = process._gameplayServer;
var fs = require("fs");
var os = require("os");
var util = require("util");
var cluster = require("cluster");
var _obj = {};

/**
 * Pairs of colors that cannot be foreground/backgrounsd together because it's too hard to read
 *
 * @type {Array.<Array<string>>} every element is a pair of two strings representing two colors that should never be paired for Instance color pairs, as they are too hard to read.
 */
var _disallowedColorsPairs = [
    [ "Magenta",  "Red" ],
    [ "Magenta", "Red Bold" ],
    [ "Magenta", "Blue Bold" ],
    [ "Yellow",  "White" ],
    [ "Green", "Yellow" ],
    [ "Green", "Cyan" ],
    [ "Blue", "Magenta" ],
    [ "Blue", "Black" ],
    [ "Green", "White" ],
    [ "Cyan", "White" ],
    [ "Yellow", "White" ],
    [ "Blue", "Black Bold" ],
    [ "Magenta", "Black Bold" ],
    [ "Red", "Black Bold" ],
    [ "White", "Black" ], // Because that's the Lobby's color
    [ "White", "Black Bold" ] // and this is too similar to above
];

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

            if(_obj.server && !_obj.nameColor) { // we need to color the name!
                var bgColor = "White";
                var fgColor = "Black"; // default color for the Lobby

                if(!cluster.isMaster) { // then we are a child thread (Instance), so make the color a random pair
                    var colorsArray = ["Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];
                    colorsArray.shuffle();

                    bgColor = colorsArray.pop();

                    // now find the foreground color
                    colorsArray.push("Black");
                    var n = colorsArray.length;
                    for(var i = 0; i < n; i++) {
                        colorsArray.push(colorsArray[i] + " Bold");
                    }

                    // remove disallowed color combinations
                    for(var i = 0; i < _disallowedColorsPairs.length; i++) {
                        var pair = _disallowedColorsPairs[i];

                        var index = pair.indexOf(bgColor);
                        if(index > -1) { // then one of the pairs is the bgColor, so remove the other so it can't be a foreground color
                            colorsArray.removeElement(pair[1 - index]); // 1 - 0 == 1 and 1 - 1 === 0, so we basically flip the index to the other pair's index
                        }
                    }

                    colorsArray.shuffle();

                    fgColor = colorsArray.pop();
                }
                var fgSplit = fgColor.split(" ");
                _obj.nameColor = colors[fgSplit[0].toLowerCase()]["bg" + bgColor];

                if(fgSplit[1] === "Bold") {
                    _obj.nameColor =  _obj.nameColor.bold;
                }
            }

            console.log("[{time}] {colored} {str}".format({
                time: colors.green(moment().format("HH:mm:ss.SSS")),
                colored: _obj.nameColor ? _obj.nameColor(" " + _obj.server.name + " ") : "???",
                str: str,
            }));
        }
    }
    else { // they are using log before the server has been initialized
        console.log.apply(console, argsArray);
    }
}

module.exports = log;

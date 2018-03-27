// import { isMaster } from "cluster";
import * as colors from "colors";
// import { appendFile } from "fs";
// import * as moment from "moment";
// import { EOL } from "os";

/**
 * Pairs of colors that cannot be foreground/background together because it's too hard to read
 */
/*
const disallowedColorsPairs: Array<[string, string]> = [
    [ "Magenta", "Red" ],
    [ "Magenta", "Red Bold" ],
    [ "Magenta", "Blue Bold" ],
    [ "Yellow", "White" ],
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
    [ "White", "Black Bold" ], // and this is too similar to above
];

const cached: {
    filename?: string;
    color?: colors.Color;
} = {};
*/

interface ILogger {
    /**
     * Logs text to the terminal, as a replacement for console.log
     */
    (...args: any[]): void;

    /** Logs text to the terminal, as a replacement for console.error */
    error: (...args: any[]) => void;

    /** Logs text to the terminal, as a replacement for console.debug */
    debug: (...args: any[]) => void;

    /** Logs text to the terminal, as a replacement for console.warning */
    warning: (...args: any[]) => void;
}

/**
 * Basically a privately scoped log function that colors the log
 * @param colorFunction the function that colors the text fragments
 * @param args the augments to color
 */
function coloredLog(colorFunction?: colors.Color, ...args: any[]): void {
    // if (!cached.server) {
    //     cached.server = process.
    // }
    // cached.server = cached.server || process._gameplayServer;

    /*
    var str = util.format.apply(util, argsArray).replace(/\\/, EOL);
    if(_obj.server && _obj.server.logging) {
        _obj.filename = (_obj.filename ||
            ("output/logs/log-" + _obj.server.name.replace(/ /g, ".")
            + "-" + utilities.momentString() + ".txt"
            )
        );
        appendFile(_obj.filename, str + EOL);
    }

    if(_obj.server) {
        if(!_obj.server.silent) {
            if(colorFunction) {
                str = colorFunction(str);
            }

            if(_obj.server && !_obj.nameColor) { // we need to color the name!
                var bgColor = "White";
                var fgColor = "Black"; // default color for the Lobby

                if (!isMaster) { // then we are a child thread (Instance), so make the color a random pair
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
                    for(i = 0; i < _disallowedColorsPairs.length; i++) {
                        var pair = _disallowedColorsPairs[i];

                        var index = pair.indexOf(bgColor);
                        if(index > -1) { // then one of the pairs is the bgColor,
                            so remove the other so it can't be a foreground color
                            colorsArray.removeElement(pair[1 - index]);
                            // 1 - 0 == 1 and 1 - 1 === 0, so we basically flip
                            // the index to the other pair's index
                        }
                    }

                    colorsArray.shuffle();

                    fgColor = colorsArray.pop();
                }
                var fgSplit = fgColor.split(" ");
                _obj.nameColor = colors[fgSplit[0].toLowerCase()]["bg" + bgColor];

                if(fgSplit[1] === "Bold") {
                    _obj.nameColor = _obj.nameColor.bold;
                }
            }

            // tslint:disable-next-line:no-console
            console.log("[{time}] {colored} {str}".format({
                time: colors.green(moment().format("HH:mm:ss.SSS")),
                colored: _obj.nameColor ? _obj.nameColor(" " + _obj.server.name + " ") : "???",
                str: str,
            }));
        }
    }
    else { // they are using log before the server has been initialized
        // tslint:disable-next-line:no-console
        console.log.apply(console, argsArray);
    }
    */

    // tslint:disable-next-line:no-console
    console.log(...args);
}

export let log: ILogger;

/**
 * logs variables, replaces console.log() -> log()
 * @param args anything you'd log just like console.log
 */
log = function normalLog(...args: any[]): void {
    coloredLog(undefined, ...args);
} as any;

/**
 * logs variables to the error steam, replaces console.error() -> log()
 * @param args anything you'd log just like console.log
 */
log.error = function logError(...args: any[]): void {
    const first = args[0];
    if (first instanceof Error) {
        args[0] = `Error logged:
${first.name}
---
${first.message}
---
${first.stack}
---
${(first as any).syscall}
---`;
    }
    coloredLog(colors.red.bold, ...args);
};

/**
 * logs variables to the debug stream, replaces console.debug() -> log.debug()
 * @param args anything you'd log just like console.log
 */
log.debug = function logDebug(...args: any[]): void {
    coloredLog(colors.cyan, ...args);
};

/**
 * logs variables to the warn stream, replaces console.wan() -> log.warning()
 * @param args anything you'd log just like console.log
 */
log.warning = function logWarning(...args: any[]): void {
    coloredLog(colors.yellow, ...args);
};

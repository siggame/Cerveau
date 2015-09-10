/*
 * Get the gameInfo.data file(s) from each directory then returns them in a dictionary indexed by game name. Updates each time called
 */
var utilties = require("./utilities/utilities");

var gameInfos = {};
function initGameInfos() {
    var gameFolders = utilties.getDirs("games/");
    for(var i = 0; i < gameFolders.length; i++) {
        var gameFolder = gameFolders[i];
        if(!gameFolder.startsWith("_")) {
            gameInfos[gameFolder] = gameInfos[gameFolder] || require('./games/' + gameFolder + "/gameInfo.json");
        }
    }
};

module.exports = function() {
    initGameInfos();
    return gameInfos;
};

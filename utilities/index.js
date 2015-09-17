var fs = require("fs");
var path = require("path");
var moment = require("moment");

/**
 * This is a collection of static utility functions. They are to encourage DRY principles. If you find code being re-used and no natural place to put it consider placing it here.
 * All functions in here should be cross project, that is generic enough to be useful on the website or game servers.
 */
module.exports = {
    /**
     * simple function to get director names in a directory.
     *
     * @param {string} path to check in
     * @returns {Array.<string>} array of strings representing all directory names in a directory (not recursive).
     */
    getDirs: function(srcpath) {
        return fs.readdirSync(srcpath).filter(function(file) {
            return fs.statSync(path.join(srcpath, file)).isDirectory();
        });
    },

    /**
     * simple function to get file names in a directory.
     *
     * @param {string} path to check in
     * @returns {Array.<string>} array of strings representing all file names in a directory (not recursive).
     */
    getFiles: function(srcpath) {
        return fs.readdirSync(srcpath).filter(function(file) {
            return fs.statSync(path.join(srcpath, file)).isFile();
        });
    },

    /**
     * Returns a string formatted with a time via moment
     *
     * @param {number} [epoch] - optional epoch to init time to
     * @returns {string} time formatted to a string
     */
    momentString: function(epoch) {
        return moment(epoch).format("YYYY.MM.DD.HH.mm.ss.SSS");
    },

    Class: require("./class"),
};

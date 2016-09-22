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

    momentStringFormat: "YYYY.MM.DD.HH.mm.ss.SSS",

    /**
     * Returns a string formatted with a time via moment
     *
     * @param {number} [epoch] - optional epoch to init time to
     * @returns {string} time formatted to a string
     */
    momentString: function(epoch) {
        return moment(epoch).format(this.momentStringFormat);
    },

    /**
     * Takes a string that was made via momentString and transforms it back to an epoch
     *
     * @param {string} momentString - a string formatted from momentString
     * @returns {number} the epoch that was used to create that moment string
     */
    unMomentString: function(momentString) {
        return moment(momentString, this.momentStringFormat);
    },

    /**
     * traverses down nested objects given keys
     *
     * @param {Object} obj - multi-dimensional object to traverse down
     * @param {Array.<string>} keys - list of keys in order to look for a traverse down
     * @returns {*} whatever is all the way at the end of the traversal
     */
    traverse: function(obj, keys) {
        var o = obj;
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(o === null || typeof(o) !== "object" || !o.hasOwnProperty(key)) {
                break;
            }
            o = o[key];
        }

        return obj;
    },

    /**
     * Takes a string and tries to convert it to the primitive it looks like
     *
     * @param {string} str - string to try to convert
     * @returns {[type]} [description]
     */
    unstringify: function(str) {
        switch(str.toUpperCase()) { // check for bools
            case "TRUE":
                return true;
            case "FALSE":
                return false;
            case "NULL":
                return null;
        }

        // check if number
        if(!isNaN(str)) {
            return parseFloat(num);
        }

        return str; // looks like a string after all
    },

    Class: require("./class"),
};

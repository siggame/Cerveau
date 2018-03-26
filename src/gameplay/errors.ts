var Class = require(__basedir + "/utilities/class");

var CerveauError = Class({
    /**
     * Creates a new error message, which is basically a wapper for a message and data
     *
     * @constructor
     * @param {string} message - The human readable reason why they are getting this error message.
     * @param {Object} [data] - Any data about why it's invalid. Expected to be key/value list, but could really be anything.
     */
    init: function(message, data) {
        this.message = message;
        this.data = data;
    },

    toString: function() {
        return "Cerveau Error:\n{0}".format(this.message);
    },
});

module.exports = {
    CerveauError: CerveauError,
    GameLogicError: Class(CerveauError),
    EventDataError: Class(CerveauError),
    GameStructureError: Class(CerveauError),
};

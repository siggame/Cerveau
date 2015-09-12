var Class = require(__basedir + "/utilities/class");

/**
 * @abstract
 * @class DeltaMergeable - a class that can be serialized, hiding some key/values in it. You must set which keys are sent, all others are ignored.
 */
var DeltaMergeable = Class({
    /**
     * Creates something that is DeltaMergeable, that is will only serialize certain keys
     *
     * @contructor
     * @param {Array.<string>} [keys] - pipes this to _addSerializableKeys
     */
    init: function(keys) {
        this._serializableKeys = this._serializableKeys || {};

        if(keys) {
            this._addSerializableKeys(keys);
        }
    },

    /**
     * Adds the keys as valid keys to serialize
     *
     * @protected
     * @param {Array.<string>} keys - list of keys in this object that will be serialized when serializing
     */
    _addSerializableKeys: function(keys) {
        for(var i = 0; i < keys.length; i++) {
            this._serializableKeys[keys[i]] = true;
        }
    },
});

module.exports = DeltaMergeable;

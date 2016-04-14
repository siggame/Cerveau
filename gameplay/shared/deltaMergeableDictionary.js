var Class = require(__basedir + "/utilities/class");
var DeltaMergeable = require("./deltaMergeable");

/**
 * @class DeltaMergeableDictionary - A dictionary that manages its own delta states. Do not use the raw [] to add or remove items, as those have no hooks in JS to run code so we can delta update.
 */
var DeltaMergeableDictionary = Class(DeltaMergeable, {
    init: function(baseGame, pathInBaseGame, copyFrom, options) {
        DeltaMergeable.init.call(this, baseGame, pathInBaseGame);

        this._keyType = options.keyType;
        this._valueType = options.valueType;

        if(copyFrom) {
            this.extend(copyFrom);
        }
    },

    /**
     * Registers a new key as a property. Use this instead of the traditional 'this[key] = value;'
     *
     * @param {string} key - key you are adding
     * @param {*} value - value you are adding
     */
    add: function(key, value) {
        // TODO: keyType use
        return this._addProperty(key, value, { type: this._valueType });
    },

    /**
     * Removed a key from being a property. Use this instead of the traditiona 'delete this[key];'
     */
    remove: function(key) {
        this._removeProperty(key);
    },

    /**
     * Convienence function like a traditional dictionary extend
     *
     * @param copyFrom - other object to copy properties from
     */
    extend: function(copyFrom) {
        for(var key in copyFrom) {
            if(copyFrom.hasOwnProperty(key)) {
                this.add(key, copyFrom[key]);
            }
        }
    },
});

module.exports = DeltaMergeableDictionary;

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
     * Public setter override to make sure this DeltaMergeableDictionary is never overwritten
     *
     * @param {Object} newDict - the new object we are supposed to be "set" to, instead copy its key/values
     */
    replace: function(newDict) {
        if(newDict === this) {
            return;
        }

        var oldKeys = Object.keys(this._properties);

        // add the new keys to this dict
        for(var newKey in newDict) {
            if(newDict.hasOwnProperty(newKey)) {
                if(!this._hasProperty(newKey)) {
                    this.add(newKey, newDict[newKey]);
                }

                // remove the newKey from the old keys so it is not removed
                oldKeys.removeElement(newKey);
            }
        }

        // remove all the old keys that were not a new key
        for(var i = 0; i < oldKeys.length; i++) {
            this.remove(oldKeys[i]);
        }
    },

    /**
     * Registers a new key as a property. Use this instead of the traditional `this[key] = value;`
     *
     * @param {string} key - key you are adding
     * @param {*} value - value you are adding
     * @returns {*} value that was added
     */
    add: function(key, value) {
        // TODO: keyType use
        return this._addProperty(key, value, { type: this._valueType });
    },

    /**
     * Removed a key from being a property. Use this instead of the traditional `delete this[key];`
     *
     * @param {string} key - key in this object
     */
    remove: function(key) {
        this._removeProperty(key);
    },

    /**
     * Convenience function like a traditional dictionary extend
     *
     * @param {Object|DeltaMergeableDictionary} copyFrom - other object to copy properties from
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

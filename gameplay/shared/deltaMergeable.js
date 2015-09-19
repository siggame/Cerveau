var log = require("../log");
var Class = require(__basedir + "/utilities/class");

/**
 * @abstract
 * @class DeltaMergeable - a class that can be serialized, hiding some key/values in it. You must set which keys are sent, all others are ignored.
 */
var DeltaMergeable = Class({
    /**
     * Creates something that is DeltaMergeable, that is will only serialize certain keys. Can be re-initialized multiple times and will not overwrite values
     *
     * @contructor
     */
    init: function(baseGame, pathInBaseGame) {
        this._baseGame = baseGame || this;
        this._pathInBaseGame = pathInBaseGame || [];
        this._properties = this._properties || {};
    },

    /**
     * Adds a value as a property, which hooks it up so it registers deltas with the game. Afterwards it acts like a normal variable, e.g. this[key] = value;
     *
     * @param {string} key - the index in side this you want to "set"
     * @param {*} [value] - the value you want to set this property to, defaults to undefined
     * @param {function} [setter] - a function that takes in what is trying to be assigned to, and will return a different value, probably for santization
     * @param {string} [deltaKey] - what the key for the delta, defaults to the passed in key
     */
    _addProperty: function(key, value, options) {
        if(Array.isArray(value)) {
            return this._createNestedArray(key, value, options);
        }
        else if(value !== null && typeof(value) === "object" && !Class.isInstance(value)) {
            return this._createNestedDictionary(key, value, options);
        }

        if(!this._hasProperty(key)) {
            this._setupProperty(key, options);
        }

        if(value !== undefined) {
            this[key] = value;
        }
    },

    /**
     * initialized a property internally
     *
     * @param {string} key - the index
     * @param {Object} [options] - can contain the deltaKey override, and setter function to apply
     */
    _setupProperty: function(key, options) {
        options = options || {};
        var propertyPath = this._pathInBaseGame.clone();

        propertyPath.push(options.hasOwnProperty("deltaKey") ? options.deltaKey : key);
        this._properties[key] = {
            value: undefined,
            path: propertyPath,
        };

        var self = this;
        Object.defineProperty(self, key, {
            configurable: true,
            enumerable: true,
            get: function() {
                return this._properties[key].value;
            },
            set: function(newValue) {
                var property = this._properties[key];
                property.value = (options.setter ? options.setter(newValue) : newValue);
                this._baseGame.updateDelta(property);
            },
        });
    },

    /**
     * Removes a property, and tells the delta that this property was removed (deleted)
     *
     * @param {string} key - key to "delete"
     * @returns {*} the value of the property removed, like a pop(key)
     */
    _removeProperty: function(key) {
        var removed = this[key];
        this._baseGame.updateDelta(this._properties[key], true);
        delete this._properties[key];
        return removed;
    },

    /**
     * Checks if a key has been set as a property
     *
     * @param {string} key - the key you want to check if is a property in this DeltaMergeable
     * @returns {boolean} if the passed in key is a property in this DeltaMergeable
     */
    _hasProperty: function(key) {
        return this._properties.hasOwnProperty(key);
    },



    ////////////////////////////////
    // Creating Nested Structures //
    ////////////////////////////////

    /**
     * When you add a [] it will need to be "converted" to a DeltaMergeableArray to register changes inside it, this creates that nested inside this DeltaMergeable
     *
     * @param {string} key - the key this array will be stored in
     * @param {Array} [copyFrom] - copies these values during init if present
     * @returns {DeltaMergeableArray} what is now nested in this[key]
     */
    _createNestedArray: function(key, copyFrom) {
        return this._createNested("Array", key, copyFrom);
    },

    /**
     * When you add a {} it will need to be "converted" to a DeltaMergeableDictionary to register changes inside it, this creates that nested inside this DeltaMergeable
     *
     * @param {string} key - the key this object will be stored in
     * @param {Object} [copyFrom] - copies these values during init if present
     * @returns {DeltaMergeableDictionary} what is now nested in this[key]
     */
    _createNestedDictionary: function(key, copyFrom) {
        return this._createNested("Dictionary", key, copyFrom);
    },

    /**
     * Generic function that hooks up nested arrays or obejcts
     *
     * @param {string} type - "Array" or "Dictionary" based on class type
     * @param {string} key - the key this array or object will be stored in
     * @param {Object} [copyFrom] - copies these values during init if present
     * @returns {DeltaMergeable} what is now nested in this[key]
     */
    _createNested: function(type, key, copyFrom) {
        var DeltaMergeableType = require("./deltaMergeable" + type);
        var newPath = this._pathInBaseGame.clone();
        newPath.push(key);
        var nested = new DeltaMergeableType.uninitialized();
        this._addProperty(key, nested);
        nested.init(this._baseGame, newPath, copyFrom);
        return nested;
    },
});

module.exports = DeltaMergeable;

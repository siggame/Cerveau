var fs = require("fs");
var Class = require(__basedir + "/utilities/class");
var Errors = require(__basedir + "/gameplay/errors");
var log = require(__basedir + "gameplay/log");
var serializer = require(__basedir + "gameplay/serializer");
var DeltaMergeableArray = require(__basedir + "gameplay/shared/deltaMergeableArray");
var DeltaMergeableDictionary = require(__basedir + "gameplay/shared/deltaMergeableDictionary");

/**
 * A collection of static functions to sanitize inputs from AI clients for the ${game_name} Game.
 */
var GameManager = Class({
    init: function(game) {
        this._game = game;
    },

    /**
     * Sanitizes a variable to some type
     * @param {string} type - what type to turn sanitizing into
     * @param {*} sanitizing - what to cast from
     * @returns {*} sanitizing converted to type
     */
    sanitizeType: function(type, sanitizing) {
        switch(type) {
            case "int":
                return serializer.defaultInteger(sanitizing);
            case "float":
                return serializer.defaultNumber(sanitizing);
            case "boolean":
                return serializer.defaultBoolean(sanitizing);
            case "string":
                return serializer.defaultString(sanitizing);
            case "array":
                if(DeltaMergeableArray.isInstance(sanitizing)) {
                    return sanitizing;
                }
                return serializer.defaultArray(sanitizing);
            case "dictionary":
                if(DeltaMergeableDictionary.isInstance(sanitizing)) {
                    return sanitizing;
                }
                return serializer.defaultObject(sanitizing);
            default:
                if(type[0] === type[0].toUpperCase()) { // then it is a GameObject
                    var gameObjectClass = this._game.classes[type];
                    return gameObjectClass.isInstance(sanitizing) ? sanitizing : null;
                }
                return null;
        }
    },

    /**
     * Sanitized the arguments for an order/run command
     *
     * @param {Array.<Object>} argsStructure - array of args information
     * @param {Array} untreatedArgs - args as sent that have not been sanitized
     * @returns {Array} a new array of sanitized args
     */
    _sanitizeArgs: function(argsStructure, untreatedArgs) {
        var sanitized = [];
        for(var i = 0; i < argsStructure.length; i++) {
            var arg = argsStructure[i];
            var val = untreatedArgs[arg.name] || untreatedArgs[i];

            sanitized[i] = this._sanitizeValue(val, arg);
        }

        return sanitized;
    },

    /**
     * Sanitizes a single value
     *
     * @param {*} val - unsanitized value
     * @param {Object} arg - information about what the value should look like
     * @returns {*} val, sanitized
     */
    _sanitizeValue: function(val, arg) {
        return this.sanitizeType(arg.type.name, val === undefined ? arg.defaultValue : val);
    },

    /**
     * Sanatizes an AI's incoming arguments to a run event
     *
     * @param {Function} runFunction - the ai run function
     * @param {Object} kwargs - key word formatted args (not array in order)
     * @returns {Array} sanitized args for the run
     */
    sanitizeRun: function(runFunction, kwargs) {
        return this._sanitizeArgs(runFunction.cerveau.args, kwargs);
    },

    /**
     * Sanatizes the servers return value from running game logic in response to an AI's run event
     *
     * @param {Function} ranFunction - the server-side (this) ran function callback
     * @param {*} runReturned - unsanitized value from the server it returned from the run, to be sent to the ai
     * @returns {*} santized return value from the ran
     */
    sanitizeRan: function(ranFunction, runReturned) {
        var returns = ranFunction.cerveau.returns;
        if(returns !== undefined) { // meaning there is an expected return value, then sanitize it
            return this._sanitizeValue(runReturned, returns);
        }
    },

    /**
     * Sanatizes the arguments the server will be sending to an order for the upcoming AI's order event
     *
     * @param {Object} order - the order to sanitize
     */
    sanitizeOrder: function(order) {
        var structure = this._game["aiFinished" + order.name.upcaseFirst()].cerveau;
        order.args = this._sanitizeArgs(structure.args, order.args);
    },

    /**
     * Sanitizes what the AI returned from their order
     *
     * @param {Object} order - the order the ai finished
     * @param {*} orderReturned - the return value from the ai of what it returned from the order
     * @returns {*} sanitized version of orderReturned
     */
    sanitizeFinished: function(order, orderReturned) {
        var structure = this._game["aiFinished" + order.name.upcaseFirst()].cerveau;
        if(structure.returns !== undefined) {
            return this._sanitizeValue(orderReturned, structure.returns);
        }
    },

    /**
     * Checks if a cerveau callback is a secret (not codegened)
     *
     * @param {Function} callback - callback to check (not invoke)
     * @returns {Boolean} true if it is a secret, false otherwise
     */
    isSecret: function(callback) {
        return Boolean(callback.cerveau.isSecret);
    },
});

module.exports = GameManager;

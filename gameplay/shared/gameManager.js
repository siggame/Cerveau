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

    _sanitizeArgs: function(argsStructure, untreatedArgs) {
        var sanitized = [];
        for(var i = 0; i < argsStructure.length; i++) {
            var arg = argsStructure[i];
            var val = untreatedArgs[arg.name] || untreatedArgs[i];

            sanitized[i] = this._sanitizeValue(val, arg);
        }

        return sanitized;
    },

    _sanitizeValue: function(val, arg) {
        return this.sanitizeType(arg.type.name, val === undefined ? arg.defaultValue : val);
    },

    /**
     * Sanatizes an AI's incoming arguments to a run event
     */
    sanitizeRun: function(runFunction, kwargs) {
        return this._sanitizeArgs(runFunction.cerveau.args, kwargs);
    },

    /**
     * Sanatizes the servers return value from running game logic in response to an AI's run  event
     */
    sanitizeRan: function(ranFunction, runReturned) {
        var returns = ranFunction.cerveau.returns;
        if(returns !== undefined) { // meaning there is an expected return value, then sanitize it
            return this._sanitizeValue(runReturned, returns);
        }
    },

    /**
     * Sanatizes the arguments the server will be sending to an order for the upcoming AI's order event
     */
    sanitizeOrder: function(order) {
        var structure = this._game['aiFinished_' + order.name].cerveau;
        return this._sanitizeArgs(order.args, structure.args);
    },

    /**
     * Sanatizes what the AI returned from their order
     */
    sanitizeFinished: function(order, orderReturned) {
        var structure = this._game['aiFinished_' + order.name].cerveau;
        if(structure.returns !== undefined) {
            return this._sanitizeValue(orderReturned, structure.returns);
        }
    },

    isSecret: function(callback) {
        return Boolean(callback.cerveau.isSecret);
    },
});

module.exports = GameManager;

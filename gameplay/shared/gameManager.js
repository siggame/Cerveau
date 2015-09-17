var Class = require(__basedir + "/utilities/class");

/**
 * A collection of static functions to sanitize inputs from AI clients for the ${game_name} Game.
 */
var GameManager = Class({
    init: function(gameStructure) {
        this._gameStructure = gameStructure;

        this._gameObjectClasses = {};
        for(var key in this._gameStructure) {
            if(this._gameStructure.hasOwnProperty(key) && key !== "Game" && key !== "AI") {
                this._gameObjectClasses[key] = require(__basedir + "/games/" + this._gameStructure.Game.name.lowercaseFirst() + "/" + key.lowercaseFirst());
            }
        }
    },

    createUninitializedGameObject: function(gameObjectName) {
        return new this._gameObjectClasses[gameObjectName].uninitialized;
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
        return arg.converter(val === undefined ? arg.defaultValue : val);
    },

    /**
     * Sanatizes an AI's incoming arguments to a run event
     */
    sanitizeRun: function(gameObjectName, functionName, kwargs) {
        var args = this._gameStructure[gameObjectName][functionName].args;
        return this._sanitizeArgs(args, kwargs); 
    },

    /**
     * Sanatizes the servers return value from running game logic in response to an AI's run  event
     */
    sanitizeRan: function(gameObjectName, functionName, runReturned) {
        var returns = this._gameStructure[gameObjectName][functionName].returns;
        if(returns !== undefined) { // meaning there is an expected return value, then sanitize it
            return this._sanitizeValue(runReturned, returns);
        }
    },

    /**
     * Sanatizes the arguments the server will be sending to an order for the upcoming AI's order event
     */
    sanitizeOrder: function(order) {
        var args = this._gameStructure['AI'][order.name].args;
        return this._sanitizeArgs(order.args, args);
    },

    /**
     * Sanatizes what the AI returned from their order
     */
    sanitizeFinished: function(order, orderReturned) {
        var returns = this._gameStructure['AI'][order.name].returns;
        if(returns !== undefined) {
            return this._sanitizeValue(orderReturned, returns);
        }
    },
});

module.exports = GameManager;

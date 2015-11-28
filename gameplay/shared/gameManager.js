var Class = require(__basedir + "/utilities/class");
var Errors = require(__basedir + "/gameplay/errors");

/**
 * A collection of static functions to sanitize inputs from AI clients for the ${game_name} Game.
 */
var GameManager = Class({
    init: function(gameStructure) {
        this._gameStructure = gameStructure;

        this._gameObjectClasses = {};
        for(var key in this._gameStructure) { // create the game classes for easy string lookup, also better to have a require() fail here when the game is initialized, rather than later during gameplay when far more shit is going down, if a dev wrote a syntax error.
            if(this._gameStructure.hasOwnProperty(key) && key !== "Game" && key !== "AI") {
                this._gameObjectClasses[key] = require(__basedir + "/games/" + this._gameStructure.Game.name.lowercaseFirst() + "/" + key.lowercaseFirst());
            }
        }
    },

    createUninitializedGameObject: function(gameObjectName) {
        return new this._gameObjectClasses[gameObjectName].uninitialized;
    },

    _getFromStructure: function(objName, functionName) {
        if(!this._gameStructure[objName]) {
            throw new Errors.GameStructureError("No object '{0}' in Game '{1}'".format(objName, this._gameStructure.Game.name));
        }
        else if(!this._gameStructure[objName][functionName]) {
            throw new Errors.GameStructureError("No function named '{0}' for object '{1}' in Game '{2}'".format(functionName, objName, this._gameStructure.Game.name));
        }

        return this._gameStructure[objName][functionName];
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
        var structure = this._getFromStructure(gameObjectName, functionName);
        return this._sanitizeArgs(structure.args, kwargs);
    },

    /**
     * Sanatizes the servers return value from running game logic in response to an AI's run  event
     */
    sanitizeRan: function(gameObjectName, functionName, runReturned) {
        var structure = this._getFromStructure(gameObjectName, functionName);
        if(structure.returns !== undefined) { // meaning there is an expected return value, then sanitize it
            return this._sanitizeValue(runReturned, structure.returns);
        }
    },

    /**
     * Sanatizes the arguments the server will be sending to an order for the upcoming AI's order event
     */
    sanitizeOrder: function(order) {
        var structure = this._getFromStructure("AI", order.name);
        return this._sanitizeArgs(order.args, structure.args);
    },

    /**
     * Sanatizes what the AI returned from their order
     */
    sanitizeFinished: function(order, orderReturned) {
        var structure = this._getFromStructure("AI", order.name);
        if(structure.returns !== undefined) {
            return this._sanitizeValue(orderReturned, structure.returns);
        }
    },

    isSecret: function(gameObjectName, functionName) {
        var structure = this._getFromStructure(gameObjectName, functionName);
        return Boolean(structure.isSecret);
    },
});

module.exports = GameManager;

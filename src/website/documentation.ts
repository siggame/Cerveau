var app = require("./app");
var getGameInfos = require("./getGameInfos");
var extend = require("extend");

/**
 * Sorts names in ascending order
 *
 * @param {Object} a - game with name
 * @param {Object} b - game with name
 * @returns {number} direction for sorting
 */
function _sortNames(a, b) {
    return a.name.toLowerCase() > b.name.toLowerCase();
}

/**
 * Formats an object into a string for the docs
 *
 * @param {Object} typeObj - the type object for docs, must contain the name of the type
 * @returns {string} the type formatted to a human readable string
 */
function _formatType(typeObj) {
    var baseType = typeObj.name;
    switch(typeObj.name) {
        case "dictionary":
            return "dictionary<" + _formatType(typeObj.keyType) + ", " + _formatType(typeObj.valueType) + ">";
        case "list":
            return "list<" + _formatType(typeObj.valueType) + ">";
        default:
            return String(baseType);
    }
}

/**
 * Checks if a key/value object's keys are not private (underscored) and adds them to the array
 *
 * @param {Array} array - array to add keys to
 * @param {Object} dict - Object with key value pairs
 */
function _addTo(array, dict) {
    for(var key in dict) {
        if(!key.startsWith("_") && dict.hasOwnProperty(key)) {
            array.push(extend({name: key}, dict[key]));
        }
    }
}

/**
 * Formats a variable into a string for the docs
 *
 * @param {Object} variable - creer variable to format for the docs, will contain nested objects
 */
function _formatVariable(variable) {
    if(variable.type) {
        variable.type = _formatType(variable.type);
    }

    if(variable.type === "boolean" && variable["default"] !== null) {
        variable["default"] = String(variable["default"]);
    }

    if(variable.type === "string" && variable["default"] !== null) {
        variable["default"] = "\"" + variable["default"] + "\"";
    }
}

var docDatas = {};

/**
 * Gets the docs data for the documentaion view for a specific game
 *
 * @param {string} gameName - name of the game to get the data for, case sensitive
 * @returns {Object} data for the documentation.hbs view
 */
function getDocsData(gameName) {
    var gameInfos = getGameInfos();
    var gameInfo = gameInfos[gameName];

    if(!docDatas[gameName]) {
        var classes = [];

        var objects = extend({
            "Game": gameInfo.Game,
            "AI": gameInfo.AI,
        }, gameInfo.gameObjects);

        var gameClass;
        var aiClass;
        for(var objName in objects) {
            if(objects.hasOwnProperty(objName)) {
                var gameObject = objects[objName];
                var docClass = extend({}, gameObject, {
                    name: objName,
                    attributes: [],
                    functions: [],
                });

                _addTo(docClass.attributes, gameObject.attributes);
                _addTo(docClass.attributes, gameObject.inheritedAttributes);
                docClass.attributes.sort(_sortNames);
                for(var i = 0; i < docClass.attributes.length; i++) {
                    _formatVariable(docClass.attributes[i]);
                }

                _addTo(docClass.functions, gameObject.functions);
                _addTo(docClass.functions, gameObject.inheritedFunctions);
                docClass.functions.sort(_sortNames);
                for(i = 0; i < docClass.functions.length; i++) {
                    var funct = docClass.functions[i];
                    if(funct.returns !== null) {
                        _formatVariable(funct.returns);
                    }
                    else {
                        funct.returns = {type: "void"};
                    }
                    for(var j = 0; j < funct.arguments.length; j++) {
                        _formatVariable(docClass.functions[i].arguments[j]);
                    }
                }

                classes.push(docClass);

                if(docClass.name === "Game") {
                    gameClass = docClass;
                }
                else if(docClass.name === "AI") {
                    aiClass = docClass;
                }
            }
        }

        classes.removeElement(gameClass);
        classes.removeElement(aiClass);

        classes.sort(_sortNames);
        // pust the AI and Game classes to the front of the classes list
        classes.unshift(aiClass);
        classes.unshift(gameClass);

        docDatas[gameName] = classes;

        return classes;
    }
}

module.exports = function(args) {
    app.get("/documentation/:gameName", function(req, res) {
        var gameName = req.params.gameName;
        var data = getDocsData(gameName);

        res.render("documentation", {
            gameName: gameName,
            classes: data,
        });
    });

};

var app = require("./app");
var getGameInfos = require("./getGameInfos");
var extend = require('extend');

module.exports = function(args) {
    var docDatas = {};
    app.get('/documentation/:gameName', function(req, res) {
        var gameName = req.params.gameName;
        var gameInfos = getGameInfos();
        var gameInfo = gameInfos[gameName];

        if(!docDatas[gameName]) {
            classes = [];

            var objects = extend({
                'Game': gameInfo.Game,
                'AI': gameInfo.AI,
            }, gameInfo.gameObjects);

            function sortNames(a, b) {
                return a.name.toLowerCase() > b.name.toLowerCase();
            };

            function formatType(typeObj) {
                var baseType = typeObj['name'];
                switch(typeObj.name) {
                    case "dictionary":
                        return "dictionary<" + formatType(typeObj.keyType) + ", " + formatType(typeObj.valueType) + ">";
                    case "list":
                        return "list<" + formatType(typeObj.valueType) + ">";
                    default:
                        return String(baseType);
                }
            };

            function formatVariable(variable) {
                if(variable.type) {
                    variable.type = formatType(variable.type);
                }

                if(variable.type === "boolean" && variable['default'] !== null) {
                    variable['default'] = String(variable['default']);
                }

                if(variable.type === "string" && variable['default'] !== null) {
                    variable['default'] = '"' + variable['default'] + '"';
                }
            };

            var gameClass = undefined;
            var aiClass = undefined;
            for(var objName in objects) {
                if(objects.hasOwnProperty(objName)) {
                    var gameObject = objects[objName];
                    var docClass = extend({}, gameObject, {
                        name: objName,
                        attributes: [],
                        functions: [],
                    });

                    function addTo(array, dict) {
                        for(var key in dict) {
                            if(!key.startsWith("_") && dict.hasOwnProperty(key)) {
                                array.push(extend({name: key}, dict[key]));
                            }
                        }
                    };

                    addTo(docClass.attributes, gameObject.attributes);
                    addTo(docClass.attributes, gameObject.inheritedAttributes);
                    docClass.attributes.sort(sortNames);
                    for(var i = 0; i < docClass.attributes.length; i++) {
                        formatVariable(docClass.attributes[i]);
                    }

                    addTo(docClass.functions, gameObject.functions);
                    addTo(docClass.functions, gameObject.inheritedFunctions);
                    docClass.functions.sort(sortNames);
                    for(var i = 0; i < docClass.functions.length; i++) {
                        var funct = docClass.functions[i];
                        if(funct.returns !== null) {
                            formatVariable(funct.returns);
                        }
                        else {
                            funct.returns = {type: "void"};
                        }
                        for(var j = 0; j < funct.arguments.length; j++) {
                            formatVariable(docClass.functions[i].arguments[j]);
                        }
                    }

                    classes.push(docClass);

                    if(docClass.name == "Game") {
                        gameClass = docClass;
                    }
                    else if(docClass.name == "AI") {
                        aiClass = docClass;
                    }
                }
            }

            classes.removeElement(gameClass);
            classes.removeElement(aiClass);

            classes.sort(sortNames);
            classes.unshift(aiClass);
            classes.unshift(gameClass);

            docDatas[gameName] = classes;
        }

        res.render('documentation', {
            gameName: gameName,
            classes: docDatas[gameName],
        });
    });

};

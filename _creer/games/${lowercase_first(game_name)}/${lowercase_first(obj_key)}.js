// ${header}
<%include file="functions.noCreer" />
var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
% for parent_class in obj['serverParentClasses']:
var ${parent_class} = require(__basedir + "/gameplay/shared/${lowercase_first(parent_class)}");
% endfor
% for parent_class in obj['parentClasses']:
var ${parent_class} = require("./${lowercase_first(parent_class)}");
% endfor
<%parent_classes = obj['parentClasses'] + obj['serverParentClasses']%>
${merge("//", "requires", """
// any additional requires you want can be required here safely between Creer re-runs

""")}

// @class ${obj_key}: ${obj['description']}
var ${obj_key} = Class(${", ".join(parent_classes) + "," if parent_classes else ""} {
    /**
     * Initializes ${obj_key}s.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
% for parent_class in reversed(parent_classes):
        ${parent_class}.init.apply(this, arguments);
% endfor

% for attr_name in obj['attribute_names']:
<%
    attr_parms = obj['attributes'][attr_name]
    if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
        continue
%>        /**
         * ${attr_parms['description']}
         *
         * @type {${shared['cerveau']['type'](attr_parms['type'])}}
         */
        this._addProperty("${attr_name}", ${shared['cerveau']['cast'](attr_parms['type'])}(data.${attr_name}));

% endfor

${merge("        //", "init",
"""
        // put any initialization logic here. the base variables should be set from 'data' above
{}
""".format("        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'\n" if obj_key == "Game" else "")
)}
    },

% if obj_key == "Game":
    name: "${game_name}",

    aliases: [
${merge("        //", "aliases", '        "MegaMinerAI-##-{}",'.format(game_name))}
    ],



    /**
     * This is called when the game begins, once players are connected and ready to play, and game objects have been initialized. Anything in init() may not have the appropriate game objects created yet..
     */
    begin: function() {
% for parent_class in reversed(parent_classes):
        ${parent_class}.begin.apply(this, arguments);
% endfor

${merge("        //", "begin", "        // any logic after init can be put here")}
    },

    /**
     * This is called when the game has started, after all the begin()s. This is a good spot to send orders.
     */
    _started: function() {
% for parent_class in reversed(parent_classes):
        ${parent_class}._started.apply(this, arguments);
% endfor

${merge("        //", "_started", "        // any logic for _started can be put here")}
    },
% else:
    gameObjectName: "${obj_key}",
% endif
<%
function_holders = None
if obj_key == "Game":
    function_holders = [{'obj': game}, {'obj': ai, 'order': True}]
else:
    function_holders = [{'obj': obj}]
%>
% for function_holder in function_holders:
% for function_name in function_holder['obj']['function_names']:
<%
    function_parms = function_holder['obj']['functions'][function_name]
    if 'serverPredefined' in function_parms and function_parms['serverPredefined']:
        continue
%>
    /**
     * ${function_parms['description']}
     *
     * @param {Player} player - the player that called this.
% if 'arguments' in function_parms:
% for arg_parms in function_parms['arguments']:
     * @param {${shared['cerveau']['type'](arg_parms['type'])}} ${arg_parms['name']} - ${arg_parms['description']}
% endfor
% endif
% if not 'order' in function_holder:
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
% endif
% if function_parms['returns']:
     * @returns {${shared['cerveau']['type'](function_parms['returns']['type'])}} ${function_parms['returns']['description']}
% endif
     */
    ${"aiFinished_" if 'order' in function_holder else ""}${function_name}: function(player${", ".join([""] + function_parms["argument_names"])}, asyncReturn) {
${merge("        // ", function_name, (
"""
        // Developer: Put your game logic for the {0}'s {1} function here
        return {2};

"""
).format(obj_key, function_name, shared['cerveau']['default'](function_parms['returns']['type']) if function_parms['returns'] else "undefined")
)}
    },
% endfor
% endfor

${merge("    //", "added-functions",
"""
    // You can add additional functions here. These functions will not be directly callable by client AIs

"""
)}

});

module.exports = ${obj_key};

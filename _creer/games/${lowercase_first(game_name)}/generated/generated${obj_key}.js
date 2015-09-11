// ${header}
// Note: this file should never be modified, instead if you want to add game logic modify just the ../${obj_key}.js file. This is to ease merging main.data changes
<%include file="functions.noCreer" />
var serializer = require("../../../utilities/serializer");
var Class = require("../../../utilities/class");
% for parent_class in obj['serverParentClasses']:
var ${parent_class} = require("../../${lowercase_first(parent_class)}");
% endfor
% for parent_class in obj['parentClasses']:
var ${parent_class} = require("../${lowercase_first(parent_class)}");
% endfor
<%parent_classes = obj['parentClasses'] + obj['serverParentClasses']%>
% if obj_key == "Game":

// Custom Game Objects
% for game_obj_name in game_obj_names:
var ${game_obj_name} = require("../${lowercase_first(game_obj_name)}");
% endfor
% endif

// @class Generated${obj_key}: The generated version of the ${obj_key}, that handles basic logic.
var Generated${obj_key} = Class(${", ".join(parent_classes) + "," if parent_classes else ""} {
    init: function(data) {
% for parent_class in reversed(parent_classes):
        ${parent_class}.init.apply(this, arguments);
% endfor

% for attr_name in obj['attribute_names']:
<%
    attr_parms = obj['attributes'][attr_name]
    if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
        continue
%>        this.${attr_name} = ${shared['cerveau']['cast'](attr_parms['type'])}(data.${attr_name} === undefined ? ${shared['cerveau']['default'](attr_parms['type'])} : data.${attr_name});
% endfor

% if obj_key == "Game":
% for function_name in ai['function_names']:
<%
    function_parms = ai['functions'][function_name]
    if function_parms['serverPredefined'] or not function_parms['returns']:
        continue

    converter = shared['cerveau']['cast'](function_parms['returns']['type'])
    if not converter:
        continue
%>        this._returnedDataTypeConverter["${function_name}"] = ${converter};
% endfor

% endif
% for attr_name in obj['attribute_names']:
<%
    attr_parms = obj['attributes'][attr_name]
    if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
        continue
%>        this._serializableKeys["${attr_name}"] = true;
% endfor
    },

% if obj_key == "Game":
    name: "${game_name}",
    numberOfPlayers: ${obj['numberOfPlayers']},
    maxInvalidsPerPlayer: ${obj['maxInvalidsPerPlayer']},
% else:
    gameObjectName: "${obj_key}",
% endif

% for function_name in obj['function_names']:
<% function_parms = obj['functions'][function_name]
%>    _run${upcase_first(function_name)}: function(player, data, asyncReturn) {
% if function_parms['arguments']:
% for arg_parms in function_parms['arguments']:
        var ${arg_parms['name']} = ${shared['cerveau']['cast'](arg_parms['type'])}(data.${arg_parms['name']});
% if arg_parms['optional']:
        ${arg_parms['name']} = (${arg_parms['name']} === undefined ? ${shared['cerveau']['default'](arg_parms['type'], arg_parms['default'])} : ${arg_parms['name']}); // this parameter is optional, so we will fill in the default value if it was not sent.
% endif
% endfor

% endif
        var returned = this.${function_name}(player${", ".join([""] + function_parms['argument_names'])}, asyncReturn);
% if function_parms['returns'] != None:
        returned = ${shared['cerveau']['cast'](function_parms['returns']['type'])}(returned);

        return {
            returned: returned,
            altersState: ${'true' if function_parms['altersState'] else 'false'},
        };
% endif
    },

% endfor
% if obj_key == "Game":
% for game_obj_name in game_obj_names:

    /**
     * Creates a new instance of the ${game_obj_name} game object that has reference to the creating game
     *
     * @returns {${game_obj_name}} a new ${game_obj_name}
     */
    new${game_obj_name}: function(data) {
        data.game = this;
        return new ${game_obj_name}(data);
    },
% endfor
% endif
});

module.exports = Generated${obj_key};

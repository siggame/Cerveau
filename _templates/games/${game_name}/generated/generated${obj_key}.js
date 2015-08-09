// ${header}
// Note: this file should never be modified, instead if you want to add game logic modify just the ../${obj_key}.js file. This is to ease merging main.data changes
<%include file="functions.noCreer" />
var serializer = require("../../../utilities/serializer");
var Class = require("../../../utilities/class");
% for parent_class in obj['serverParentClasses']:
var ${parent_class} = require("../../${uncapitalize(parent_class)}");
% endfor
% for parent_class in obj['parentClasses']:
var ${parent_class} = require("../${uncapitalize(parent_class)}");
% endfor
<%parent_classes = obj['parentClasses'] + obj['serverParentClasses']%>
% if obj_key == "Game":

// Custom Game Objects
% for game_obj_key, game_obj in game_objs.items():
var ${game_obj_key} = require("../${uncapitalize(game_obj_key)}");
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
%>		this.${attr_name} = ${shared['js']['cast'](attr_parms['type'])}(data.${attr_name} === undefined ? ${shared['js']['default'](attr_parms['type'])} : data.${attr_name});
% endfor

% if obj_key == "Game":
% for function_name in ai['function_names']:
<%
	function_parms = ai['functions'][function_name]
	if function_parms['serverPredefined'] or not function_parms['returns']:
		continue

	converter = shared['js']['cast'](function_parms['returns']['type'])
	if not converter:
		continue
%>		this._returnedDataTypeConverter["${function_name}"] = ${converter};
% endfor

% endif
% for attr_name, attr_parms in obj['attributes'].items():
<%
	if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
		continue
%>		this._serializableKeys["${attr_name}"] = true;
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
%>	_run${function_name[0].upper() + function_name[1:]}: function(player, data) {
% if function_parms['arguments']:
% for arg_parms in function_parms['arguments']:
		data.${arg_parms['name']} = ${shared['js']['cast'](arg_parms['type'])}(data.${arg_parms['name']});
% endfor

% endif
		var returned = this.${function_name}(player${", data.".join([""] + function_parms['argument_names'])});
% if function_parms['returns'] != None:
		return ${shared['js']['cast'](function_parms['returns']['type'])}(returned);
% endif
	},

% endfor
% if obj_key == "Game":
% for game_obj_key, game_obj in game_objs.items():

	/// Creates a new instance of the ${game_obj_key} game object that has reference to the creating game
	new${game_obj_key}: function(data) {
		data.game = this;
		return new ${game_obj_key}(data);
	},
% endfor
% endif
});

module.exports = Generated${obj_key};

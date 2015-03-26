// ${header}
// Note: this file should never be modified, instead if you want to add game logic modify just the ../${obj_key}.js file. This is to ease merging main.data changes
var Class = require("../../../structures/class");
% for parent_class in obj['serverParentClasses']:
var ${parent_class} = require("../../${uncapitalize(parent_class)}")
% endfor
% for parent_class in obj['parentClasses']:
var ${parent_class} = require("../${uncapitalize(parent_class)}")
% endfor
<%
	parent_classes = obj['parentClasses'] + obj['serverParentClasses']
%>
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

% if obj_key == "Game":
		this.name = "${game_name}";
% endif
		this.gameObjectName = "${obj_key}";

% for attr_name, attr_parms in obj['attributes'].items():
<%
	if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
		continue

	attr_default = attr_parms["default"] if 'default' in attr_parms else None
	attr_type = attr_parms["type"]
	attr_cast = "";

	if attr_type == "string":
		attr_default = '"' + (attr_default if attr_default != None else '') + '"'
		attr_cast = "String"
	elif attr_type == "array":
		attr_default = '[]'
	elif attr_type == "int":
		attr_default = attr_default or 0
		attr_cast = "parseInt"
	elif attr_type == "float":
		attr_default = attr_default or 0
		attr_cast = "parseFloat"
	elif attr_type == "dictionary":
		attr_default = '{}'
	elif attr_type == "boolean":
		attr_default = 'false'
	else:
		attr_default = "null"
%>		this.${attr_name} = ${attr_cast}(data.${attr_name} === undefined ? ${attr_default} : data.${attr_name});
% endfor

% for attr_name, attr_parms in obj['attributes'].items():
<%
	if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
		continue
%>		this._serializableKeys["${attr_name}"] = true;
% endfor
	},
% for function_name, function_parms in obj['functions'].items():
<%
	argument_string = ""
	argument_names = []
	if 'arguments' in function_parms:
		argument_names.append("")
		for arg_parms in function_parms['arguments']:
			argument_names.append(arg_parms['name'])
		argument_string = ", data.".join(argument_names)
%>
	command_${function_name}: function(player, data) {
		return this.${function_name}(player${argument_string});
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

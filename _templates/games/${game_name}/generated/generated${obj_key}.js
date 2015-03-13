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

// @class Generated${obj_key}: The generated version of the ${obj_key}, that handles basic logic.
module.exports = Class(${", ".join(parent_classes) + "," if parent_classes else ""} {
	init: function(data) {
% for parent_class in reversed(parent_classes):
		${parent_class}.init.apply(this, arguments);
% endfor

		this.gameObjectName = "${obj_key}";

% for var_name, var_parms in obj['attributes'].items():
<%
	if 'serverPredefined' in var_parms and var_parms['serverPredefined']:
		continue

	var_default = var_parms["default"] if 'default' in var_parms else None
	var_type = var_parms["type"]

	if var_type == "string":
		var_default = '"' + (var_default if var_default != None else '') + '"'
	elif var_type == "array":
		var_default = '[]'
	elif var_type == "int" or var_type == "float":
		var_default = 0
	elif var_type == "dictionary":
		var_default = '{}'
	else:
		var_default = "null"
%>		this.${var_name} = (data.${var_name} === undefined ? ${var_default} : data.${var_name});
% endfor
	},

% for var_name, var_parms in obj['methods'].items():
<%
	argument_string = ""
	argument_names = []
	if 'arguments' in var_parms:
		argument_names.append("")
		for arg_parms in var_parms['arguments']:
			argument_names.append(arg_parms['name'])
		argument_string = ", data.".join(argument_names)
%>
	command_${var_name}: function(player, data) {
		return this.${var_name}(player${argument_string});
	},
% endfor
});

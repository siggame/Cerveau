// ${header}
// Note: this file should never be modified, instead if you want to add game logic modify just the ../${game_key}.js file. This is to ease merging main.data changes
var extend = require("extend");
var Class = require("../../../structures/class");
% if 'serverParentClasses' in game:
% for parent_class in game['serverParentClasses']:
var ${parent_class} = require("../../${uncapitalize(parent_class)}");
% endfor
% endif

% if game_key == "Game":
// Custom Game Objects
% for obj_key, obj in game_objs.items():
var ${obj_key} = require("../${uncapitalize(obj_key)}");
% endfor
% endif

// @class ${game_name}.Generated${game_key}: ${game['description']}
var Generated${game_key} = Class(
% if 'serverParentClasses' in game:
% for parent_class in game['serverParentClasses']:
	${parent_class},
% endfor
% endif
{
	init: function(data) {
% if 'serverParentClasses' in game:
% for parent_class in game['serverParentClasses']:
		${parent_class}.init.apply(this, arguments);
% endfor
% endif

		this.name = "${game_name}";
		extend(this.state, {
% for var_name, var_parms in game['attributes'].items():
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
%>			${var_name}: ${var_default},
% endfor
		});

		extend(this.gamelog, {
			gameName: "${game_name}",
		});
	},

% for obj_key, obj in game_objs.items():
	new${obj_key}: function(data) {
		data.game = this;
		return new ${obj_key}(data);
	},

% endfor
});

module.exports = Generated${game_key};

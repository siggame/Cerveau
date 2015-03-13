// ${header}
// Note: this is the file you should modify. The logic generated be Creer should be mostly in generated/
var Class = require("../../structures/class");
var Generated${obj_key} = require("./generated/generated${obj_key}")

// @class ${obj_key}: ${obj['description']}
module.exports = Class(Generated${obj_key}, {
	init: function(game, data) {
		Generated${obj_key}.init.apply(this, arguments);

		// put any initialization logic here. the base variables should be set from 'data' in Generated${obj_key}'s init function
	},

% for var_name, var_parms in obj['methods'].items():
<%
	if 'serverPredefined' in var_parms and var_parms['serverPredefined']:
		continue

	arg_names = [""]
	if 'arguments' in var_parms:
		for arg_parms in var_parms['arguments']:
			arg_names.append(arg_parms['name'])

	arg_string = ", ".join(arg_names)
%>
	${var_name}: function(player${arg_string}) {
		// Put your game logic for the ${obj_key}'s ${var_name} method here.
	},
% endfor
});

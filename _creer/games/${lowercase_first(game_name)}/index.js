// ${header}
// Note: You should never modify this file... probably.
<%include file="functions.noCreer" />
var serializer = require(__basedir + "/gameplay/serializer");

var classes = {};
% for game_obj_name in (['AI'] + game_obj_names):
<% game_obj = None
function_prefix = ""
if game_obj_name == 'AI':
    game_obj = ai
    game_obj_name = "Game"
    function_prefix = "aiFinished_"
else:
    game_obj = game_objs[game_obj_name]
%>
classes.${game_obj_name} = require("./${lowercase_first(game_obj_name)}");
% for function_name in game_obj['function_names']:
<% function_parms = game_obj['functions'][function_name]
%>
classes.${game_obj_name}.${function_prefix}${function_name}.cerveau = {
    args: [
% for argument in function_parms['arguments']:
        {
            name: "${argument['name']}",
            converter: ${shared['cerveau']['cast'](argument['type'])},
% if argument['optional']:
            defaultValue: ${shared['cerveau']['default'](argument['type'], argument['default'])},
% endif
        },
% endfor
    ],
    returns: ${'{' if function_parms['returns'] else "undefined,"}
% if function_parms['returns']:
        converter: ${shared['cerveau']['cast'](function_parms['returns']['type'])},
        defaultValue: ${shared['cerveau']['default'](function_parms['returns']['type'], function_parms['returns']['default'])},
    },
% endif
};
% endfor

${merge("//", "secret-" + game_obj_name, """
// if you want to add a \"secret\" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

""")}

% endfor

// Hook up the game's internal classes that we just finished initializing
classes.Game.classes = classes;
classes.Game.prototype.classes = classes;

module.exports = classes.Game;

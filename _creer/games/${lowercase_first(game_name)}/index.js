// Note: You should never modify this file... probably.
<%include file="functions.noCreer" />
var serializer = require(__basedir + "/gameplay/serializer");

var classes = {};
% for game_obj_name in (['Game'] + game_obj_names):
<% game_obj = None
if game_obj_name == 'Game':
    game_obj = game
else:
    game_obj = game_objs[game_obj_name]
%>
classes.${game_obj_name} = require("./${lowercase_first(game_obj_name)}");

classes.${game_obj_name}._deltaMergeableProperties = {
% for attr_name in game_obj['attribute_names']:
<%
    attr_parms = game_obj['attributes'][attr_name]
    #if 'serverPredefined' in attr_parms and attr_parms['serverPredefined']:
    #    continue
%>    ${attr_name}: {
        type: ${json.dumps(attr_parms['type'], sort_keys=True)},
        defaultValue: ${shared['cerveau']['default'](attr_parms['type'], attr_parms['default'])},
    },

% endfor
};
<%
if game_obj_name == 'Game': # because they have no functions, but the AI does, so use those
    is_ai = True
    game_obj = ai
else:
    is_ai = False
%>
% for function_name in game_obj['function_names']:
<% function_parms = game_obj['functions'][function_name]
formatted_function_name = function_name
if game_obj_name == "Game":
    formatted_function_name = "aiFinished" + upcase_first(function_name)
%>
classes.${game_obj_name}.${formatted_function_name}.cerveau = {
% if not is_ai:
    invalidate: classes.${game_obj_name}.invalidate${upcase_first(formatted_function_name)},
% endif
    args: [
% for argument in function_parms['arguments']:
        {
            name: "${argument['name']}",
            type: ${json.dumps(argument['type'], sort_keys=True)},
% if argument['optional']:
            defaultValue: ${shared['cerveau']['default'](argument['type'], argument['default'])},
% endif
        },
% endfor
    ],
    returns: ${'{' if function_parms['returns'] else "undefined,"}
% if function_parms['returns']:
        type: ${json.dumps(function_parms['returns']['type'], sort_keys=True)},
        defaultValue: ${shared['cerveau']['default'](function_parms['returns']['type'], function_parms['returns']['default'])},
    },
% if not is_ai:
    invalidValue: ${shared['cerveau']['default'](function_parms['returns']['type'], function_parms['returns']['invalidValue'])},
% endif
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

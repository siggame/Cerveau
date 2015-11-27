// ${header}
// Note: You should never modify this file... probably.
<%include file="functions.noCreer" />
var GameManager = require(__basedir + "/gameplay/shared/gameManager");
var serializer = require(__basedir + "/gameplay/serializer");

/**
 * An instance of the base GameManager class, given the structure of this ${game_name} game so it can manage the game safely.
 */
var ${lowercase_first(game_name)}GameManager = new GameManager({
    Game: {
        name: "${game_name}",
    },
% for game_obj_name in (['AI'] + game_obj_names):

<% game_obj = None
if game_obj_name == 'AI':
    game_obj = ai
else:
    game_obj = game_objs[game_obj_name]
%>    ${game_obj_name}: {
% for function_name in game_obj['function_names']:
<% function_parms = game_obj['functions'][function_name]
%>        ${function_name}: {
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
        },
% endfor

${merge("        //", "secret-" + game_obj_name, """
        // if you want to add a \"secret\" method that clients don't publicly know about, but can call, do so here. Best use case is an easy way for human clients to ask for special game information, otherwise forget this exists.

""")}

    },
% endfor
});

module.exports = ${lowercase_first(game_name)}GameManager;

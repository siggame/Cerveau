<%include file="functions.noCreer" /><%
imports = shared['cerveau']['generate_imports']('AI', ai, {
    './': [ 'BaseClasses' ]
})
%>${shared['cerveau']['imports'](imports)}
${merge('// ', 'imports',
'// any additional imports you want can be placed here safely between creer runs',
optional=True, help=False)}

/**
 * Represents the AI that a player controls. This acts as an interface to send
 * the AI orders to execute.
 */
export class AI extends BaseClasses.AI {

${merge('// ', 'attributes',
"""// If the AI needs additional attributes add them here.
// NOTE: these are not set in client AIs.""",
optional=True, help=False)}
% for function_name in ai['function_names']:
<%
    if function_name == "runTurn" and 'TurnBasedGame' in game['serverParentClasses']:
        continue #//this is implimented in based mixins for this project
    function_parms = ai['functions'][function_name]
    ret = function_parms['returns']
%>${shared['cerveau']['formatted_function_top'](function_name, ai, scope='public')}
        ${'return ' if ret else ''}this.executeOrder("${function_name}"${"" if not function_parms['arguments'] else '' + (
",\n            ".join([''] + [arg['name'] for arg in function_parms['arguments']]) + ",\n        "
)});
    }
% endfor

${merge('// ', 'functions',
"""// If the AI needs additional attributes add them here.
/// NOTE: these will not be callable in client AIs.""",
optional=True, help=False)}

}

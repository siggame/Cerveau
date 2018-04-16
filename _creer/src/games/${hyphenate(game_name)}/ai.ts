<%include file="functions.noCreer" />import { BaseClasses } from "./";

/**
 * Represents the AI that a player controls. This acts as an interface to send
 * the AI orders to execute.
 */
export class AI extends BaseClasses.AI {
% for function_name in ai['function_names']:
<%
    if function_name == "runTurn" and 'TurnBasedGame' in game['serverParentClasses']:
        continue #//this is implimented in based mixins for this project
    function_parms = ai['functions'][function_name]
    ret = function_parms['returns']
%>${shared['cerveau']['formatted_function_top'](function_name, ai)}
        return await this.executeOrder("functionName"${"" if not function_parms['arguments'] else '' + (
",\n            ".join([''] + [arg['name'] for arg in function_parms['arguments']]) + ",\n        "
)});
    }
% endfor
}

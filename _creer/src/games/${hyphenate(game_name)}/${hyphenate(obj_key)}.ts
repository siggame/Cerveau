<%include file="functions.noCreer" /><%
imports = shared['cerveau']['generate_imports'](obj_key, obj, {})

imports['./'] = []
imports['~/core/game'] = [ 'IBaseGameRequiredData' if obj_key == 'Game' else 'IBaseGameObjectRequiredData' ]

i_base_player = 'IBase{}Player'.format(game_name)

if obj_key == 'Game':
    imports['./game-settings'] = [ game_name + 'GameSettingsManager' ]
    imports['./game-manager'] = [ game_name + 'GameManager' ]
else:
    if obj_key == 'GameObject':
        imports['./game-manager'] = [ game_name + 'GameManager' ]
        imports['./game'] = [ game_name + 'Game' ]

    if obj_key == 'Player':
        imports['./'].append(i_base_player)
        imports['./ai'] = [ 'AI' ]
    else:
        imports['./'].append('I{}Properties'.format(obj_key))

    functions = list(obj['function_names'])
    if 'log' in functions: # log is server implimented
        functions.remove('log')

    if len(functions) > 0:
        # then there will be an invalidate function, which requires player
        if not './player' in imports:
            imports['./player'] = []
        if not 'Player' in imports['./player']:
            imports['./player'].append('Player')

extends = ''
if obj_key == 'Game' or obj_key == 'GameObject':
    imports['./'].append('BaseClasses')
    extends = 'BaseClasses.Game' if obj_key == 'Game' else 'BaseClasses.GameObject'

for parent_class in obj['parentClasses']:
    extends = parent_class
    filename = './' + hyphenate(parent_class)
    if not filename in imports:
        imports[filename] = []

    if not parent_class in imports[filename]:
        imports[filename].append(parent_class)

    if obj_key != 'Player':
        constructor_args = 'I{}ConstructorArgs'.format(parent_class)
        if not constructor_args in imports[filename]:
            imports[filename].append(constructor_args)

if obj_key == 'Player':
    extends = extends + ' implements ' + i_base_player

%>${shared['cerveau']['imports'](imports)}
${merge('// ', 'imports', """// any additional imports you want can be placed here safely between creer runs
""", optional=True, help=False)}
% if obj_key != 'Game' and obj_key != 'Player':

export interface I${obj_key}ConstructorArgs
extends ${', '.join([ 'I{}ConstructorArgs'.format(p) for p in obj['parentClasses'] ] + [''])}I${obj_key}Properties {
${merge('    // ', 'constructor-args', """    // You can add more constructor args in here
""", optional=True, help=False)}
}
% endif

${shared['cerveau']['block_comment']('', obj)}
export class ${obj_key if obj_key != 'Game' else (game_name + 'Game')} extends ${extends} {
% if obj_key == 'Game':
    /** The manager of this game, that controls everything around it */
    public readonly manager!: AnarchyGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

% elif obj_key == 'Player':
    /** The AI controlling this Player */
    public readonly ai!: AI;

% elif obj_key == 'GameObject':
    /** The game this game object is in */
    public readonly game!: ${game_name}Game;

    /** The manager of the game that controls this */
    public readonly manager!: ${game_name}GameManager;

% endif
% for attr_name in obj['attribute_names']:
<%
attr_parms = obj['attributes'][attr_name]
attr_type =  attr_parms['type']

readonly = 'readonly ' if attr_type['const'] else ''

if attr_type['is_game_object'] and obj_key != 'Player':
    nullable = '?' if attr_type['nullable'] else ''

    if 'serverPredefined' in attr_parms and attr_parms['serverPredefined'] and not attr_type['nullable']:
        nullable = '!' # because a base class will make sure it exists
else:
    nullable = '!'

%>${shared['cerveau']['block_comment']('    ', attr_parms)}
    public ${readonly}${attr_name}${nullable}: ${shared['cerveau']['type'](attr_type)};

% endfor
${merge('    // ', 'attributes', """
    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

""", optional=True, help=False)}

    /**
     * Called when a ${obj_key} is created.
     *
% if obj_key == 'Game':
     * @param settingsManager The settings manager that holds initial settings.
% else:
     * @param data Initial value(s) to set member variables to.
% endif
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
% if obj_key == 'Game':
        protected settingsManager: ${game_name}GameSettingsManager,
        required: IBaseGameRequiredData,
% else:
        data: ${'I{}ConstructorArgs'.format(obj_key) if obj_key != 'Player' else '{}'},
        required: IBaseGameObjectRequiredData,
% endif
    ) {
        super(${'settingsManager' if (obj_key == 'Game') else 'data'}, required);

${merge('        // ', 'constructor', """        // setup any thing you need here
""", optional=True, help=False)}
    }
% for function_name in obj['function_names']:
<%
    if obj_key == 'GameObject' and function_name == 'log':
        continue

    function_parms = obj['functions'][function_name]
    invalidate_function_name = 'invalidate' + upcase_first(function_name)

    temp = { 'functions': {} }
    temp['functions'][function_name] = dict(function_parms)

    temp['functions'][function_name]['arguments'] = [{
        'default': None,
        'name': 'player',
        'description': 'The player that called this.',
        'type': {
            'name': 'Player',
            'is_game_object': True,
            'valueType': None,
            'keyType': None,
        }
    }] + function_parms['arguments']

    temp['functions'][invalidate_function_name] = dict(temp['functions'][function_name])
    invalidate_obj = temp['functions'][invalidate_function_name]

    invalidate_obj['description'] = 'Invalidation function for {}. Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid.'.format(function_name)
    invalidate_obj['returns'] = {
        'default': None,
        'description': 'a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.',
        'invalidValue': None,
        'type': {
            'name': 'string | IArguments',
            'is_game_object': False,
            'valueType': None,
            'keyType': None,
        }
    }

%>
${shared['cerveau']['formatted_function_top'](invalidate_function_name, temp, promise=False)}
${merge('        // ', 'invalidate-' + function_name, """
        // Check all the arguments for {} here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

""".format(function_name), optional=True, help=False)}
        return arguments;
    }

${shared['cerveau']['formatted_function_top'](function_name, temp)}
${merge('        // ', function_name, """
        // Add logic here for {}.

        // TODO: replace this with actual logic
        return {};

""".format(function_name, shared['cerveau']['default'](function_parms['returns']['type'])), optional=True, help=False)}
    }
% endfor

${merge('    // ', 'functions', """
    // Any additional protected or pirate methods can go here.

""", optional=True, help=False)}
}

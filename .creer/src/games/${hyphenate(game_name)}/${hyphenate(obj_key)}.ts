<%include file="functions.noCreer" /><%
imports = shared['cerveau']['generate_imports'](obj_key, obj, {})

imports['./'] = []
imports['~/core/game'] = [ 'BaseGameRequiredData' if obj_key == 'Game' else 'BaseGameObjectRequiredData' ]

i_base_player = 'Base{}Player'.format(game_name)

if 'TiledGame' in game['serverParentClasses'] and obj_key == 'Tile':
    imports['~/core/game/mixins/tiled'] = [ 'BaseTile' ]

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
        imports['./'].append('{}Properties'.format(obj_key))

    functions = list(obj['function_names'])
    for function_name in functions:
        if function_name == 'log' and obj_key == 'GameObject':
            continue

        function_args_import = '{}{}Args'.format(obj_key, upcase_first(function_name))
        imports['./'].append(function_args_import)

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

    if obj_key != 'Player' and parent_class != 'GameObject':
        constructor_args = '{}Args'.format(parent_class)
        if not constructor_args in imports['./']:
            imports['./'].append(constructor_args)

if obj_key == 'Player':
    extends = extends + ' implements ' + i_base_player

%>${shared['cerveau']['imports'](imports)}
${merge('// ', 'imports', """// any additional imports you want can be placed here safely between creer runs
""", optional=True, help=False)}
% for attr_name in obj['attribute_names']:
<%
attr_parms = obj['attributes'][attr_name]
if not attr_parms['type']['literals']:
    continue
%>
${shared['cerveau']['block_comment']('', attr_parms)}
export type ${obj_key}${upcase_first(attr_name)} = ${shared['cerveau']['type'](attr_parms['type'])};
% endfor

${shared['cerveau']['block_comment']('', obj)}
export class ${obj_key if obj_key != 'Game' else (game_name + 'Game')} extends ${extends}${
    ' implements BaseTile' if 'TiledGame' in game['serverParentClasses'] and obj_key == 'Tile' else ''
} {
% if obj_key == 'Game':
    /** The manager of this game, that controls everything around it */
    public readonly manager!: ${game_name}GameManager;

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
     * @param settingsManager - The manager that holds initial settings.
% else:
     * @param args - Initial value(s) to set member variables to.
% endif
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
% if obj_key == 'Game':
        protected settingsManager: ${game_name}GameSettingsManager,
        required: Readonly<BaseGameRequiredData>,
% else: # if not a base class, or it is a `Tile`, and this is not a tiled game
%   if obj_key not in ['Player', 'GameObject', 'Tile'] or (obj_key == 'Tile' and 'TiledGame' not in game['serverParentClasses']):
<%
parent_unions = []
for parent_class in obj['parentClasses']:
    if parent_class == 'GameObject':
        continue
    parent_unions.append('{}Args'.format(parent_class))
unions = parent_unions + [ obj_key + 'Properties' ] + ['{']
%>        args: Readonly<
            ${' & '.join(unions)}
${merge('                // ', 'constructor-args', """                // You can add more constructor args in here
""", optional=True, help=False)}
            }
        >,
%   else:
        // never directly created by game developers
        args: Readonly<${(('Base' + game_name + 'Player') if obj_key == 'Player' else (obj_key + 'Properties'))}>,
%   endif
        required: Readonly<BaseGameObjectRequiredData>,
% endif
    ) {
        super(${'settingsManager' if (obj_key == 'Game') else 'args'}, required);

${merge('        // ', 'constructor', """        // setup any thing you need here
""", optional=True, help=False)}
    }

${merge('    // ', 'public-functions', """
    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

""", optional=True, help=False)}
% if 'TiledGame' in game['serverParentClasses']:
%   if obj_key == 'Game':

    /**
     * Gets the tile at (x, y), or undefined if the co-ordinates are off-map.
     *
     * @param x - The x position of the desired tile.
     * @param y - The y position of the desired tile.
     * @returns The Tile at (x, y) if valid, undefined otherwise.
     */
    public getTile(x: number, y: number): Tile | undefined {
        return super.getTile(x, y) as Tile | undefined;
    }
%   elif obj_key == 'Tile':

    /**
     * Gets the adjacent direction between this Tile and an adjacent Tile
     * (if one exists).
     *
     * @param adjacentTile - A tile that should be adjacent to this Tile.
     * @returns "North", "East", "South", or "West" if the tile is adjacent to
     * this Tile in that direction. Otherwise undefined.
     */
    public getAdjacentDirection(
        adjacentTile: Tile | undefined,
    ): "North" | "South" | "East" | "West" | undefined {
        return BaseTile.prototype.getAdjacentDirection.call(
            this,
            adjacentTile,
        );
    }

    /**
     * Gets a list of all the neighbors of this Tile.
     *
     * @returns An array of all adjacent tiles. Should be between 2 to 4 tiles.
     */
    public getNeighbors(): Tile[] {
        return BaseTile.prototype.getNeighbors.call(this) as Tile[];
    }

    /**
     * Gets a neighbor in a particular direction
     *
     * @param direction - The direction you want, must be
     * "North", "East", "South", or "West".
     * @returns The Tile in that direction, or undefined if there is none.
     */
    public getNeighbor(
        direction: "North" | "East" | "South" | "West",
    ): Tile | undefined {
        return BaseTile.prototype.getNeighbor.call(this, direction) as
            | Tile
            | undefined;
    }

    /**
     * Checks if a Tile has another Tile as its neighbor.
     *
     * @param tile - The Tile to check.
     * @returns True if neighbor, false otherwise.
     */
    public hasNeighbor(tile: Tile | undefined): boolean {
        return BaseTile.prototype.hasNeighbor.call(this, tile);
    }

    /**
     * toString override.
     *
     * @returns A string representation of the Tile.
     */
    public toString(): string {
        return BaseTile.prototype.toString.call(this);
    }
%   endif
% endif
% for function_name in obj['function_names']:
<%
    if obj_key == 'GameObject' and function_name == 'log':
        continue

    upcase_first_function_name = upcase_first(function_name)
    function_parms = obj['functions'][function_name]
    invalidate_function_name = 'invalidate' + upcase_first_function_name

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
            'nullable': False,
        }
    }] + function_parms['arguments']

    temp['functions'][invalidate_function_name] = dict(temp['functions'][function_name])
    invalidate_obj = temp['functions'][invalidate_function_name]

    invalidate_obj['description'] = 'Invalidation function for {}. Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid.'.format(function_name)
    invalidate_obj['returns'] = {
        'default': None,
        'description': 'If the arguments are invalid, return a string explaining to human players why it is invalid. If it is valid return nothing, or an object with new arguments to use in the actual function.',
        'invalidValue': None,
        'type': {
            'name': 'void | string | {}{}Args'.format(obj_key, upcase_first_function_name),
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
    }

${shared['cerveau']['formatted_function_top'](function_name, temp)}
${merge('        // ', function_name, """
        // Add logic here for {}.

        // TODO: replace this with actual logic
        return {};

""".format(function_name, shared['cerveau']['default'](function_parms['returns']['type'])), optional=True, help=False)}
    }
% endfor

${merge('    // ', 'protected-private-functions', """
    // Any additional protected or pirate methods can go here.

""", optional=True, help=False)}
}

// WARNING: Here be Dragons
// This file is generated by Creer, do not modify it
// This basically sets up all the classes we need for TypeScript to know the
// base classes with minimal code for developers to be forced to fill out
<%include file="functions.noCreer" />
// tslint:disable:max-classes-per-file - because we need to build a bunch of base class wrappers here

// base game classes
import {
    BaseAI, BaseGame, BaseGameManager, BaseGameObject,
    BaseGameObjectFactory, BaseGameSettingsManager, IBasePlayer, makeNamespace,
} from "~/core/game";

// mixins<%

mixin_imports = []
mixed_players = []
mixins = []
for parent_class in game['serverParentClasses']:
    no_game = upcase_first(parent_class[:-4]) # slice off "Game" from the end of the string

    mixed_player = 'I' + no_game + 'Player'
    mixed_players.append(mixed_player)

    mixin = 'mix' + no_game
    mixins.append(mixin)

    mixin_imports.extend([mixin, mixed_player])

imports = {
    "~/core/game/mixins": mixin_imports,
}

%>
${shared['cerveau']['imports'](imports)}
export interface IBase${game_name}Player extends IBasePlayer${', '.join([''] + [m for m in mixed_players])} {}
<% base_index = 1 %>
const base0 = {
    AI: BaseAI,
    Game: BaseGame,
    GameManager: BaseGameManager,
    GameObject: BaseGameObject,
    GameSettings: BaseGameSettingsManager,
};

% for i, mixin in enumerate(mixins):
const base${i + 1} = ${mixin}(base${i});
% endfor

const mixed = base${len(mixins)};

export class Base${game_name}AI extends mixed.AI {}
class Base${game_name}Game extends mixed.Game {}
class Base${game_name}GameManager extends mixed.GameManager {}
class Base${game_name}GameObject extends mixed.GameObject {}
class Base${game_name}GameSettings extends mixed.GameSettings {}

export const BaseClasses = {
    AI: Base${game_name}AI,
    Game: Base${game_name}Game,
    GameManager: Base${game_name}GameManager,
    GameObject: Base${game_name}GameObject,
    GameSettings: Base${game_name}GameSettings,
};

// now all the base classes are created, so we can start importing/exporting the classes that need them

% for game_obj_name in sort_dict_keys(game_objs):
<%
game_obj = game_objs[game_obj_name]
%>export interface I${game_obj_name}Properties {
%   for attr_name in sort_dict_keys(game_obj['attributes']):
<%
if attr_name in ['gameObjectName', 'id', 'logs']:
    continue

attr = game_obj['attributes'][attr_name]
%>    ${attr_name}?: ${shared['cerveau']['type'](attr['type'], allow_undefined=False)};
%   endfor
}

% endfor
% for game_obj_name in sort_dict_keys(game_objs):
export * from "./${hyphenate(game_obj_name)}";
% endfor
export * from "./game";
export * from "./game-manager";
export * from "./ai";

<%
for game_obj_name in sort_dict_keys(game_objs):
    imports = {}
    imports['./' + hyphenate(game_obj_name)] = [game_obj_name] + (
        [] if (game_obj_name in ['Player', 'GameObject']) else ['I' + game_obj_name + 'ConstructorArgs']
    )

    context.write(shared['cerveau']['imports'](imports))
%>import { ${game_name}Game } from "./game";
import { ${game_name}GameManager } from "./game-manager";
import { AI } from "./ai";
import { ${game_name}GameSettingsManager } from "./game-settings";

export class ${game_name}GameObjectFactory extends BaseGameObjectFactory {
% for game_obj_name in sort_dict_keys(game_objs):
<%
    if game_obj_name in ['Player', 'GameObject']:
        continue # skip these, they can never be created via game logic
%>    public ${game_obj_name}(data: I${game_obj_name}ConstructorArgs): ${game_obj_name} {
        return this.createGameObject("${game_obj_name}", ${game_obj_name}, data);
    }
% endfor
}

export const Namespace = makeNamespace({
    AI,
    Game: ${game_name}Game,
    GameManager: ${game_name}GameManager,
    GameObjectFactory: ${game_name}GameObjectFactory,
    GameSettingsManager: ${game_name}GameSettingsManager,
    Player,

    // these are generated metadata that allow delta-merging values from clients
    // they are never intended to be directly interfaced with outside of
    // Cerveau core developers
    gameSettingsManager: new ${game_name}GameSettingsManager(),
    gameObjectsSchema: {
% for obj_name in (['AI', 'Game'] + sort_dict_keys(game_objs)):
<%
obj = None
if obj_name == 'AI':
    obj = ai
elif obj_name == 'Game':
    obj = game
else:
    obj = game_objs[obj_name]


%>        ${obj_name}: {
            attributes: {
%   if 'attributes' in obj:
%           for attr_name in sort_dict_keys(obj['attributes']):
                ${attr_name}: {
${shared['cerveau']['schema_type'](obj['attributes'][attr_name]['type'], 5)}
                },
%       endfor
%   endif
            },
            functions: {
%   if 'functions' in obj:
%       for function_name in sort_dict_keys(obj['functions']):
<%
    function_parms = obj['functions'][function_name]
    returns = function_parms['returns']
%>                ${function_name}: {
                    args: [
%           for arg in function_parms['arguments']:
                        {
                            argName: "${arg['name']}",
${shared['cerveau']['schema_type'](arg['type'], 7)}
                        },
%           endfor
                    ],
%           if returns:
%               if 'invalidValue' in returns:
                    invalidValue: ${shared['cerveau']['value'](returns['type'], returns['invalidValue']) if returns else 'undefined'},
%               endif
                    returns: {
${shared['cerveau']['schema_type'](returns['type'], 6)}
                    },
%           endif
                },
%       endfor
            },
%   endif
        },
% endfor
    },
);

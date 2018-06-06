<%include file="functions.noCreer" />import { IAnyObject } from "~/utils";
import { BaseClasses } from "./";

${merge('// ', 'imports', '// any additional imports you want can be placed here safely between creer runs', optional=True, help=False)}

/**
 * The settings manager for the ${game['name']} game.
 */
export class ${game['name']}GameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public schema = this.makeSchema({
        ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it

        // ${game_name} game specific settings
% for attr_name in game['attribute_names']:
<%

attr_parms = game['attributes'][attr_name]
setting = attr_parms['setting']

if not setting:
    continue

setting_name = setting if type(setting) is str else attr_name
%>        ${setting_name}: {
            description: ${
                shared['cerveau']['wrap_string'](
                attr_parms['description'],
                52,
                "                       + "
)},
${merge('            // ', setting_name,
'            default: {},'.format(shared['cerveau']['default'](attr_parms['type'])), optional=True, help=False)}
        },
% endfor
${merge('        // ', 'schema', """
        // you can add more settings here, e.g.:
        /*
        someVariableLikeUnitHealth: {
            description: "Describe what this setting does for the players.",
            default: 1337,
            min: 1,
        },
        */

""", optional=True, help=False)}

        // Base settings
        playerStartingTime: {
${merge('            // ', 'player-starting-time',
'            default: 6e10, // 1 min in ns', optional=True, help=False)}
            min: 0,
            description: "The starting time (in ns) for each player.",
        },

% if 'TurnBasedGame' in game['serverParentClasses']:
        // Turn based settings
        timeAddedPerTurn: {
${merge('            // ', 'time-added-per-turn',
'            default: 1e9, // 1 sec in ns,', optional=True, help=False)}
            min: 0,
            description: "The amount of time (in nano-seconds) to add after each player performs a turn.",
        },
        maxTurns: {
${merge('            // ', 'max-turns',
'            default: 200,', optional=True, help=False)}
            min: 1,
            description: "The maximum number of turns before the game is force ended and a winner is determined.",
        },

% endif
% if 'TiledGame' in game['serverParentClasses']:
        // Tiled settings
        mapWidth: {
${merge('            // ', 'map-width',
'            default: 32,', optional=True, help=False)}
            min: 2,
            description: "The width (in Tiles) for the game map to be initialized to.",
        },
        mapHeight: {
${merge('            // ', 'map-height',
'            default: 16,', optional=True, help=False)}
            min: 2,
            description: "The height (in Tiles) for the game map to be initialized to.",
        },

% endif
    });

    /**
     * The current values for the game's settings
     */
    public values = this.initialValues(this.schema);

    /**
     * Try to invalidate all the game settings here, so invalid values do not
     * reach the game.
     * @param someSettings A subset of settings that will be tested
     * @returns An error if the settings fail to validate.
     */
    protected invalidate(someSettings: IAnyObject): IAnyObject | Error {
        const invalidated = super.invalidate(someSettings);
        if (invalidated instanceof Error) {
            return invalidated;
        }

        const settings = { ...this.values, ...someSettings, ...invalidated };

${merge('        // ', 'invalidate', """
        // Write logic here to check the values in `settings`. If there is a
        // problem with the values a player sent, return an error with a string
        // describing why their value(s) are wrong

""", optional=True, help=False)}

        return settings;
    }
}

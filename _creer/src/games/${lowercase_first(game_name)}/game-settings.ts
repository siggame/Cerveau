import { IAnyObject } from "~/utils";
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

${merge('        // ', 'schema', """
        // you can add settings here, e.g.:
        /*
        someVariableLikeUnitHealth: {
            default: 1337,
            min: 1,
            description: "Describe what this setting does for the players.",
        },
        */

""", optional=True, help=False)}

    });

    /**
     * The current values for the game's settings
     */
    public values = this.initialValues(this.schema);

    /**
     * Try to invalidate all the game settings here, so invalid values do not
     * reach the game.
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

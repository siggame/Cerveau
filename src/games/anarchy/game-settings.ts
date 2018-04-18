import { IAnyObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Anarchy game.
 */
export class AnarchyGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public schema = this.makeSchema({
        ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it

        // <<-- Creer-Merge: schema -->>

        mapWidth: {
            default: 40,
            min: 2,
            description: "The width (in Buildings) for the game map to be initialized to.",
        },
        mapHeight: {
            default: 20,
            min: 2,
            description: "The height (in Buildings) for the game map to be initialized to.",
        },
        maxFire: {
            default: 20,
            min: 1,
            description: "The maximum amount of fire value for any Building.",
        },
        baseBribesPerTurn: {
            default: 10,
            min: 1,
            description: "How many bribes players get at the beginning of "
            + "their turn, not counting their burned down Buildings.",
        },
        buildingStartingHealth: {
            default: 100,
            min: 1,
            description: "The amount of health buildings start the game with.",
        },
        headquartersHealthScalar: {
            default: 3,
            min: 1,
            description: "How much health to scale (multiply a Headquarters health by",
        },
        maxForecastIntensity: {
            default: 10,
            min: 1,
            description: "The maximum intensity to allow Forecasts to have.",
        },
        firePerTurnReduction: {
            default: 1,
            min: 0,
            description: "How much fire to remove per turn.",
        },
        exposurePerTurnReduction: {
            default: 10,
            min: 0,
            description: "How much exposure to remove per turn.",
        },

        // <<-- /Creer-Merge: schema -->>

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

        // <<-- Creer-Merge: invalidate -->>

        // Write logic here to check the values in `settings`. If there is a
        // problem with the values a player sent, return an error with a string
        // describing why their value(s) are wrong

        // <<-- /Creer-Merge: invalidate -->>

        return settings;
    }
}

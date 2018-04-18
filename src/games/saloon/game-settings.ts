import { IAnyObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Saloon game.
 */
export class SaloonGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public schema = this.makeSchema({
        ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it

        // <<-- Creer-Merge: schema -->>

        turnsDrunk: {
            description: "The number of turns a cowboy is busy being drunk, after it first gets drunk.",
            default: 5,
            min: 0,
        },
        bartenderCooldown: {
            description: "How many turns a Bartender is busy after throwing a bottle.",
            default: 5,
            min: 0,
        },
        rowdinessToSiesta: {
            description: "How much rowdiness a player must get to force a siesta.",
            default: 8,
            min: 1,
        },
        siestaLength: {
            description: "How many turns a siesta lasts",
            default: 8,
            min: 0,
        },
        maxCowboysPerJob: {
            description: "Maximum number of cowboys that can be called in per job.",
            default: 2,
            min: 1,
        },
        sharpshooterDamage: {
            description: "How much damage a Sharpshooter does to everything it hits.",
            default: 2,
            min: 0,
        },
        brawlerDamage: {
            description: "How much damage a Brawler does to its surroundings.",
            default: 1,
            min: 0,
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

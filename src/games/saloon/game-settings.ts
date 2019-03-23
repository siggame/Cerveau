import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
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
    public get schema() { // tslint:disable-line:typedef
        return {
            // HACK: `super` should work. but schema is undefined on it at run time.
            // tslint:disable-next-line:no-any
            ...(super.schema || (this as any).schema),

            // Saloon game specific settings
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

            // Base settings
            playerStartingTime: {
                // <<-- Creer-Merge: player-starting-time -->>
                default: 6e10, // 1 min in ns
                // <<-- /Creer-Merge: player-starting-time -->>
                min: 0,
                description: "The starting time (in ns) for each player.",
            },

            // Turn based settings
            timeAddedPerTurn: {
                // <<-- Creer-Merge: time-added-per-turn -->>
                default: 1e9, // 1 sec in ns,
                // <<-- /Creer-Merge: time-added-per-turn -->>
                min: 0,
                description: "The amount of time (in nano-seconds) to add after each player performs a turn.",
            },
            maxTurns: {
                // <<-- Creer-Merge: max-turns -->>
                default: 200,
                // <<-- /Creer-Merge: max-turns -->>
                min: 1,
                description: "The maximum number of turns before the game is force ended and a winner is determined.",
            },

            // Tiled settings
            mapWidth: {
                // <<-- Creer-Merge: map-width -->>
                default: 32,
                // <<-- /Creer-Merge: map-width -->>
                min: 2,
                description: "The width (in Tiles) for the game map to be initialized to.",
            },
            mapHeight: {
                // <<-- Creer-Merge: map-height -->>
                default: 16,
                // <<-- /Creer-Merge: map-height -->>
                min: 2,
                description: "The height (in Tiles) for the game map to be initialized to.",
            },

        };
    }

    /**
     * The current values for the game's settings
     */
    public values!: SettingsFromSchema<SaloonGameSettingsManager["schema"]>;

    /**
     * Try to invalidate all the game settings here, so invalid values do not
     * reach the game.
     * @param someSettings A subset of settings that will be tested
     * @returns An error if the settings fail to validate.
     */
    protected invalidate(someSettings: UnknownObject): UnknownObject | Error {
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

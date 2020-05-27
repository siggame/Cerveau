import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
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
    public get schema() {
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(super.schema || (this as any).schema),

            // Anarchy game specific settings
            // <<-- Creer-Merge: schema -->>

            mapWidth: {
                default: 40,
                min: 2,
                description:
                    "The width (in Buildings) for the game map to be initialized to.",
            },
            mapHeight: {
                default: 20,
                min: 2,
                description:
                    "The height (in Buildings) for the game map to be initialized to.",
            },
            maxFire: {
                default: 20,
                min: 1,
                description:
                    "The maximum amount of fire value for any Building.",
            },
            baseBribesPerTurn: {
                default: 10,
                min: 1,
                description:
                    "How many bribes players get at the beginning of " +
                    "their turn, not counting their burned down Buildings.",
            },
            buildingStartingHealth: {
                default: 100,
                min: 1,
                description:
                    "The amount of health buildings start the game with.",
            },
            headquartersHealthScalar: {
                default: 3,
                min: 1,
                description:
                    "How much health to scale (multiply a Headquarters health by",
            },
            maxForecastIntensity: {
                default: 10,
                min: 1,
                description:
                    "The maximum intensity to allow Forecasts to have.",
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
                description:
                    "The amount of time (in nano-seconds) to add after " +
                    "each player performs a turn.",
            },
            maxTurns: {
                // <<-- Creer-Merge: max-turns -->>
                default: 200,
                // <<-- /Creer-Merge: max-turns -->>
                min: 1,
                description:
                    "The maximum number of turns before the game " +
                    "is force ended and a winner is determined.",
            },
        });
    }

    /**
     * The current values for the game's settings.
     */
    public values!: SettingsFromSchema<AnarchyGameSettingsManager["schema"]>;

    /**
     * Try to invalidate all the game settings here, so invalid values do not
     * reach the game.
     *
     * @param someSettings - A subset of settings that will be tested.
     * @returns An error if the settings fail to validate, otherwise the
     * valid game settings for this game.
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

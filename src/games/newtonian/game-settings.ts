import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Newtonian game.
 */
export class NewtonianGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public get schema() {
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            ...(super.schema || (this as any).schema),

            // Newtonian game specific settings
            internCap: {
                description:
                    "The maximum number of interns a player can have.",
                // <<-- Creer-Merge: internCap -->>
                default: 4,
                min: 0,
                // <<-- /Creer-Merge: internCap -->>
            },

            managerCap: {
                description:
                    "The maximum number of managers a player can have.",
                // <<-- Creer-Merge: managerCap -->>
                default: 4,
                min: 0,
                // <<-- /Creer-Merge: managerCap -->>
            },

            materialSpawn: {
                description:
                    "The number of materials that spawn per spawn cycle.",
                // <<-- Creer-Merge: materialSpawn -->>
                default: 2,
                min: 0,
                // <<-- /Creer-Merge: materialSpawn -->>
            },

            physicistCap: {
                description:
                    "The maximum number of physicists a player can have.",
                // <<-- Creer-Merge: physicistCap -->>
                default: 4,
                min: 0,
                // <<-- /Creer-Merge: physicistCap -->>
            },

            refinedValue: {
                description:
                    "The amount of victory points added when a refined ore " +
                    "is consumed by the generator.",
                // <<-- Creer-Merge: refinedValue -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: refinedValue -->>
            },

            regenerateRate: {
                description:
                    "The percent of max HP regained when a unit end their " +
                    "turn on a tile owned by their player.",
                // <<-- Creer-Merge: regenerateRate -->>
                default: 0.5,
                // <<-- /Creer-Merge: regenerateRate -->>
            },

            spawnTime: {
                description: "The amount of turns it takes a unit to spawn.",
                // <<-- Creer-Merge: spawnTime -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: spawnTime -->>
            },

            stunTime: {
                description:
                    "The amount of turns a unit cannot do anything when " +
                    "stunned.",
                // <<-- Creer-Merge: stunTime -->>
                default: 2,
                min: 1,
                // <<-- /Creer-Merge: stunTime -->>
            },

            timeImmune: {
                description:
                    "The number turns a unit is immune to being stunned.",
                // <<-- Creer-Merge: timeImmune -->>
                default: 4,
                min: 1,
                // <<-- /Creer-Merge: timeImmune -->>
            },

            victoryAmount: {
                description:
                    "The amount of combined heat and pressure that you need" +
                    " to win.",
                // <<-- Creer-Merge: victoryAmount -->>
                default: 800,
                min: 1,
                // <<-- /Creer-Merge: victoryAmount -->>
            },

            // <<-- Creer-Merge: schema -->>

            // you can add more settings here, e.g.:
            /*
        someVariableLikeUnitHealth: {
            description: "Describe what this setting does for the players.",
            default: 1337,
            min: 1,
        },
        */

            // <<-- /Creer-Merge: schema -->>

            // Base settings
            playerStartingTime: {
                // <<-- Creer-Merge: player-starting-time -->>
                default: 18e10, // 1 min in ns
                // <<-- /Creer-Merge: player-starting-time -->>
                min: 0,
                description: "The starting time (in ns) for each player.",
            },

            // Turn based settings
            timeAddedPerTurn: {
                // <<-- Creer-Merge: time-added-per-turn -->>
                default: 2e9, // 2 sec in ns,
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

            // Tiled settings
            mapWidth: {
                // <<-- Creer-Merge: map-width -->>
                default: 51,
                // <<-- /Creer-Merge: map-width -->>
                min: 2,
                description:
                    "The width (in Tiles) for the game map to be " +
                    "initialized to.",
            },
            mapHeight: {
                // <<-- Creer-Merge: map-height -->>
                default: 29,
                // <<-- /Creer-Merge: map-height -->>
                min: 2,
                description:
                    "The height (in Tiles) for the game map to be " +
                    "initialized to.",
            },
        });
    }

    /**
     * The current values for the game's settings.
     */
    public values!: SettingsFromSchema<NewtonianGameSettingsManager["schema"]>;

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

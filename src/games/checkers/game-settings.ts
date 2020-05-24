import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Checkers game.
 */
export class CheckersGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public get schema() {
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(super.schema || (this as any).schema),

            // Checkers game specific settings
            // <<-- Creer-Merge: schema -->>

            /** The width of the board (in tiles). */
            boardWidth: {
                default: 8,
                min: 2,
                description: "The width of the board (in tiles).",
            },

            /** The height of the board (in tiles). */
            boardHeight: {
                default: 8,
                min: 2,
                description: "The height of the board (in tiles).",
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
     * The current values for the game's settings
     */
    public values!: SettingsFromSchema<CheckersGameSettingsManager["schema"]>;

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

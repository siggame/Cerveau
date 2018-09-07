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
    public schema = this.makeSchema({
// HACK: `super` should work. but schema is undefined on it at run time.
        // tslint:disable-next-line:no-any
        ...(super.schema || (this as any).schema),

        // Newtonian game specific settings
        degradeRate: {
            description: "Determins the rate at which the highest value "
                       + "victory points degrade.",
            // <<-- Creer-Merge: degradeRate -->>
            default: 0,
            // <<-- /Creer-Merge: degradeRate -->>
        },
        internCap: {
            description: "How many interns a player can have.",
            // <<-- Creer-Merge: internCap -->>
            default: 0,
            // <<-- /Creer-Merge: internCap -->>
        },
        managerCap: {
            description: "How many managers a player can have.",
            // <<-- Creer-Merge: managerCap -->>
            default: 0,
            // <<-- /Creer-Merge: managerCap -->>
        },
        physicistCap: {
            description: "How many physicists a player can have.",
            // <<-- Creer-Merge: physicistCap -->>
            default: 0,
            // <<-- /Creer-Merge: physicistCap -->>
        },
        refinedValue: {
            description: "How much each refined ore adds when put in the "
                       + "generator.",
            // <<-- Creer-Merge: refinedValue -->>
            default: 0,
            // <<-- /Creer-Merge: refinedValue -->>
        },
        spawnTime: {
            description: "The number of turns between spawning unit waves.",
            // <<-- Creer-Merge: spawnTime -->>
            default: 0,
            // <<-- /Creer-Merge: spawnTime -->>
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
            default: 69,
            // <<-- /Creer-Merge: map-width -->>
            min: 2,
            description: "The width (in Tiles) for the game map to be initialized to.",
        },
        mapHeight: {
            // <<-- Creer-Merge: map-height -->>
            default: 23,
            // <<-- /Creer-Merge: map-height -->>
            min: 2,
            description: "The height (in Tiles) for the game map to be initialized to.",
        },

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

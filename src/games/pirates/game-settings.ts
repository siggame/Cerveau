import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Pirates game.
 */
export class PiratesGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public get schema() {
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(super.schema || (this as any).schema),

            // Pirates game specific settings
            buryInterestRate: {
                description: "The rate buried gold increases each turn.",
                // <<-- Creer-Merge: buryInterestRate -->>
                default: 0,
                // <<-- /Creer-Merge: buryInterestRate -->>
            },

            crewCost: {
                description:
                    "How much gold it costs to construct a single crew.",
                // <<-- Creer-Merge: crewCost -->>
                default: 0,
                // <<-- /Creer-Merge: crewCost -->>
            },

            crewDamage: {
                description: "How much damage crew deal to each other.",
                // <<-- Creer-Merge: crewDamage -->>
                default: 0,
                // <<-- /Creer-Merge: crewDamage -->>
            },

            crewHealth: {
                description:
                    "The maximum amount of health a crew member can have.",
                // <<-- Creer-Merge: crewHealth -->>
                default: 0,
                // <<-- /Creer-Merge: crewHealth -->>
            },

            crewMoves: {
                description:
                    "The number of moves Units with only crew are given " +
                    "each turn.",
                // <<-- Creer-Merge: crewMoves -->>
                default: 0,
                // <<-- /Creer-Merge: crewMoves -->>
            },

            crewRange: {
                description: "A crew's attack range. Range is circular.",
                // <<-- Creer-Merge: crewRange -->>
                default: 0,
                // <<-- /Creer-Merge: crewRange -->>
            },

            healFactor: {
                description:
                    "How much health a Unit recovers when they rest.",
                // <<-- Creer-Merge: healFactor -->>
                default: 0,
                // <<-- /Creer-Merge: healFactor -->>
            },

            merchantGoldRate: {
                description: "How much gold merchant Ports get each turn.",
                // <<-- Creer-Merge: merchantGoldRate -->>
                default: 0,
                // <<-- /Creer-Merge: merchantGoldRate -->>
            },

            merchantInterestRate: {
                description:
                    "When a merchant ship spawns, the amount of additional " +
                    "gold it has relative to the Port's investment.",
                // <<-- Creer-Merge: merchantInterestRate -->>
                default: 0,
                // <<-- /Creer-Merge: merchantInterestRate -->>
            },

            minInterestDistance: {
                description:
                    "The Euclidean distance buried gold must be from the " +
                    "Player's Port to accumulate interest.",
                // <<-- Creer-Merge: minInterestDistance -->>
                default: 0,
                // <<-- /Creer-Merge: minInterestDistance -->>
            },

            restRange: {
                description:
                    "How far a Unit can be from a Port to rest. Range is " +
                    "circular.",
                // <<-- Creer-Merge: restRange -->>
                default: 0,
                // <<-- /Creer-Merge: restRange -->>
            },

            shipCost: {
                description: "How much gold it costs to construct a ship.",
                // <<-- Creer-Merge: shipCost -->>
                default: 0,
                // <<-- /Creer-Merge: shipCost -->>
            },

            shipDamage: {
                description: "How much damage ships deal to ships and ports.",
                // <<-- Creer-Merge: shipDamage -->>
                default: 0,
                // <<-- /Creer-Merge: shipDamage -->>
            },

            shipHealth: {
                description: "The maximum amount of health a ship can have.",
                // <<-- Creer-Merge: shipHealth -->>
                default: 0,
                // <<-- /Creer-Merge: shipHealth -->>
            },

            shipMoves: {
                description:
                    "The number of moves Units with ships are given each " +
                    "turn.",
                // <<-- Creer-Merge: shipMoves -->>
                default: 0,
                // <<-- /Creer-Merge: shipMoves -->>
            },

            shipRange: {
                description: "A ship's attack range. Range is circular.",
                // <<-- Creer-Merge: shipRange -->>
                default: 0,
                // <<-- /Creer-Merge: shipRange -->>
            },

            // <<-- Creer-Merge: schema -->>

            startingGold: {
                description:
                    "The amount of gold to start with per player. " +
                    "Values < 0 will default to shipCost * 3 + crewCost",
                default: -1,
            },

            maxTileGold: {
                description:
                    "The maximum amount of gold a Tile can have on it.",
                default: 10000,
                min: 1,
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
                default: 720,
                // <<-- /Creer-Merge: max-turns -->>
                min: 1,
                description:
                    "The maximum number of turns before the game " +
                    "is force ended and a winner is determined.",
            },

            // Tiled settings
            mapWidth: {
                // <<-- Creer-Merge: map-width -->>
                default: 40,
                // <<-- /Creer-Merge: map-width -->>
                min: 2,
                description:
                    "The width (in Tiles) for the game map to be " +
                    "initialized to.",
            },
            mapHeight: {
                // <<-- Creer-Merge: map-height -->>
                default: 20,
                // <<-- /Creer-Merge: map-height -->>
                min: 2,
                description:
                    "The height (in Tiles) for the game map to be " +
                    "initialized to.",
            },
        });
    }

    /**
     * The current values for the game's settings
     */
    public values!: SettingsFromSchema<PiratesGameSettingsManager["schema"]>;

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

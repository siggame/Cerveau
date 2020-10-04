import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Coreminer game.
 */
export class CoreminerGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public get schema() { // tslint:disable-line:typedef
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // tslint:disable-next-line:no-any
            ...(super.schema || (this as any).schema),

            // Coreminer game specific settings
            bombPrice: {
                description: "The monetary price of a bomb when bought or "
                           + "sold.",
                // <<-- Creer-Merge: bombPrice -->>
                default: 0,
                // <<-- /Creer-Merge: bombPrice -->>
            },
            bombSize: {
                description: "The amount of cargo space taken up by a bomb.",
                // <<-- Creer-Merge: bombSize -->>
                default: 0,
                // <<-- /Creer-Merge: bombSize -->>
            },
            buildingMaterialPrice: {
                description: "The monetary price of building materials when "
                           + "bought.",
                // <<-- Creer-Merge: buildingMaterialPrice -->>
                default: 0,
                // <<-- /Creer-Merge: buildingMaterialPrice -->>
            },
            dirtPrice: {
                description: "The monetary price of dirt when bought or sold.",
                // <<-- Creer-Merge: dirtPrice -->>
                default: 0,
                // <<-- /Creer-Merge: dirtPrice -->>
            },
            ladderCost: {
                description: "The amount of building material required to "
                           + "build a ladder.",
                // <<-- Creer-Merge: ladderCost -->>
                default: 0,
                // <<-- /Creer-Merge: ladderCost -->>
            },
            orePrice: {
                description: "The amount of money awarded when ore is dumped "
                           + "in the base and sold.",
                // <<-- Creer-Merge: orePrice -->>
                default: 0,
                // <<-- /Creer-Merge: orePrice -->>
            },
            oreValue: {
                description: "The amount of victory points awarded when ore is "
                           + "dumped in the base and sold.",
                // <<-- Creer-Merge: oreValue -->>
                default: 1,
                min: 1,
                // <<-- /Creer-Merge: oreValue -->>
            },
            shieldCost: {
                description: "The amount of building material required to "
                           + "shield a Tile.",
                // <<-- Creer-Merge: shieldCost -->>
                default: 0,
                // <<-- /Creer-Merge: shieldCost -->>
            },
            spawnPrice: {
                description: "The monetary price of spawning a Miner.",
                // <<-- Creer-Merge: spawnPrice -->>
                default: 0,
                // <<-- /Creer-Merge: spawnPrice -->>
            },
            supportCost: {
                description: "The amount of building material required to "
                           + "build a support.",
                // <<-- Creer-Merge: supportCost -->>
                default: 0,
                // <<-- /Creer-Merge: supportCost -->>
            },
            upgradePrice: {
                description: "The cost to upgrade a Unit at each level.",
                // <<-- Creer-Merge: upgradePrice -->>
                default: [],
                // <<-- /Creer-Merge: upgradePrice -->>
            },
            victoryAmount: {
                description: "The amount of victory points required to win.",
                // <<-- Creer-Merge: victoryAmount -->>
                default: 10000,
                min: 10,
                // <<-- /Creer-Merge: victoryAmount -->>
            },
            // <<-- Creer-Merge: schema -->>

            // <<-- /Creer-Merge: schema -->>

            // Base settings
            playerStartingTime: {
                // <<-- Creer-Merge: player-starting-time -->>
                default: 18e10, // 3 min in ns
                // <<-- /Creer-Merge: player-starting-time -->>
                min: 0,
                description: "The starting time (in ns) for each player.",
            },

            // Turn based settings
            timeAddedPerTurn: {
                // <<-- Creer-Merge: time-added-per-turn -->>
                default: 6e10, // 1 min in ns,
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
                default: 60,
                // <<-- /Creer-Merge: map-width -->>
                min: 2,
                description: "The width (in Tiles) for the game map to be initialized to.",
            },
            mapHeight: {
                // <<-- Creer-Merge: map-height -->>
                default: 40,
                // <<-- /Creer-Merge: map-height -->>
                min: 2,
                description: "The height (in Tiles) for the game map to be initialized to.",
            },

        });
    }

    /**
     * The current values for the game's settings
     */
    public values!: SettingsFromSchema<CoreminerGameSettingsManager["schema"]>;

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

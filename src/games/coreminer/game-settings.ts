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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public get schema() {
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            ...(super.schema || (this as any).schema),

            // Coreminer game specific settings
            bombPrice: {
                description:
                    "The monetary price of a bomb when bought or sold.",
                // <<-- Creer-Merge: bombPrice -->>
                default: 25,
                // <<-- /Creer-Merge: bombPrice -->>
            },

            bombSize: {
                description: "The amount of cargo space taken up by a Bomb.",
                // <<-- Creer-Merge: bombSize -->>
                default: 10,
                min: 1,
                // <<-- /Creer-Merge: bombSize -->>
            },

            buildingMaterialPrice: {
                description:
                    "The monetary price of building materials when bought.",
                // <<-- Creer-Merge: buildingMaterialPrice -->>
                default: 2,
                // <<-- /Creer-Merge: buildingMaterialPrice -->>
            },

            dirtPrice: {
                description: "The monetary price of dirt when bought or sold.",
                // <<-- Creer-Merge: dirtPrice -->>
                default: 1,
                // <<-- /Creer-Merge: dirtPrice -->>
            },

            fallDamage: {
                description: "The amount of damage taken per Tile fallen.",
                // <<-- Creer-Merge: fallDamage -->>
                default: 5,
                // <<-- /Creer-Merge: fallDamage -->>
            },

            fallWeightDamage: {
                description:
                    "The amount of extra damage taken for falling while " +
                    "carrying a large amount of cargo.",
                // <<-- Creer-Merge: fallWeightDamage -->>
                default: 5,
                // <<-- /Creer-Merge: fallWeightDamage -->>
            },

            ladderCost: {
                description:
                    "The amount of building material required to build a " +
                    "ladder.",
                // <<-- Creer-Merge: ladderCost -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: ladderCost -->>
            },

            ladderHealth: {
                description:
                    "The amount of mining power needed to remove a ladder " +
                    "from a Tile.",
                // <<-- Creer-Merge: ladderHealth -->>
                default: 10,
                min: 1,
                // <<-- /Creer-Merge: ladderHealth -->>
            },

            largeCargoSize: {
                description: "The amount deemed as a large amount of cargo.",
                // <<-- Creer-Merge: largeCargoSize -->>
                default: 100,
                // <<-- /Creer-Merge: largeCargoSize -->>
            },

            largeMaterialSize: {
                description:
                    "The amount deemed as a large amount of material.",
                // <<-- Creer-Merge: largeMaterialSize -->>
                default: 100,
                // <<-- /Creer-Merge: largeMaterialSize -->>
            },

            maxShielding: {
                description:
                    "The maximum amount of shielding possible on a Tile.",
                // <<-- Creer-Merge: maxShielding -->>
                default: 2,
                // <<-- /Creer-Merge: maxShielding -->>
            },

            maxUpgradeLevel: {
                description: "The highest upgrade level allowed on a Miner.",
                // <<-- Creer-Merge: maxUpgradeLevel -->>
                default: 3,
                // <<-- /Creer-Merge: maxUpgradeLevel -->>
            },

            orePrice: {
                description:
                    "The amount of money awarded when ore is dumped in the " +
                    "base and sold.",
                // <<-- Creer-Merge: orePrice -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: orePrice -->>
            },

            oreValue: {
                description:
                    "The amount of value awarded when ore is dumped in the " +
                    "base and sold.",
                // <<-- Creer-Merge: oreValue -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: oreValue -->>
            },

            shieldCost: {
                description:
                    "The amount of building material required to shield a " +
                    "Tile.",
                // <<-- Creer-Merge: shieldCost -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: shieldCost -->>
            },

            shieldHealth: {
                description:
                    "The amount of mining power needed to remove one unit " +
                    "of shielding off a Tile.",
                // <<-- Creer-Merge: shieldHealth -->>
                default: 10,
                min: 1,
                // <<-- /Creer-Merge: shieldHealth -->>
            },

            spawnPrice: {
                description: "The monetary price of spawning a Miner.",
                // <<-- Creer-Merge: spawnPrice -->>
                default: 200,
                // <<-- /Creer-Merge: spawnPrice -->>
            },

            suffocationDamage: {
                description:
                    "The amount of damage taken when suffocating inside a " +
                    "filled Tile.",
                // <<-- Creer-Merge: suffocationDamage -->>
                default: 5,
                // <<-- /Creer-Merge: suffocationDamage -->>
            },

            suffocationWeightDamage: {
                description:
                    "The amount of extra damage taken for suffocating under" +
                    " a large amount of material.",
                // <<-- Creer-Merge: suffocationWeightDamage -->>
                default: 5,
                // <<-- /Creer-Merge: suffocationWeightDamage -->>
            },

            supportCost: {
                description:
                    "The amount of building material required to build a " +
                    "support.",
                // <<-- Creer-Merge: supportCost -->>
                default: 5,
                min: 1,
                // <<-- /Creer-Merge: supportCost -->>
            },

            supportHealth: {
                description:
                    "The amount of mining power needed to remove a support " +
                    "from a Tile.",
                // <<-- Creer-Merge: supportHealth -->>
                default: 10,
                // <<-- /Creer-Merge: supportHealth -->>
            },

            upgradePrice: {
                description: "The cost to upgrade a Miner.",
                // <<-- Creer-Merge: upgradePrice -->>
                default: 350,
                // <<-- /Creer-Merge: upgradePrice -->>
            },

            victoryAmount: {
                description:
                    "The amount of victory points (value) required to win.",
                // <<-- Creer-Merge: victoryAmount -->>
                default: 10000,
                min: 10,
                // <<-- /Creer-Merge: victoryAmount -->>
            },

            // <<-- Creer-Merge: schema -->>

            // you can add more settings here, e.g.:
            /*
            someVariableLikeUnitHealth: {
                description: "Describe what this does for the players.",
                default: 1337,
                min: 1,
            },
            */
            bombExplosionDamage: {
                description:
                    "The damage done to miners on tiles adjacent to an exploding bomb",
                default: 25,
                min: 1,
            },
            bombShockwaveDamage: {
                description: "The damage done to tiles in a bomb's shockwave.",
                default: 20,
                min: 1,
            },

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
                description:
                    "The amount of time (in nano-seconds) to add after " +
                    "each player performs a turn.",
            },
            maxTurns: {
                // <<-- Creer-Merge: max-turns -->>
                default: 500,
                // <<-- /Creer-Merge: max-turns -->>
                min: 1,
                description:
                    "The maximum number of turns before the game " +
                    "is force ended and a winner is determined.",
            },

            // Tiled settings
            mapWidth: {
                // <<-- Creer-Merge: map-width -->>
                default: 60,
                // <<-- /Creer-Merge: map-width -->>
                min: 2,
                description:
                    "The width (in Tiles) for the game map to be " +
                    "initialized to.",
            },
            mapHeight: {
                // <<-- Creer-Merge: map-height -->>
                default: 40,
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
    public values!: SettingsFromSchema<CoreminerGameSettingsManager["schema"]>;

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

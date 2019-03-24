import { SettingsFromSchema } from "~/core/game/base/base-game-settings";
import { UnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Catastrophe game.
 */
export class CatastropheGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public get schema() { // tslint:disable-line:typedef
        return this.makeSchema({
            // HACK: `super` should work. but schema is undefined on it at run time.
            // tslint:disable-next-line:no-any
            ...(super.schema || (this as any).schema),

            // Catastrophe game specific settings
            catEnergyMult: {
                description: "The multiplier for the amount of energy "
                           + "regenerated when resting in a shelter with the "
                           + "cat overlord.",
                // <<-- Creer-Merge: catEnergyMult -->>
                default: 2,
                // <<-- /Creer-Merge: catEnergyMult -->>
            },
            harvestCooldown: {
                description: "The amount of turns it takes for a Tile that was "
                           + "just harvested to grow food again.",
                // <<-- Creer-Merge: harvestCooldown -->>
                default: 10,
                // <<-- /Creer-Merge: harvestCooldown -->>
            },
            lowerHarvestAmount: {
                description: "The amount that the harvest rate is lowered each "
                           + "season.",
                // <<-- Creer-Merge: lowerHarvestAmount -->>
                default: 10,
                // <<-- /Creer-Merge: lowerHarvestAmount -->>
            },
            monumentCostMult: {
                description: "The multiplier for the cost of actions when "
                           + "performing them in range of a monument. Does not "
                           + "effect pickup cost.",
                // <<-- Creer-Merge: monumentCostMult -->>
                default: 0.5,
                // <<-- /Creer-Merge: monumentCostMult -->>
            },
            monumentMaterials: {
                description: "The number of materials in a monument.",
                // <<-- Creer-Merge: monumentMaterials -->>
                default: 100,
                // <<-- /Creer-Merge: monumentMaterials -->>
            },
            neutralMaterials: {
                description: "The number of materials in a neutral Structure.",
                // <<-- Creer-Merge: neutralMaterials -->>
                default: 200,
                // <<-- /Creer-Merge: neutralMaterials -->>
            },
            shelterMaterials: {
                description: "The number of materials in a shelter.",
                // <<-- Creer-Merge: shelterMaterials -->>
                default: 50,
                // <<-- /Creer-Merge: shelterMaterials -->>
            },
            startingFood: {
                description: "The amount of food Players start with.",
                // <<-- Creer-Merge: startingFood -->>
                default: 0,
                // <<-- /Creer-Merge: startingFood -->>
            },
            starvingEnergyMult: {
                description: "The multiplier for the amount of energy "
                           + "regenerated when resting while starving.",
                // <<-- Creer-Merge: starvingEnergyMult -->>
                default: 0.25,
                // <<-- /Creer-Merge: starvingEnergyMult -->>
            },
            turnsBetweenHarvests: {
                description: "After a food tile is harvested, the number of "
                           + "turns before it can be harvested again.",
                // <<-- Creer-Merge: turnsBetweenHarvests -->>
                default: 10,
                // <<-- /Creer-Merge: turnsBetweenHarvests -->>
            },
            turnsToCreateHuman: {
                description: "The number of turns between fresh humans being "
                           + "spawned on the road.",
                // <<-- Creer-Merge: turnsToCreateHuman -->>
                default: 30,
                // <<-- /Creer-Merge: turnsToCreateHuman -->>
            },
            turnsToLowerHarvest: {
                description: "The number of turns before the harvest rate is "
                           + "lowered (length of each season basically).",
                // <<-- Creer-Merge: turnsToLowerHarvest -->>
                default: 60,
                // <<-- /Creer-Merge: turnsToLowerHarvest -->>
            },
            wallMaterials: {
                description: "The number of materials in a wall.",
                // <<-- Creer-Merge: wallMaterials -->>
                default: 75,
                // <<-- /Creer-Merge: wallMaterials -->>
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
                default: 720,
                // <<-- /Creer-Merge: max-turns -->>
                min: 1,
                description: "The maximum number of turns before the game is force ended and a winner is determined.",
            },

            // Tiled settings
            mapWidth: {
                // <<-- Creer-Merge: map-width -->>
                default: 26,
                // <<-- /Creer-Merge: map-width -->>
                min: 2,
                description: "The width (in Tiles) for the game map to be initialized to.",
            },
            mapHeight: {
                // <<-- Creer-Merge: map-height -->>
                default: 18,
                // <<-- /Creer-Merge: map-height -->>
                min: 2,
                description: "The height (in Tiles) for the game map to be initialized to.",
            },

        });
    }

    /**
     * The current values for the game's settings
     */
    public values!: SettingsFromSchema<CatastropheGameSettingsManager["schema"]>;

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

import { UnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Stardash game.
 */
export class StardashGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public schema = this.makeSchema({
// HACK: `super` should work. but schema is undefined on it at run time.
        // tslint:disable-next-line:no-any
        ...(super.schema || (this as any).schema),

        // Stardash game specific settings
        dashBlock: {
            description: "Radius of the no dash zone around the sun.",
            // <<-- Creer-Merge: dashBlock -->>
            default: 0,
            // <<-- /Creer-Merge: dashBlock -->>
        },
        dashDistance: {
            description: "The distance traveled each turn by dashing.",
            // <<-- Creer-Merge: dashDistance -->>
            default: 1000,
            // <<-- /Creer-Merge: dashDistance -->>
        },
        maxAsteroid: {
            description: "The highest amount of material, barring rarity, that "
                       + "can be in a asteroid.",
            // <<-- Creer-Merge: maxAsteroid -->>
            default: 1000,
            // <<-- /Creer-Merge: maxAsteroid -->>
        },
        minAsteroid: {
            description: "The smallest amount of material, barring rarity, "
                       + "that can be in a asteroid.",
            // <<-- Creer-Merge: minAsteroid -->>
            default: 250,
            // <<-- /Creer-Merge: minAsteroid -->>
        },
        miningSpeed: {
            description: "The rate at which miners grab minerals from "
                       + "asteroids.",
            // <<-- Creer-Merge: miningSpeed -->>
            default: 5,
            // <<-- /Creer-Merge: miningSpeed -->>
        },
        oreRarity1: {
            description: "The rarity modifier of the most common ore. This "
                       + "controls how much spawns.",
            // <<-- Creer-Merge: oreRarity1 -->>
            default: 1,
            // <<-- /Creer-Merge: oreRarity1 -->>
        },
        oreRarity2: {
            description: "The rarity modifier of the second rarest ore. This "
                       + "controls how much spawns.",
            // <<-- Creer-Merge: oreRarity2 -->>
            default: 0.7,
            // <<-- /Creer-Merge: oreRarity2 -->>
        },
        oreRarity3: {
            description: "The rarity modifier of the rarest ore. This controls "
                       + "how much spawns.",
            // <<-- Creer-Merge: oreRarity3 -->>
            default: 0.4,
            // <<-- /Creer-Merge: oreRarity3 -->>
        },
        planetRechargeRate: {
            description: "The amount of energy the planets restore each round.",
            // <<-- Creer-Merge: planetRechargeRate -->>
            default: 50,
            // <<-- /Creer-Merge: planetRechargeRate -->>
        },
        projectileSpeed: {
            description: "The amount of distance missiles travel through "
                       + "space.",
            // <<-- Creer-Merge: projectileSpeed -->>
            default: 9,
            // <<-- /Creer-Merge: projectileSpeed -->>
        },
        regenerateRate: {
            description: "The regeneration rate of asteroids.",
            // <<-- Creer-Merge: regenerateRate -->>
            default: 0,
            // <<-- /Creer-Merge: regenerateRate -->>
        },
        shipRadius: {
            description: "The standard size of ships.",
            // <<-- Creer-Merge: shipRadius -->>
            default: 0,
            // <<-- /Creer-Merge: shipRadius -->>
        },
        sizeX: {
            description: "The size of the map in the X direction.",
            // <<-- Creer-Merge: sizeX -->>
            default: 3200,
            // <<-- /Creer-Merge: sizeX -->>
        },
        sizeY: {
            description: "The size of the map in the Y direction.",
            // <<-- Creer-Merge: sizeY -->>
            default: 1800,
            // <<-- /Creer-Merge: sizeY -->>
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

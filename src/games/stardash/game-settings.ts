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
        dashCost: {
            description: "The cost of dashing.",
            // <<-- Creer-Merge: dashCost -->>
            default: 1,
            // <<-- /Creer-Merge: dashCost -->>
        },
        dashDistance: {
            description: "The distance traveled each turn by dashing.",
            // <<-- Creer-Merge: dashDistance -->>
            default: 50,
            // <<-- /Creer-Merge: dashDistance -->>
        },
        genariumValue: {
            description: "The value of every unit of genarium.",
            // <<-- Creer-Merge: genariumValue -->>
            default: 1,
            // <<-- /Creer-Merge: genariumValue -->>
        },
        legendariumValue: {
            description: "The value of every unit of legendarium.",
            // <<-- Creer-Merge: legendariumValue -->>
            default: 5,
            // <<-- /Creer-Merge: legendariumValue -->>
        },
        maxAsteroid: {
            description: "The highest amount of material, that can be in a "
                       + "asteroid.",
            // <<-- Creer-Merge: maxAsteroid -->>
            default: 1000,
            // <<-- /Creer-Merge: maxAsteroid -->>
        },
        minAsteroid: {
            description: "The smallest amount of material, that can be in a "
                       + "asteroid.",
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
        mythiciteAmount: {
            description: "The amount of mythicite that spawns at the start of "
                       + "the game.",
            // <<-- Creer-Merge: mythiciteAmount -->>
            default: 1000,
            // <<-- /Creer-Merge: mythiciteAmount -->>
        },
        orbitsProtected: {
            description: "The number of orbit updates you cannot mine the "
                       + "mithicite asteroid.",
            // <<-- Creer-Merge: orbitsProtected -->>
            default: 12,
            // <<-- /Creer-Merge: orbitsProtected -->>
        },
        oreRarityGenarium: {
            description: "The rarity modifier of the most common ore. This "
                       + "controls how much spawns.",
            // <<-- Creer-Merge: oreRarityGenarium -->>
            default: 5,
            // <<-- /Creer-Merge: oreRarityGenarium -->>
        },
        oreRarityLegendarium: {
            description: "The rarity modifier of the rarest ore. This controls "
                       + "how much spawns.",
            // <<-- Creer-Merge: oreRarityLegendarium -->>
            default: 1,
            // <<-- /Creer-Merge: oreRarityLegendarium -->>
        },
        oreRarityRarium: {
            description: "The rarity modifier of the second rarest ore. This "
                       + "controls how much spawns.",
            // <<-- Creer-Merge: oreRarityRarium -->>
            default: 2,
            // <<-- /Creer-Merge: oreRarityRarium -->>
        },
        planetEnergyCap: {
            description: "The amount of energy a planet can hold at once.",
            // <<-- Creer-Merge: planetEnergyCap -->>
            default: 20000,
            // <<-- /Creer-Merge: planetEnergyCap -->>
        },
        planetRechargeRate: {
            description: "The amount of energy the planets restore each round.",
            // <<-- Creer-Merge: planetRechargeRate -->>
            default: 50,
            // <<-- /Creer-Merge: planetRechargeRate -->>
        },
        projectileRadius: {
            description: "The standard size of ships.",
            // <<-- Creer-Merge: projectileRadius -->>
            default: 5,
            // <<-- /Creer-Merge: projectileRadius -->>
        },
        projectileSpeed: {
            description: "The amount of distance missiles travel through "
                       + "space.",
            // <<-- Creer-Merge: projectileSpeed -->>
            default: 100,
            // <<-- /Creer-Merge: projectileSpeed -->>
        },
        rariumValue: {
            description: "The value of every unit of rarium.",
            // <<-- Creer-Merge: rariumValue -->>
            default: 2,
            // <<-- /Creer-Merge: rariumValue -->>
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
            default: 20,
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
        turnsToOrbit: {
            description: "The number of turns it takes for a asteroid to orbit "
                       + "the sun. (Asteroids move after each players turn).",
            // <<-- Creer-Merge: turnsToOrbit -->>
            default: 24,
            // <<-- /Creer-Merge: turnsToOrbit -->>
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
            default: 204,
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

import { IUnknownObject } from "~/utils";
import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The settings manager for the Spiders game.
 */
export class SpidersGameSettingsManager extends BaseClasses.GameSettings {
    /**
     * This describes the structure of the game settings, and is used to
     * generate the values, as well as basic type and range checking.
     */
    public schema = this.makeSchema({
        ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it

        // Spiders game specific settings
        cutSpeed: {
            description: "The speed at which Cutters work to do cut Webs.",
            // <<-- Creer-Merge: cutSpeed -->>
            default: 2,
            // <<-- /Creer-Merge: cutSpeed -->>
        },
        eggsScalar: {
            description: "Constant used to calculate how many eggs BroodMothers get on their owner's turns.",
            // <<-- Creer-Merge: eggsScalar -->>
            default: 0.10,
            // <<-- /Creer-Merge: eggsScalar -->>
        },
        initialWebStrength: {
            description: "The starting strength for Webs.",
            // <<-- Creer-Merge: initialWebStrength -->>
            default: 5,
            // <<-- /Creer-Merge: initialWebStrength -->>
        },
        maxWebStrength: {
            description: "The maximum strength a web can be strengthened to.",
            // <<-- Creer-Merge: maxWebStrength -->>
            default: 15,
            // <<-- /Creer-Merge: maxWebStrength -->>
        },
        movementSpeed: {
            description: "The speed at which Spiderlings move on Webs.",
            // <<-- Creer-Merge: movementSpeed -->>
            default: 10,
            // <<-- /Creer-Merge: movementSpeed -->>
        },
        spitSpeed: {
            description: "The speed at which Spitters work to spit new Webs.",
            // <<-- Creer-Merge: spitSpeed -->>
            default: 24,
            // <<-- /Creer-Merge: spitSpeed -->>
        },
        weavePower: {
            description: "How much web strength is added or removed from Webs when they are weaved.",
            // <<-- Creer-Merge: weavePower -->>
            default: 1,
            // <<-- /Creer-Merge: weavePower -->>
        },
        weaveSpeed: {
            description: "The speed at which Weavers work to do strengthens and weakens on Webs.",
            // <<-- Creer-Merge: weaveSpeed -->>
            default: 16,
            // <<-- /Creer-Merge: weaveSpeed -->>
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
            default: 300,
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
    protected invalidate(someSettings: IUnknownObject): IUnknownObject | Error {
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

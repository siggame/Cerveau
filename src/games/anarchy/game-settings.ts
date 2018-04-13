import { IAnyObject } from "~/utils";
import { BaseClasses } from "./";

export class AnarchyGameSettingsManager extends BaseClasses.GameSettings {
    public schema = this.makeSchema({
        ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it

        // creer-merge
        mapWidth: {
            default: 40,
            min: 2,
            description: "The width (in Buildings) for the game map to be initialized to.",
        },
        mapHeight: {
            default: 20,
            min: 2,
            description: "The height (in Buildings) for the game map to be initialized to.",
        },
        maxFire: {
            default: 20,
            min: 1,
            description: "The maximum amount of fire value for any Building.",
        },
        baseBribesPerTurn: {
            default: 10,
            min: 1,
            description: "How many bribes players get at the beginning of "
            + "their turn, not counting their burned down Buildings.",
        },
        headquartersHealthScalar: {
            default: 3,
            min: 1,
            description: "How much health to scale (multiply a Headquarters health by",
        },
        maxForecastIntensity: {
            default: 10,
            min: 1,
            description: "The maximum intensity to allow Forecasts to have.",
        },
        firePerTurnReduction: {
            default: 1,
            min: 0,
            description: "How much fire to remove per turn.",
        },
        exposurePerTurnReduction: {
            default: 10,
            min: 0,
            description: "How much exposure to remove per turn.",
        },
        // /creer-merge
    });

    public values = this.initialValues(this.schema);

    protected invalidate(someSettings: IAnyObject): IAnyObject | Error {
        const invalidated = super.invalidate(someSettings);
        if (invalidated instanceof Error) {
            return invalidated;
        }

        const settings = { ...this.values, ...someSettings, ...invalidated };

        // creer merge
        // /creer merge

        return settings;
    }
}

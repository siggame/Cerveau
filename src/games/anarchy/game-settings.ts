import { IGameSettingsDescriptions } from "src/core/game";
import { BaseClasses, IBaseAnarchyGameSettings } from "./";

export interface IAnarchyGameSettings extends IBaseAnarchyGameSettings {
    // creer merge
    mapWidth: number;
    mapHeight: number;
    maxFire: number;
    baseBribesPerTurn: number;
    headquartersHealthScalar: number;
    maxForecastIntensity: number;
    firePerTurnReduction: number;
    exposurePerTurnReduction: number;
    // /creer merge
}

export class AnarchyGameSettings extends BaseClasses.GameSettings {
    public get defaults(): IAnarchyGameSettings {
        return {
            ...super.defaults,
            // creer merge
            // TurnBased Game
            maxTurns: 500,

            mapWidth: 40,
            mapHeight: 20,
            maxFire: 20,
            baseBribesPerTurn: 10,

            // not exposed to clients
            headquartersHealthScalar: 3,
            maxForecastIntensity: 10,
            firePerTurnReduction: 1,
            exposurePerTurnReduction: 10,
            // /creer merge
        };
    }

    public get descriptions(): IGameSettingsDescriptions<IAnarchyGameSettings> {
        return {
            ...super.descriptions,
            mapWidth: "The width (in Buildings) for the game map to be initialized to.",
            mapHeight: "The height (in Buildings) for the game map to be initialized to.",
            maxFire: "The maximum amount of fire value for any Building.",
            baseBribesPerTurn: "How many bribes players get at the beginning of their turn, "
                             + "not counting their burned down Buildings.",
            headquartersHealthScalar: "How much health to scale (multiply a Headquarters health by",
            maxForecastIntensity: "The maximum intensity to allow Forecasts to have.",
            firePerTurnReduction: "How much fire to remove per turn.",
            exposurePerTurnReduction: "How much exposure to remove per turn.",
        };
    }

    public invalidate(settings: IAnarchyGameSettings): string | undefined {
        const invalid = super.invalidate(settings);
        if (invalid) {
            return invalid;
        }

        // creer merge
        // /creer merge
    }
}

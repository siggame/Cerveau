// Forecast: The weather effect that will be applied at the end of a turn, which causes fires to spread.
import { IBaseGameObjectRequiredData } from "~/core/game";
import { GameObject, IForecastProperties, IGameObjectConstructorArgs, Player } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be required here safely between cree runs
// <<-- /Creer-Merge: imports -->>

export interface IForecastConstructorArgs extends IForecastProperties, IGameObjectConstructorArgs {
    // <<-- Creer-Merge: constructor-args -->>

    // You can add more constructor args in here!
    direction: string;
    intensity: number;

    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * The weather effect that will be applied at the end of a turn, which causes fires to spread.
 */
export class Forecast extends GameObject {
    /**
     * The Player that can use WeatherStations to control this Forecast when its
     * the nextForecast.
     */
    public controllingPlayer?: Player;

    /**
     * The direction the wind will blow fires in. Can be 'north', 'east',
     * 'south', or 'west'.
     */
    public direction!: string;

    /**
     * How much of a Building's fire that can be blown in the direction of this
     * Forecast. Fire is duplicated (copied), not moved (transferred).
     */
    public intensity!: number;

    /**
     * Initializes Forecasts.
     *
     * @param data the initial Forecast properties (already hooked up)
     * @param required - data required for this game object to be initialized correctly
     */
    constructor(data: IForecastConstructorArgs, required: IBaseGameObjectRequiredData) {
        super(data, required);

        // <<-- Creer-Merge: init -->>

        // put any initialization logic here. the base variables should be set from 'data' above

        // <<-- /Creer-Merge: init -->>
    }

    // <<-- Creer-Merge: added-functions -->>

    // You can add additional functions here. These functions will not be directly callable by client AIs

    // <<-- /Creer-Merge: added-functions -->>

}

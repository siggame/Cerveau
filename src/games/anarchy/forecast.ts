import { IBaseGameObjectRequiredData } from "~/core/game";
import { IForecastProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface IForecastConstructorArgs
extends IGameObjectConstructorArgs, IForecastProperties {
    // <<-- Creer-Merge: constructor-args -->>
    direction: string;
    intensity: number;
    controllingPlayer: Player;
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * The weather effect that will be applied at the end of a turn, which causes
 * fires to spread.
 */
export class Forecast extends GameObject {
    /**
     * The Player that can use WeatherStations to control this Forecast when its
     * the nextForecast.
     */
    public readonly controllingPlayer: Player;

    /**
     * The direction the wind will blow fires in. Can be 'north', 'east',
     * 'south', or 'west'.
     */
    public direction!: string;

    /**
     * How much of a Building's fire that can be blown in the direction of this
     * Forecast. Fire is duplicated (copied), not moved (transfered).
     */
    public intensity!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Forecast is created.
     *
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: IForecastConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>

        this.controllingPlayer = data.controllingPlayer;

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: functions -->>
}

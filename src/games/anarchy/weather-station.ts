import { IBaseGameObjectRequiredData } from "~/core/game";
import { IWeatherStationProperties } from "./";
import { Building, IBuildingConstructorArgs } from "./building";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
import { nextWrapAround, previousWrapAround } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.WeatherStation have different args.
 */
export interface IWeatherStationConstructorArgs
extends IBuildingConstructorArgs, IWeatherStationProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * Can be bribed to change the next Forecast in some way.
 */
export class WeatherStation extends Building {
    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a WeatherStation is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IWeatherStationConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for intensify. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param negative - By default the intensity will be increased by 1,
     * setting this to true decreases the intensity by 1.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateIntensify(
        player: Player,
        negative: boolean = false,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-intensify -->>

        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!this.game.nextForecast) {
            return `${this} cannot intensify the next Forecast as it is the last turn and there is no next Forecast.`;
        }

        // checks if the intensity is at maximum and trying to increase
        if (!negative && this.game.nextForecast.intensity >= this.game.maxForecastIntensity) {
            return `${this} cannot intensify the next Forecast `
                + `${this.game.nextForecast} above ${this.game.maxForecastIntensity}.`;
        }

        // checks if the intensity is at minimum and trying to decrease
        if (negative && this.game.nextForecast.intensity <= 0) {
            return `${this} cannot intensify the next Forecast${this.game.nextForecast} below 0.`;
        }

        // <<-- /Creer-Merge: invalidate-intensify -->>
        return arguments;
    }

    /**
     * Bribe the weathermen to intensity the next Forecast by 1 or -1
     *
     * @param player - The player that called this.
     * @param negative - By default the intensity will be increased by 1,
     * setting this to true decreases the intensity by 1.
     * @returns True if the intensity was changed, false otherwise.
     */
    protected async intensify(
        player: Player,
        negative: boolean = false,
    ): Promise<boolean> {
        // <<-- Creer-Merge: intensify -->>

        this.game.nextForecast!.intensity += (negative ? -1 : 1);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: intensify -->>
    }

    /**
     * Invalidation function for rotate. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param counterclockwise - By default the direction will be rotated
     * clockwise. If you set this to true we will rotate the forecast
     * counterclockwise instead.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateRotate(
        player: Player,
        counterclockwise: boolean = false,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-rotate -->>

        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!this.game.nextForecast) {
            return `${this} cannot rotate the next Forecast as it is the last turn and there is no next Forecast.`;
        }

        // <<-- /Creer-Merge: invalidate-rotate -->>
        return arguments;
    }

    /**
     * Bribe the weathermen to change the direction of the next Forecast by
     * rotating it clockwise or counterclockwise.
     *
     * @param player - The player that called this.
     * @param counterclockwise - By default the direction will be rotated
     * clockwise. If you set this to true we will rotate the forecast
     * counterclockwise instead.
     * @returns True if the rotation worked, false otherwise.
     */
    protected async rotate(
        player: Player,
        counterclockwise: boolean = false,
    ): Promise<boolean> {
        // <<-- Creer-Merge: rotate -->>

        const wrapAround = counterclockwise
            ? previousWrapAround
            : nextWrapAround;

        this.game.nextForecast!.direction = wrapAround(this.game.directions, this.game.nextForecast!.direction)!;

        this.bribed = true;
        this.owner.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: rotate -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

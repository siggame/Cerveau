import { IBaseGameObjectRequiredData } from "src/core/game";
import { Building, Player } from "./";
import { IWeatherStationProperties } from "./game-interfaces";

// <<-- Creer-Merge: requires -->>
import { nextWrapAround, previousWrapAround } from "src/utils";
// <<-- /Creer-Merge: requires -->>

// @class WeatherStation: Can be bribed to change the next Forecast in some way.
export class WeatherStation extends Building {
    /**
     * Initializes WeatherStations.
     *
     * @param {Object} data - a thing
     * @param required ot
     */
    constructor(data: IWeatherStationProperties, required: IBaseGameObjectRequiredData) {
        super(data, required);

        // <<-- Creer-Merge: init -->>
        // put any initialization logic here. the base variables should be set from 'data' above
        // <<-- /Creer-Merge: init -->>
    }

    /**
     * Invalidation function for intensify
     * Try to find a reason why the passed in parameters are invalid, and return
     * a human readable string telling them why it is invalid
     * @param {Player} player - the player that called this.
     * @param {boolean} negative - By default the intensity will be increased by
     * 1, setting this to true decreases the intensity by 1.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateIntensify(player: Player, negative: boolean = true): string | IArguments {
        // <<-- Creer-Merge: invalidateIntensify -->>
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

        // <<-- /Creer-Merge: invalidateIntensify -->>
        return arguments;
    }

    /**
     * Bribe the weathermen to intensity the next Forecast by 1 or -1
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} negative - By default the intensity will be increased by
     * 1, setting this to true decreases the intensity by 1.
     * @returns {boolean} True if the intensity was changed, false otherwise.
     */
    protected intensify(player: Player, negative: boolean = true): boolean {
        // <<-- Creer-Merge: intensify -->>

        this.game.nextForecast!.intensity += (negative ? -1 : 1);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: intensify -->>
    }

    /**
     * Invalidation function for rotate
     * Try to find a reason why the passed in parameters are invalid, and return
     * a human readable string telling them why it is invalid
     * @param {Player} player - the player that called this.
     * @param {boolean} counterclockwise - By default the direction will be
     * rotated clockwise. If you set this to true we will rotate the forecast counterclockwise instead.
     * @returns {string|undefined} a string that is the invalid reason, if the
     * arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateRotate(player: Player, counterclockwise: boolean = false): string | IArguments {
        // <<-- Creer-Merge: invalidateRotate -->>
        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!this.game.nextForecast) {
            return `${this} cannot rotate the next Forecast as it is the last turn and there is no next Forecast.`;
        }

        // <<-- /Creer-Merge: invalidateRotate -->>
        return arguments;
    }

    /**
     * Bribe the weathermen to change the direction of the next Forecast by
     * rotating it clockwise or counterclockwise.
     * @param {Player} player - the player that called this.
     * @param {boolean} counterclockwise - By default the direction will be
     * rotated clockwise. If you set this to true we will rotate the forecast counterclockwise instead.
     * @returns {boolean} True if the rotation worked, false otherwise.
     */
    protected rotate(player: Player, counterclockwise: boolean = false): boolean {
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

    // <<-- Creer-Merge: added-functions -->>
    // You can add additional functions here. These functions will not be directly callable by client AIs
    // <<-- /Creer-Merge: added-functions -->>
}

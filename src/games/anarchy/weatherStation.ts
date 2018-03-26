// WeatherStation: Can be bribed to change the next Forecast in some way.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class WeatherStation: Can be bribed to change the next Forecast in some way.
let WeatherStation = Class(Building, {
    /**
     * Initializes WeatherStations.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        Building.init.apply(this, arguments);


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "WeatherStation",


    /**
     * Invalidation function for intensify
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} negative - By default the intensity will be increased by 1, setting this to true decreases the intensity by 1.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateIntensify: function(player, negative, args) {
        // <<-- Creer-Merge: invalidateIntensify -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!this.game.nextForecast) {
            return `${this} cannot intensify the next Forecast as it is the last turn and there is no next Forecast.`;
        }

        // checks if the intensity is at maximum and trying to increase
        if(!negative && this.game.nextForecast.intensity >= this.game.maxForecastIntensity) {
            return `${this} cannot intensify the next Forecast ${this.game.nextForecast} above ${this.game.maxForecastIntensity}.`;
        }

        // checks if the intensity is at minimum and trying to decrease
        if(negative && this.game.nextForecast.intensity <= 0) {
            return `${this} cannot intensify the next Forecast${this.game.nextForecast} below 0.`;
        }

        return this._invalidateBribe(player);

        // <<-- /Creer-Merge: invalidateIntensify -->>
    },

    /**
     * Bribe the weathermen to intensity the next Forecast by 1 or -1
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} negative - By default the intensity will be increased by 1, setting this to true decreases the intensity by 1.
     * @returns {boolean} True if the intensity was changed, false otherwise.
     */
    intensify: function(player, negative) {
        // <<-- Creer-Merge: intensify -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.game.nextForecast.intensity += (negative ? -1 : 1);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: intensify -->>
    },


    /**
     * Invalidation function for rotate
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} counterclockwise - By default the direction will be rotated clockwise. If you set this to true we will rotate the forecast counterclockwise instead.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateRotate: function(player, counterclockwise, args) {
        // <<-- Creer-Merge: invalidateRotate -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!this.game.nextForecast) {
            return `${this} cannot rotate the next Forecast as it is the last turn and there is no next Forecast.`;
        }

        return this._invalidateBribe(player);

        // <<-- /Creer-Merge: invalidateRotate -->>
    },

    /**
     * Bribe the weathermen to change the direction of the next Forecast by rotating it clockwise or counterclockwise.
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} counterclockwise - By default the direction will be rotated clockwise. If you set this to true we will rotate the forecast counterclockwise instead.
     * @returns {boolean} True if the rotation worked, false otherwise.
     */
    rotate: function(player, counterclockwise) {
        // <<-- Creer-Merge: rotate -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.game.nextForecast.direction = this.game.directions[(counterclockwise ? "previous" : "next") + "WrapAround"](this.game.nextForecast.direction);

        this.bribed = true;
        this.owner.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: rotate -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = WeatherStation;

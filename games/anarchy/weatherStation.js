// WeatherStation: Can be bribed to change the next Forecast in some way.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class WeatherStation: Can be bribed to change the next Forecast in some way.
var WeatherStation = Class(Building, {
    /**
     * Initializes WeatherStations.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
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
     * Bribe the weathermen to intensity the next Forecast by 1 or -1
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} negative - By default the intensity will be increased by 1, setting this to true decreases the intensity by 1.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the intensity was changed, false otherwise.
     */
    intensify: function(player, negative, asyncReturn) {
        // <<-- Creer-Merge: intensify -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var logicError = this._checkIfBribeIsValid(player, false);
        if(logicError) {
            return logicError;
        }

        if(!this.game.nextForecast) {
            return this.game.logicError(false, "WeatherStation {{{0}}} cannot intensify the next Forecast as it is the last turn and there is not next Forecast.".format(
                this.id
            ));
        }

        // checks if the intensity is at maximum and trying to increase
        if(!negative && this.game.nextForecast.intensity >= this.game.maxForecastIntensity) {
            return this.game.logicError(false, "WeatherStation {{{0}}} cannot intensify the next Forecast {{{1}}} above {2}.".format(
                this.id,
                this.game.nextForecast.id,
                this.game.maxForecastIntensity
            ));
        }

        // checks if the intensity is at minimum and trying to decrease
        if(negative && this.game.nextForecast.intensity <= 0) {
            return this.game.logicError(false, "WeatherStation {{{0}}} cannot intensify the next Forecast {{{1}}} below 0.".format(
                this.id,
                this.game.nextForecast.id
            ));
        }

        this.game.nextForecast.intensity += (negative ? -1 : 1);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: intensify -->>
    },

    /**
     * Bribe the weathermen to change the direction of the next Forecast by rotating it clockwise or counterclockwise.
     *
     * @param {Player} player - the player that called this.
     * @param {boolean} counterclockwise - By default the direction will be rotated clockwise. If you set this to true we will rotate the forecast counterclockwise instead.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the rotation worked, false otherwise.
     */
    rotate: function(player, counterclockwise, asyncReturn) {
        // <<-- Creer-Merge: rotate -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var logicError = this._checkIfBribeIsValid(player, false);
        if(logicError) {
            return logicError;
        }

        if(!this.game.nextForecast) {
            return this.game.logicError(false, "WeatherStation {{{0}}} cannot rotate the next Forecast as it is the last turn and there is not next Forecast.".format(
                this.id
            ));
        }

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

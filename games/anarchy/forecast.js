// Forecast: The weather effect that will be applied at the end of a turn, which causes fires to spread.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Forecast: The weather effect that will be applied at the end of a turn, which causes fires to spread.
var Forecast = Class(GameObject, {
    /**
     * Initializes Forecasts.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The Player that can use WeatherStations to control this Forecast when its the nextForecast.
         *
         * @type {Player}
         */
        this.controllingPlayer = this.controllingPlayer || null;

        /**
         * The direction the wind will blow fires in. Can be 'north', 'east', 'south', or 'west'.
         *
         * @type {string}
         */
        this.direction = this.direction || "";

        /**
         * How much of a Building's fire that can be blown in the direction of this Forecast. Fire is duplicated (copied), not moved (transfered).
         *
         * @type {number}
         */
        this.intensity = this.intensity || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Forecast",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Forecast;

// Generated by Creer at 10:42PM on October 16, 2015 UTC, git hash: '98604e3773d1933864742cb78acbf6ea0b4ecd7b'

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var TurnBasedGame = require(__basedir + "/gameplay/shared/turnBasedGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Game: Two player grid based game where each player tries to burn down the other player's buildings. Let it burn!
var Game = Class(TurnBasedGame, {
    /**
     * Initializes Games.
     *
     * @param {Object} a simple mapping passsed in to the constructor with whatever you sent with it.
     */
    init: function(data) {
        TurnBasedGame.init.apply(this, arguments);

        /**
         * How many bribes players get at the beginning of their turn, not counting their burned down Buildings.
         *
         * @type {number}
         */
        this._addProperty("baseBribesPerTurn", serializer.defaultInteger(data.baseBribesPerTurn));

        /**
         * All the buildings in the game.
         *
         * @type {list.<Building>}
         */
        this._addProperty("buildings", serializer.defaultArray(data.buildings));

        /**
         * The current Forecast, which will be applied at the end of the turn.
         *
         * @type {Forecast}
         */
        this._addProperty("currentForecast", serializer.defaultGameObject(data.currentForecast));

        /**
         * All the forecasts in the game, indexed by turn number.
         *
         * @type {list.<Forecast>}
         */
        this._addProperty("forecasts", serializer.defaultArray(data.forecasts));

        /**
         * The width of the entire map along the vertical (y) axis.
         *
         * @type {number}
         */
        this._addProperty("mapHeight", serializer.defaultInteger(data.mapHeight));

        /**
         * The width of the entire map along the horizontal (x) axis.
         *
         * @type {number}
         */
        this._addProperty("mapWidth", serializer.defaultInteger(data.mapWidth));

        /**
         * The maximum amount of fire value for any Building.
         *
         * @type {number}
         */
        this._addProperty("maxFire", serializer.defaultInteger(data.maxFire));

        /**
         * The next Forecast, which will be applied at the end of your opponent's turn. This is also the Forecast WeatherStations can control this turn.
         *
         * @type {Forecast}
         */
        this._addProperty("nextForecast", serializer.defaultGameObject(data.nextForecast));


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    name: "Anarchy",
    numberOfPlayers: 2,
    maxInvalidsPerPlayer: 10,

    /**
     * This is called when the game begins, once players are connected and ready to play, and game objects have been initialized. Anything in init() may not have the appropriate game objects created yet..
     */
    begin: function() {
        TurnBasedGame.begin.apply(this, arguments);

        //<<-- Creer-Merge: begin -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // any logic after init can be put here
        //<<-- /Creer-Merge: begin -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

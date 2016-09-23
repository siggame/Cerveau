// Cowboy: A person on the map that can move around and interact within the saloon.

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Cowboy: A person on the map that can move around and interact within the saloon.
var Cowboy = Class(GameObject, {
    /**
     * Initializes Cowboys.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Cowboy",


    /**
     * Does their job's action on a Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want this Cowboy to act on.
     * @param {string} drunkDirection - The direction the bottle will cause drunk cowboys to be in, can be 'North', 'East', 'South', 'West'.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the act worked, false otherwise.
     */
    act: function(player, tile, drunkDirection, asyncReturn) {
        // <<-- Creer-Merge: act -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Cowboy's act function here
        return false;

        // <<-- /Creer-Merge: act -->>
    },

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want to move this Cowboy to.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the move worked, false otherwise.
     */
    move: function(player, tile, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Cowboy's move function here
        return false;

        // <<-- /Creer-Merge: move -->>
    },

    /**
     * Sits down and plays a piano.
     *
     * @param {Player} player - the player that called this.
     * @param {Furnishing} piano - The Furnishing that is a piano you want to play.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the play worked, false otherwise.
     */
    play: function(player, piano, asyncReturn) {
        // <<-- Creer-Merge: play -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Cowboy's play function here
        return false;

        // <<-- /Creer-Merge: play -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Cowboy;

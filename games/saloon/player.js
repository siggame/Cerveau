// Player: A player in this game. Every AI controls one player.

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Player: A player in this game. Every AI controls one player.
var Player = Class(GameObject, {
    /**
     * Initializes Players.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Player",


    /**
     * The Cowboy that was previously a 'Young Gun', and has now been promoted to a different job if successful, null otherwise.
     *
     * @param {Player} player - the player that called this.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     */
    returns: function(player, asyncReturn) {
        // <<-- Creer-Merge: returns -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Player's returns function here
        return undefined;

        // <<-- /Creer-Merge: returns -->>
    },

    /**
     * Sends in the Young Gun to the nearest Tile into the Saloon, and promotes them to a new job.
     *
     * @param {Player} player - the player that called this.
     * @param {string} job - The job you want the Young Gun being brought in to be called in to do, changing their job to it.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     */
    sendIn: function(player, job, asyncReturn) {
        // <<-- Creer-Merge: sendIn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Player's sendIn function here
        return undefined;

        // <<-- /Creer-Merge: sendIn -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Player;

// GameObject: An object in the game. The most basic class that all game classes should inherit from automatically.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const BaseGameObject = require(`${__basedir}/gameplay/shared/baseGameObject`);

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class GameObject: An object in the game. The most basic class that all game classes should inherit from automatically.
let GameObject = Class(BaseGameObject, {
    /**
     * Initializes GameObjects.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        BaseGameObject.init.apply(this, arguments);

        /**
         * String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
         *
         * @type {string}
         */
        this.gameObjectName = this.gameObjectName || "";

        /**
         * A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
         *
         * @type {string}
         */
        this.id = this.id || "";

        /**
         * Any strings logged will be stored here. Intended for debugging.
         *
         * @type {Array.<string>}
         */
        this.logs = this.logs || [];


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // put any initialization logic here. the base variables should be set from 'data' in Generated${obj_key}'s init function
        // NOTE: no players are connected at this point.
        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "GameObject",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // You can add additional functions here. These functions will not be directly callable by client AIs
    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = GameObject;

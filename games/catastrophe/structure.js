// Structure: A structure on a Tile.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Structure: A structure on a Tile.
let Structure = Class(GameObject, {
    /**
     * Initializes Structures.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * The range of this Structure's effect. For example, a radius of 1 means this Structure affects a 3x3 square centered on this Structure.
         *
         * @type {number}
         */
        this.effectRadius = this.effectRadius || 0;

        /**
         * The number of materials in this Structure.
         *
         * @type {number}
         */
        this.materials = this.materials || 0;

        /**
         * The owner of this Structure if any, otherwise null.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The Tile this structure is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;

        /**
         * The type of structure this is.
         *
         * @type {string}
         */
        this.type = this.type || "";


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Structure",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Structure;
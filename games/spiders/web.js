// Generated by Creer at 04:24PM on March 02, 2016 UTC, git hash: '0cc14891fb0c7c6bec65a23a8e2497e80f8827c1'

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Web: A connection (edge) to a Nest (node) in the game that Spiders can converge on (regardless of owner). Spiders can travel in either direction on Webs.
var Web = Class(GameObject, {
    /**
     * Initializes Webs.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * How long this Web is, i.e., the distance between its nestA and nestB.
         *
         * @type {number}
         */
        this._addProperty("length", serializer.defaultNumber(data.length));

        /**
         * The first Nest this Web is connected to.
         *
         * @type {Nest}
         */
        this._addProperty("nestA", serializer.defaultGameObject(data.nestA));

        /**
         * The second Nest this Web is connected to.
         *
         * @type {Nest}
         */
        this._addProperty("nestB", serializer.defaultGameObject(data.nestB));

        /**
         * All the Spiderlings currently moving along this Web.
         *
         * @type {list.<Spiderling>}
         */
        this._addProperty("spiderlings", serializer.defaultArray(data.spiderlings));

        /**
         * How much weight this Web can take before snapping and destroying itself and all the Spiders on it.
         *
         * @type {number}
         */
        this._addProperty("strength", serializer.defaultInteger(data.strength));


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

        this.nestA.webs.push(this);
        this.nestB.webs.push(this);
        this.length = this.nestA.distanceTo(this.nestB);
        this.strength = 100;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Web",


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    /**
     * Snaps the web, killing all spiders on it.
     */
    snap : function(){
      for(var i = 0; i < this.spider.length; i++){
        this.spider[i].kill();
      }
      this.nestA = NULL;
      this.nestB = NULL;
    }


    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Web;
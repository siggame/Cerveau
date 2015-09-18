var Class = require(__basedir + "/utilities/class");
var BaseGameObject = require("./baseGameObject");
var extend = require("extend");

// @class BaseGameObject: the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
var FogOfWarGameObject = Class(BaseGameObject, {
    init: function(data) {
        BaseGameObject.init.apply(this, arguments);

        this._addProperty("playersVisibleTo", []);
    },

    /**
     * Checks if this game object is visible to a player
     *
     * @returns boolean representing if this game object is visible to the passed in player
     */
    isVisibleToPlayer: function(player) {
        for(var i = 0; i < this.playersVisibleTo.length; i++) {
            if(this.playersVisibleTo[i] === player) {
                return true;
            }
        }

        return false;
    },

    /**
     * makes the game object visible to the passed in player(s)
     *
     * @param {Player|Array.<Player>} the player or players you want to make this visible to
     */
    makeVisibleTo: function(players) {
        if(players.isArray) {
            this.playersVisibleTo.pushIfAbsent.apply(this.playersVisibleTo, players);
        }
        else { // players is actually a single player, not an array of players
            this.playersVisibleTo.pushIfAbsent(players);
        }
    },

    /**
     * makes the game hidden to the passed in player(s)
     *
     * @param {Player|Array.<Player>} the player or players you want to make this hidden to
     */
    makeHiddenTo: function(players) {
        if(!players.isArray) {
            players = [players];
        }
        for(var i = 0; i < players.length; i++) {
            this.playersVisibleTo.removeElement(players[i]);
        }
    },
});

module.exports = FogOfWarGameObject;

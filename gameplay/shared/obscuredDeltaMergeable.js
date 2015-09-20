var log = require("../log");
var utilities = require(__basedir + "/utilities");
var Class = require(__basedir + "/utilities/class");
var DeltaMergeable = require("./deltaMergeable");

var ObscuredDeltaMergeable = Class(DeltaMergeable, {
    _setupProperty: function(key /*... */) {
        DeltaMergeable._setupProperty.apply(this, arguments);

        this._properties[key].obscured = {};
    },

    /**
     * Manipulates the obscuring of a key for some players, while checking where needed
     *
     * @param {string} key - the key you are obscuring
     * @param {*} value - what the obscured value will be
     * @param {Player|Array.<Player>} forPlayers - a single player, or array of players to obscure to some value
     * @returns {boolean} true if worked, false if there is no property present to obscure
     */
    obscure: function(key, value, forPlayers) {
        return this._obscure(forPlayers, key, function(property, player) {
            property.obscured[player.id] = property.obscured[player.id] || {};
            property.obscured[player.id] = value;
        });
    },

    /**
     * Manipulates the obscuring of a key for some players, while checking where needed
     *
     * @param {string} key - the key you are unobscuring
     * @param {Player|Array.<Player>} forPlayers - a single player, or array of players to unobscure to the real value
     * @returns {boolean} true if worked, false if there is no property present to unobscure
     */
    unobscure: function(key, forPlayers) {
        return this._obscure(forPlayers, key, function(property, player) {
            delete property.obscured[player.id];
        });
    },

    /**
     * Manipulates the obscuring of a key for some players, while checking where needed
     *
     * @param {Player|Array.<Player>} forPlayers - a single player, or array of players to manipulate the obscuring for
     * @param {string} key - the key you are manipulating the obscuring of
     * @returns {boolean} true if worked, false if there is no property present to obscure
     */
    _obscure: function(forPlayers, key, callback) {
        if(!forPlayers.isArray) {
            forPlayers = [ forPlayers ];
        }

        if(!this._hasProperty(key)) {
            return false;
        }

        for(var i = 0; i < forPlayers.length; i++) {
            var property = this._properties[key];
            var player = forPlayers[i];

            callback(property, player);
            this._baseGame.obscuredDeltaUpdate(property, player);
        }
        return true;
    },

    /**
     * tries to get the value as it is obscured for a player, otherwise the normal value
     *
     * @param {string} key - the key in this to try to get
     * @param {Player} forPlayer - which player the value could be obscured to
     * @returns {*} the value of this[key] as it should appear to the player
     */
    getObscured: function(key, forPlayer) {
        return (this.isObscured(key, forPlayer) ? this._properties[key].obscured[forPlayer.id] : this[key]);
    },

    /**
     * checks if a property is obscured to a player
     *
     * @param {string} key - key of the property to check
     * @param {Player} forPlayer - the player in the game to check if the property is obscured to them
     * @returns {boolean} true if that property is obscured to that player, false otherwise.
     */
    isObscured: function(key, forPlayer) {
        return (this._hasProperty(key) && this._properties[key].obscured && this._properties[key].obscured.hasOwnProperty(forPlayer.id));
    },

    // TODO: delta updating... ugh
});

module.exports = ObscuredDeltaMergeable;

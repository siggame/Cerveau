// NOTE: FogOfWar games are not heavily tested
var Class = require(__basedir + "/utilities/class");
var BaseGame = require("./baseGame");
var clone = require("clone");
var uuid = require("uuid");

// @class FogOfWarGame: a base game that can hide game objects from players, that is to say thier game states will be able to hide (send null) for certain game objects on the fly
var FogOfWarGame = Class(BaseGame, {
    init: function() {
        BaseGame.init.apply(this, arguments);

        this._deltaForPlayer = {}; // dictionary of players to their delta
    },

    /**
     * @override generates a UUID (Universally unique identifier) V4, because with game data being obscued we don't want competitors potentially learning hidden data based of id generation.
     */
    _generateNextGameObjectID: function() {
        return uuid.v4();
    },

    /**
     * @override
     */
    getDeltaFor: function(player) {
        return this._deltaForPlayer[player];
    },

    deltaUpdate: function(/* ... */) {
        // NOTE this currently does not work. Discussion will need to be done to decide HOW hidden object games should be represented in data generically
    },
});

module.exports = FogOfWarGame;

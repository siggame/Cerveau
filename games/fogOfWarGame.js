// NOTE: FogOfWar games are not heavily tested
var Class = require("../utilities/class");
var BaseGame = require("./baseGame");
var clone = require("clone");

// @class FogOfWarGame: a base game that can hide game objects from players, that is to say thier game states will be able to hide (send null) for certain game objects on the fly
var FogOfWarGame = Class(BaseGame, {
    init: function() {
        BaseGame.init.apply(this, arguments);

        this._serializableDeltaStateForPlayer = {};
        this._lastSerializableStateForPlayer = {};
        this._currentSerializableStateForPlayer = {};
    },

    // TODO npm install https://github.com/broofa/node-uuid
    _generateNextGameObjectID: function() {
        return uuid.v4();
    },

    /// we actually use the client here to get THIER state, not the general state
    getSerializableDeltaStateFor: function(client) {
        return this._serializableDeltaStateForPlayer[client.player];
    },

    /// updates all the private states used to generate delta states and game logs
    _updateSerializableStates: function() {
        BaseGame._updateSerializableStates.apply(this, arguments);

        for(var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            this._lastSerializableStateForPlayer[player] = this._currentSerializableStateForPlayer[player] || {};
            this._currentSerializableStateForPlayer[player] = serializer.serialize(this._asVisibleTo(player));
            this._serializableDeltaStateForPlayer[player] = serializer.getDelta(this._lastSerializableStateForPlayer[player], this._currentSerializableStateForPlayer[player]) || {};
        }
    },

    /// returns what the game should look like as an object as visible to the player, so basically removes game objects that player shouldn't know about
    // @pararm <Player> player to get visible game objects for
    _asVisibleTo: function(player, _state) {
        var state = clone(_state || this);

        for(var key in state) {
            if(state.hasOwnProperty(key)) {
                var value = state[key];

                if(serializer.isObject(value)) {
                    if(value.id !== undefined) { // then value is a game object, so let's see if this state can see it
                        if(!value.isVisibleToPlayer(player)) {
                            delete state[key];
                        }
                    }

                    if(state[key]) { // then it was not deleted
                        value = this._asVisibleTo(player, value);
                    }
                }
            }
        }

        return state;
    }
});

module.exports = FogOfWarGame;

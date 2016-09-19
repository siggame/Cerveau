var Class = require(__basedir + "/utilities/class");
var BaseGame = require("./baseGame");
var log = require("../log");

/**
 * @class TwoPlayerGame - a game that will only have two player connected, so we can make a handy Player.otherPlayer reference in them. That's it
 */
var TwoPlayerGame = Class(BaseGame, {
    /**
     * initializes the Player.otherPlayer for each player
     */
    begin: function() {
        BaseGame.begin.apply(this, arguments);

        // these are depreciated. `otherPlayer` was renamed to `opponent`, but without re-running Creer against all old games and their AIs, it would break.
        this.players[0].otherPlayer = this.players[1];
        this.players[1].otherPlayer = this.players[0];

        // correct attribute to set
        this.players[0].opponent = this.players[1];
        this.players[1].opponent = this.players[0];
    },
});

module.exports = TwoPlayerGame;

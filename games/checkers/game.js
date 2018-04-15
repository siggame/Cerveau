// Game: The simple version of American Checkers. An 8x8 board with 12 checkers on each side that must move diagonally to the opposing side until kinged.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const TwoPlayerGame = require(`${__basedir}/gameplay/shared/twoPlayerGame`);
const TurnBasedGame = require(`${__basedir}/gameplay/shared/turnBasedGame`);

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Game: The simple version of American Checkers. An 8x8 board with 12 checkers on each side that must move diagonally to the opposing side until kinged.
let Game = Class(TwoPlayerGame, TurnBasedGame, {
    /**
     * Initializes Games.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        TurnBasedGame.init.apply(this, arguments);
        TwoPlayerGame.init.apply(this, arguments);

        /**
         * The height of the board for the Y component of a checker.
         *
         * @type {number}
         */
        this.boardHeight = this.boardHeight || 0;

        /**
         * The width of the board for X component of a checker.
         *
         * @type {number}
         */
        this.boardWidth = this.boardWidth || 0;

        /**
         * The checker that last moved and must be moved because only one checker can move during each players turn.
         *
         * @type {Checker}
         */
        this.checkerMoved = this.checkerMoved || null;

        /**
         * If the last checker that moved jumped, meaning it can move again.
         *
         * @type {boolean}
         */
        this.checkerMovedJumped = this.checkerMovedJumped || false;

        /**
         * All the checkers currently in the game.
         *
         * @type {Array.<Checker>}
         */
        this.checkers = this.checkers || [];

        /**
         * The player whose turn it is currently. That player can send commands. Other players cannot.
         *
         * @type {Player}
         */
        this.currentPlayer = this.currentPlayer || null;

        /**
         * The current turn number, starting at 0 for the first player's turn.
         *
         * @type {number}
         */
        this.currentTurn = this.currentTurn || 0;

        /**
         * A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
         *
         * @type {Object.<string, GameObject>}
         */
        this.gameObjects = this.gameObjects || {};

        /**
         * The maximum number of turns before the game will automatically end.
         *
         * @type {number}
         */
        this.maxTurns = this.maxTurns || 0;

        /**
         * List of all the players in the game.
         *
         * @type {Array.<Player>}
         */
        this.players = this.players || [];

        /**
         * A unique identifier for the game instance that is being played.
         *
         * @type {string}
         */
        this.session = this.session || "";


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        this.boardWidth = 8;
        this.boardHeight = 8;
        this.maxTurns = 300;
        //<<-- /Creer-Merge: init -->>
    },

    name: "Checkers",

    aliases: [
        //<<-- Creer-Merge: aliases -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        "MegaMinerAI-##-Checkers",
        //<<-- /Creer-Merge: aliases -->>
    ],



    /**
     * This is called when the game begins, once players are connected and ready to play, and game objects have been initialized. Anything in init() may not have the appropriate game objects created yet..
     */
    begin: function() {
        TurnBasedGame.begin.apply(this, arguments);
        TwoPlayerGame.begin.apply(this, arguments);

        //<<-- Creer-Merge: begin -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        this._initCheckerPieces();
        //<<-- /Creer-Merge: begin -->>
    },

    /**
     * This is called when the game has started, after all the begin()s. This is a good spot to send orders.
     */
    _started: function() {
        TurnBasedGame._started.apply(this, arguments);
        TwoPlayerGame._started.apply(this, arguments);

        //<<-- Creer-Merge: _started -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // any logic for _started can be put here
        //<<-- /Creer-Merge: _started -->>
    },


    /**
     * This is called whenever your checker gets captured (during an opponent's turn).
     *
     * @param {Player} player - the player that called this.
     * @param {Checker} checker - The checker that was captured.
     */
    aiFinishedGotCaptured: function(player, checker) {
        // <<-- Creer-Merge: gotCaptured -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Game's gotCaptured function here
        return;

        // <<-- /Creer-Merge: gotCaptured -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    _initPlayers: function() {
        TurnBasedGame._initPlayers.apply(this, arguments);

        // we can assume there are only 2 players (it's set above), no need to loop through them
        this.players[0].yDirection = 1; // they are on top, and move down the board until kinged
        this.players[1].yDirection = -1; // they are on bottom, and move up the board until kinged
    },

    // / initializes the checker game objects for this game
    _initCheckerPieces: function() {
        for(var y = 0; y < this.boardHeight; y++) {
            for(var x = 0; x < this.boardWidth; x++) {
                if(this.isValidTile(x, y)) {
                    var owner = undefined;

                    if(y < 3) { // then it is player 0's checker
                        owner = this.players[0];
                    }
                    else if(y > 4) { // then it is player 1's checker
                        owner = this.players[1];
                    } // else is the middle, which has no intial checker pieces

                    if(owner) {
                        var checker = this.create("Checker", {
                            owner: owner,
                            x: x,
                            y: y,
                            kinged: false,
                        });

                        this.checkers.push(checker);
                        owner.checkers.push(checker);
                    }
                }

            }
        }
    },

    isValidTile: function(x, y) {
        return (x + y)%2 === 1;
    },

    getCheckerAt: function(x, y) {
        for(var i = 0; i < this.checkers.length; i++) {
            var checker = this.checkers[i];

            if(checker.x === x && checker.y === y) {
                return checker;
            }
        }
    },



    // /////////////////////////////
    // Turn Based Game mechanics //
    // /////////////////////////////

    nextTurn: function() {
        this.checkerMoved = null;
        this.checkerMovedJumped = false;

        return TurnBasedGame.nextTurn.apply(this, arguments);
    },

    _maxTurnsReached: function() {
        TurnBasedGame._maxTurnsReached.apply(this, arguments);

        var checkerValuesForPlayerID = {};
        for(var i = 0; i < this.checkers.length; i++) {
            var checker = this.checkers[i];
            checkerValuesForPlayerID[checker.owner.id] = checkerValuesForPlayerID[checker.owner.id] || 1;
            checkerValuesForPlayerID[checker.owner.id] += (checker.kinged ? 100 : 1);
        }

        // TODO: handle draw
        var winner;
        for(i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            winner = winner || player;

            if(checkerValuesForPlayerID[player.id] > checkerValuesForPlayerID[winner.id]) {
                winner = player;
            }
        }

        if(winner) {
            return this.declareWinner(winner, "Turn limit reached; has the most remaining checkers or kinged checkers");
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

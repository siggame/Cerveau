// Game: The traditional 8x8 chess board with pieces.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var TwoPlayerGame = require(__basedir + "/gameplay/shared/twoPlayerGame");
var TurnBasedGame = require(__basedir + "/gameplay/shared/turnBasedGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var Chess = require("chess.js").Chess; // a very popular chess framework we will use to run all chess logic. This Game is basically an interface to chess.js

//<<-- /Creer-Merge: requires -->>

// @class Game: The traditional 8x8 chess board with pieces.
var Game = Class(TwoPlayerGame, TurnBasedGame, {
    /**
     * Initializes Games.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        TurnBasedGame.init.apply(this, arguments);
        TwoPlayerGame.init.apply(this, arguments);

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
         * Forsyth–Edwards Notation, a notation that describes the game board.
         *
         * @type {string}
         */
        this.fen = this.fen || "";

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
         * The list of Moves that have occurred, in order.
         *
         * @type {Array.<Move>}
         */
        this.moves = this.moves || [];

        /**
         * All the uncaptured Pieces in the game.
         *
         * @type {Array.<Piece>}
         */
        this.pieces = this.pieces || [];

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

        /**
         * How many turns until the game ends because no pawn has moved and no Piece has been taken.
         *
         * @type {number}
         */
        this.turnsToDraw = this.turnsToDraw || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.chess = new Chess();

        if(data.fen && this.chess.validate_fen(data.fen)) {
            this.chess.load(data.fen);
        }

        this.maxTurns = 6000; // longest possible known game without stalemate is 5,950
        this.turnsToDraw = 100; // 50 move rule, 50 moves are two complete turns, so 100 turns in total.

        //<<-- /Creer-Merge: init -->>
    },

    name: "Chess",

    aliases: [
        //<<-- Creer-Merge: aliases -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        "MegaMinerAI-Chess",
        "Spring-2016-Chess",
        "Fall-2016-Chess",
        "Spring-2017-Chess",
        //<<-- /Creer-Merge: aliases -->>
    ],



    /**
     * This is called when the game begins, once players are connected and ready to play, and game objects have been initialized. Anything in init() may not have the appropriate game objects created yet..
     */
    begin: function() {
        TurnBasedGame.begin.apply(this, arguments);
        TwoPlayerGame.begin.apply(this, arguments);

        //<<-- Creer-Merge: begin -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.fen = this.chess.fen();

        this.players[0].color = "White";
        this.players[0].rankDirection = 1;
        this.players[1].color = "Black";
        this.players[1].rankDirection = -1;

        var owners = {
            w: this.players[0],
            b: this.players[1],
        };

        this.currentPlayer = owners[this.chess.turn()];

        var types = {
            p: "Pawn",
            r: "Rook",
            b: "Bishop",
            n: "Knight",
            q: "Queen",
            k: "King",
        };

        for(var i = 0; i < this.chess.SQUARES.length; i++) {
            var square = this.chess.SQUARES[i];

            var info = this.chess.get(square);

            if(info) { // then there is a piece at that location
                var piece = this.create("Piece", {
                    type: types[info.type],
                    file: square[0],
                    rank: parseInt(square[1]),
                    owner: owners[info.color],
                });

                this.pieces.push(piece);
                piece.owner.pieces.push(piece);
            }
        }

        this._generateMoves();

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


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    _playerStartingTime: 9e11, // 15 min in nanoseconds
    _playerAdditionalTimePerTurn: 0, // they start with 15 min and get no additional time per turn.

    _generateMoves: function() {
        this.validMoves = this.chess.moves({verbose: true});
    },

    /**
     * Looks at the chess.js instance to update this Game's GameObjects. Should be called after a move is made successfully.
     *
     * @param {Piece} piece - the piece that moved resulting in this update
     * @param {Object} result - result object returned from chess.move
     * @returns {Move} the move that was made in a Move object+
     */
    update: function(piece, result) {
        this.fen = this.chess.fen();

        var captured;
        var move = this.create("Move", {
            san: result.san,
            piece: piece,
            fromFile: piece.file,
            fromRank: piece.rank,
        });

        if(result.flags === "e") { // en passant capture
            captured = this._getPieceAt(result.to[0] + result.from[1]);
        }
        else if(result.captured) { // normal capture via moving to captured piece
            captured = this._getPieceAt(result.to);
        }

        if(captured) {
            captured.captured = true;
            captured.file = "";
            captured.rank = -1;
            this.pieces.removeElement(captured);
            captured.owner.pieces.removeElement(captured);
            move.captured = captured;
        }

        if(result.flags === "q" || result.flags === "k") { // queen or king side castle
            var file = result.flags === "q" ? "a" : "h"; // queenside rook at file "a", kingside at "h"
            var rank = result.to[1];
            var rook = this._getPieceAt(file + rank);

            var rookFile = result.flags === "q" ? "d" : "f"; // queenside castle ends up at file "d", kingside at "f"
            rook.file = rookFile;
            rook.rank = parseInt(rank);
            rook.hasMoved = true;
        }

        piece.file = result.to[0];
        piece.rank = parseInt(result.to[1]);
        piece.hasMoved = true;

        move.toFile = piece.file;
        move.toRank = piece.rank;

        this.turnsToDraw = (piece.type === "Pawn" || captured) ? 100 : Math.max(this.turnsToDraw - 1, 0);

        if(result.promotion) {
            piece.type = ({
                n: "Knight",
                b: "Bishop",
                r: "Rook",
                q: "Queen",
            })[result.promotion.toLowerCase()];

            move.promotion = piece.type;
        }

        this.moves.push(move);
        piece.owner.madeMove = true;
        piece.owner.inCheck = false; // you can only move out of check
        piece.owner.opponent.inCheck = this.chess.in_check();

        if(this.chess.in_checkmate()) {
            this.declareWinner(this.currentPlayer, "Checkmate!");
            this.declareLoser(this.currentPlayer.opponent, "Checkmated");
        }
        else if(this.turnsToDraw <= 0) { // this.chess.in_draw() should be true at the same time, but we are tracking the turns anyways, and chess.in_draw() checks for more than the 50-turn rule so the checks following this one would never be reached
            this.declareLosers(this.players, "Draw - 50-move rule: 50 moves completed with no pawn moved or piece captured.");
        }
        if(this.chess.insufficient_material()) {
            this.declareLosers(this.players, "Draw - Insufficient material (K vs. K, K vs. KB, or K vs. KN) for checkmate.");
        }
        else if(this.chess.in_stalemate()) {
            this.declareLosers(this.players, "Stalemate - The side to move has been stalemated because they are not in check but have no valid moves.");
        }
        // disabled for Dr. T's CS5400 class
        /* else if(this.chess.in_threefold_repetition()) {
            this.declareLosers(this.players, "Stalemate - Board position has occurred three or more times.");
        }*/
        // instead we'll use his simplified rules
        else if(this._inSimplifiedThreefoldRepetition()) {
            this.declareLosers(this.players, "Draw - Simplified threefold repetition occurred.");
        }
        else { // the game is not over
            this._generateMoves();
        }

        return move;
    },

    /**
     * Gets the Piece at pos, in format "a1"
     *
     * @param {string} pos - the position, with file and rank at [0] and [1] respectively in the string.
     * @returns {Piece} the piece at pos, if found; undefined otherwise
     */
    _getPieceAt: function(pos) {
        for(var i = 0; i < this.pieces.length; i++) {
            var piece = this.pieces[i];
            if(pos.toLowerCase() === piece.file + piece.rank) {
                return piece;
            }
        }
    },

    /**
     * if for the last eight moves no capture, promotions, or pawn movement has happened and moves 0,1,2, and 3 are identical to moves 4, 5, 6, and 7 respectively, then a draw has occurred
     *
     * @returns {Boolean} true if the last moves are indeed in simplified threefold repetition (STFR), false otherwise
     */
    _inSimplifiedThreefoldRepetition: function() {
        var numberOfMoves = this.moves.length;

        if(numberOfMoves < 8) {
            return false; // not enough moves have even occurred to be in STFR
        }

        // for the last 4 "rounds" (two turns for each player)
        for(var i = 0; i < 4; i++) {
            var move = this.moves[numberOfMoves + i - 8];
            var nextMove = this.moves[numberOfMoves + i - 4];

            // if for the last eight moves a capture, promotion, or pawn movement has happened, then simplified threefold repetition has NOT occurred
            if(this._moveHasCapturePromotionOrPawnAdvancement(move) || this._moveHasCapturePromotionOrPawnAdvancement(nextMove)) {
                return false; // has not occurred
            }

            // if any of the moves 0 and 4, 1 and 5, ..., 3 and 7 are NOT identical, then a draw has NOT occurred
            //    Two moves are identical if the starting position (file and rank) and ending position (file and rank) of the moves are identical.
            if(move.piece !== nextMove.piece || move.fromFile + move.fromRank !== nextMove.fromFile + nextMove.fromRank || move.toFile + move.toRank !== nextMove.toFile + nextMove.toRank) {
                return false; // has not occurred
            }
        }

        return true; // if we got here the last 8 moves are repeats, so it is in STFR
    },

    /**
     * checks if the move a capture, promotion, or pawn movement
     *
     * @param {Move} move - the move to check against
     * @returns {Boolean} true is so, false otherwise
     */
    _moveHasCapturePromotionOrPawnAdvancement: function(move) {
        return Boolean(move.captured || move.promotion || move.piece.type === "Pawn");
    },

    /**
     * Invoked when the turn needs to transition to the next player
     *
     * @override
     */
    nextTurn: function(/* ... */) {
        if(!this.currentPlayer.madeMove) {
            this.declareLoser(this.currentPlayer, "Did not make a move on turn number {}".format(this.currentTurn));
            this.declareWinner(this.currentPlayer.opponent, "Other player did not make a move on turn number {}".format(this.currentTurn));
            return; // game over
        }

        for(var i = 0; i < this.players.length; i++) {
            this.players[i].madeMove = false;
        }

        return TurnBasedGame.nextTurn.apply(this, arguments);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

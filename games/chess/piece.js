// Generated by Creer at 10:54PM on November 27, 2015 UTC, git hash: '1b69e788060071d644dd7b8745dca107577844e1'

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Piece: A chess piece
var Piece = Class(GameObject, {
    /**
     * Initializes Pieces.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * When the piece has been captured (removed from the board) this is true. Otherwise false.
         *
         * @type {boolean}
         */
        this._addProperty("captured", serializer.defaultBoolean(data.captured));

        /**
         * The file (y) coordinate of the checker.
         *
         * @type {number}
         */
        this._addProperty("file", serializer.defaultInteger(data.file));

        /**
         * If the piece has moved from its starting position.
         *
         * @type {boolean}
         */
        this._addProperty("hasMoved", serializer.defaultBoolean(data.hasMoved));

        /**
         * The player that controls this chess Piece.
         *
         * @type {Player}
         */
        this._addProperty("owner", serializer.defaultGameObject(data.owner));

        /**
         * The rank (x) coordinate of the checker, traditionally represented as a letter.
         *
         * @type {number}
         */
        this._addProperty("rank", serializer.defaultInteger(data.rank));

        /**
         * The type of chess piece this is, either: "King", "Queen", "Knight", "Rook", "Bishop", or "Pawn"
         *
         * @type {string}
         */
        this._addProperty("type", serializer.defaultString(data.type));


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.captured = false;
        this.hasMoved = false;

        // not exposed to AIs
        this.validMoves = [];
        this.color = this.owner === this.game.players[0] ? "White" : "Black";
        this._originalType = this.type;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Piece",


    /**
     * Moves the piece from its current location to the given rank and file.
     *
     * @param {Player} player - the player that called this.
     * @param {number} rank - The rank (x) coordinate to move to.
     * @param {number} file - The file (y) coordinate to move to.
     * @param {string} promotionType - If this is a Pawn moving to the end of the board then this parameter is what to promote it to.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} true if the move was valid, false otherwise
     */
    move: function(player, rank, file, promotionType, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var reason = "Move {move} is invalid for {self}"; // default reason why this move is invalid

        if(this.owner !== player) {
            reason = "Tried to move {self} which is not owned by you.";
        }
        else if(this.game.pieceMovedThisTurn) {
            reason = "Tried to move {self} after having already moved a Piece this turn.";
        }
        else if(!this.game.isInBounds(file, rank)) {
            reason = "Movement to ({rank}, {file}) is out of bounds of the board.";
        }
        else if(rank === this.rank && file === this.file) {
            reason = "{self} is already on ({rank}, {file}).";
        }
        else { // let's see if it's valid
            for(var i = 0; i < this.validMoves.length; i++) {
                var move = this.validMoves[i];
                if(rank === move.rank && file === move.file) { // then it's valid!
                    if(move.promotes) {
                        if(this.type !== "Pawn" || !this.game.validPromotionTypes.contains(promotionType)) {
                            reason = "PromotionType '{promotionType}' is not valid.";
                            break;
                        }

                        this.type = promotionType;
                    }

                    this.hasMoved = true;
                    this.rank = move.rank;
                    this.file = move.file;

                    var capturedPiece = move.captures;
                    if(capturedPiece) {
                        capturedPiece.captured = true;
                        capturedPiece.owner.pieces.removeElement(capturedPiece);
                        this.game.pieces.removeElement(capturedPiece);
                        capturedPiece.rank = -1; // move off board to also signify it has been captured
                        capturedPiece.file = -1;
                    }

                    if(capturedPiece || this.type === "Pawn") {
                        this.game.turnsToStalemate = this.game.maxTurnsToStalement;
                    }
                    else {
                        this.game.turnsToStalemate--;
                    }

                    // TODO: castling moves two pieces, and would need to be handled here somehow.

                    //log("Move {} - {}".format(this, this.game.turnsToStalemate));

                    this.game.pieceMovedThisTurn = this;
                    return true; // move was valid, and has now been handled.
                }
            }
        }

        // if we got here the move was invalid for some reason, so format it up.
        reason = reason.format({
            self: this.toString(),
            move: "from ({}, {}) to ({}, {})".format(this.rank, this.file, rank, file),
            rank: rank,
            file: file,
            promotionType: promotionType,
        });

        // we don't tolerate invalid moves. Doing so will cause them to loose
        this.game.declareLoser(player, reason);
        this.game.declareWinner(player.otherPlayer, "Opponent ({}) sent an invalid move.".format(player));

        return this.game.logicError(false, reason);

        // <<-- /Creer-Merge: move -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * @override
     */
    toString: function() {
        return "Piece {color} '{type}' #{id}".format(this);
    },

    /**
     * Generates all the possible validMoves for this piece
     */
    generateValidMoves: function() {
        this.validMoves.length = 0; // empties out the validMoves array, as we will be generating that next
        this["_generateValidMovesFor" + this.type].apply(this);
    },

    _generateValidMovesForRook: function() {
        this._generateValidMovesForRookStraitLine(this.rank + 1, this.game.ranks, "file"); // move right
        this._generateValidMovesForRookStraitLine(this.rank - 1, 0, "file"); // move left
        this._generateValidMovesForRookStraitLine(this.file + 1, this.game.files, "rank"); // move up
        this._generateValidMovesForRookStraitLine(this.file - 1, 0, "rank"); // move down
    },

    _generateValidMovesForRookStraitLine: function(start, end, staticKey) {
        if(start < end) {
            for(var i = start; i < end; i++) {
                if(this._generateValidMovesForRookStraitAndShouldStop(i, staticKey)) {
                    break;
                }
            }
        }
        else {
            for(var i = start; i >= end; i--) {
                if(this._generateValidMovesForRookStraitAndShouldStop(i, staticKey)) {
                    break;
                }
            }
        }
    },

    _generateValidMovesForRookStraitAndShouldStop: function(i, staticKey) {
        var pos = {
            rank: i,
            file: i,
        };

        pos[staticKey] = this[staticKey];

        var a = this._validatePositionAndShouldStop(pos);

        /*log("> GENERATING... Rook strait line {self} at ({self.rank}, {self.file}) to ({pos.rank}, {pos.file}) is valid? {valid}".format({
            self: this,
            pos: pos,
            valid: a,
        }));
        //*/

        return a;
    },

    /**
     * Checks if a position is valid to be added to this Piece's valid moves, and does so if valid. returns if you should continue looking
     *
     * @param {Object} pos - pos.rank and pos.file
     * @param {boolean} [cantCapture] - override the default behavior because this piece can't capture other pieces at this pos
     * @param {boolean} [mustCapture] - override the default behavior because this peice MUST capture another piece at this pos
     * @returns {boolean} true if you should stop looking (because it was a capture or off board), false otherwise
     */
    _validatePositionAndShouldStop: function(pos, cantCapture, mustCapture) {
        if(!this.game.isInBounds(pos)) {
            return true;
        }

        pos.captures = this.game.getPieceAt(pos);

        if(mustCapture && !pos.captures) {
            return true;
        }

        if(cantCapture && pos.captures) {
            return true;
        }

        if(pos.captures) {
            if(pos.captures.type === "King") {
                return true;
            }

            var nextPlayer = this.game.currentPlayer.otherPlayer;
            if(nextPlayer === this.owner && pos.captures.owner === this.owner) {
                return true;
            } // otherwise we are not the valid player and that position our piece is at could be valid, if that peice were removed by the next player
        }

        if(pos.captures && pos.captures.type === "King") {
            return true;
        }

        this.validMoves.push(pos); // if we got there it's valid!

        /*log("{piece} move from ({piece.rank}, {piece.file}) to ({move.rank}, {move.file}).".format({
            piece: this,
            move: pos,
        }));
        //*/

        return Boolean(pos.captures);
    },

    _generateValidMovesForBishop: function() {
        for(var rankScalar = -1; rankScalar <= 1; rankScalar += 2) {
            for(var fileScalar = -1; fileScalar <= 1; fileScalar += 2) {
                for(var i = 1; true; i++) {
                    var pos = {
                        rank: this.rank * rankScalar * i,
                        file: this.file * fileScalar * i,
                    };

                    if(this._validatePositionAndShouldStop(pos)) {
                        break;
                    }
                }
            }
        }
    },

    _generateValidMovesForQueen: function() {
        this._generateValidMovesForRook();
        this._generateValidMovesForBishop();
    },


    _knightMoves: [
        [1, 2],
        [2, 1],
        [-1, 2],
        [-2, 1],
        [1, -2],
        [2, -1],
        [-1, -2],
        [-2, -1]
    ],

    _generateValidMovesForKnight: function() {
        for(var i = 0; i < this._knightMoves.length; i++) {
            var knightMove = this._knightMoves[i];
            var pos = {
                rank: this.rank + knightMove[0],
                file: this.file + knightMove[1],
            };

            this._validatePositionAndShouldStop(pos);
        }
    },

    _generateValidMovesForPawn: function() {
        if(!this._validatePositionAndShouldStop({rank: this.rank, file: this.file + this.owner.fileDirection}, true)) { // then they can move up/down one
            if(!this.hasMoved) { // then check if it can move two spaces up/down
                this._validatePositionAndShouldStop({rank: this.rank, file: this.file + this.owner.fileDirection*2}, true);
            }
        }

        this._validatePositionAndShouldStop({rank: this.rank + 1, file: this.file + this.owner.fileDirection}, false, true); // see if it can capture to the right
        this._validatePositionAndShouldStop({rank: this.rank - 1, file: this.file + this.owner.fileDirection}, false, true); // -- and to the left

        // TODO: en passant here

        for(var i = 0; i < this.validMoves.length; i++) {
            var move = this.validMoves[i];

            if((this.owner.fileDirection > 0 && move.file === this.game.files-1) || (this.owner.fileDirection < 0 && move.file === 0)) {
                move.promotes = true;
            }
        }
    },

    _generateValidMovesForKing: function() {
        for(var rank = -1; rank <= 1; rank++) {
            for(var file = -1; file <= 1; file++) {
                if(rank !== 0 && file !== 0) {
                    this._validatePositionAndShouldStop({ // kings obviously can't move into check, the chess Game will remove valid moves that put it into check later
                        rank: this.rank + rank,
                        file: this.file + file,
                    });
                }
            }
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Piece;
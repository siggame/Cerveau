// Piece: A chess piece.

var Class = require(__basedir + "/utilities/class");
var serializer = require(__basedir + "/gameplay/serializer");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Piece: A chess piece.
var Piece = Class(GameObject, {
    /**
     * Initializes Pieces.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Piece",


    /**
     * Moves the Piece from its current location to the given rank and file.
     *
     * @param {Player} player - the player that called this.
     * @param {string} file - The file coordinate to move to. Must be [a-h].
     * @param {number} rank - The rank coordinate to move to. Must be [1-8].
     * @param {string} promotionType - If this is a Pawn moving to the end of the board then this parameter is what to promote it to. When used must be 'Queen', 'Knight', 'Rook', or 'Bishop'.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {Move} The Move you did if successful, otherwise null if invalid. In addition if your move was invalid you will lose.
     */
    move: function(player, file, rank, promotionType, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        file = file.toLowerCase()[0]; // cast the passed in file to just the first letter lower cased

        var reason;
        if(player !== this.game.currentPlayer) {
            reason = "Tried to move {this} during opponent's turn.";
        }

        if(player.madeMove) {
            reason = "Tried to do a second Move during their turn.";
        }

        if(this.owner !== player) {
            reason = "Tried to Move {this}, which is not owned by them.";
        }

        if(this.captured) {
            reason = "Tried to Move the already captured {this}.";
        }

        if(file < "a" || file > "h" || rank < 1 || rank > 8) {
            reason = "Tried to Move {this} to the out of bounds position {file}{rank}.";
        }

        // try to find the move from chess.js's valid moves
        if(!reason) {
            for(var i = 0; i < this.game.validMoves.length; i++) {
                var move = this.game.validMoves[i];

                var myPos = this.file + this.rank;
                var toPos = file + rank;
                var promotion;
                if(myPos === move.from && toPos == move.to) { // we found the move!
                    if(move.promotion) { // then we have to make sure their promotion is valid
                        promotion = promotionType.toLowerCase();
                        if(promotion === "knight") {
                            promotion = "n";
                        }

                        promotion = promotion[0];

                        if(!["n", "b", "r", "q"].contains(promotion)) { // Knight, Bishop, Rook, and Queen are the only valid promotions. These chars are their char representations
                            reason = "Move requires a valid promotion type, '{promotionType}' is not valid.";
                            break;
                        }
                    }

                    // everything looks good, let's do it!
                    var result = this.game.chess.move({
                        from: myPos,
                        to: toPos,
                        promotion: promotion,
                    });

                    if(!result) {
                        log.error("Error this was not valid: {} from {} to {}.".format(this, myPos, toPos));
                    }
                    else { // it's valid! update the game to get the Move
                        return this.game.update(this, result);
                    }
                }
            }
        }

        var inCheck = player.inCheck ? " while in check" : "";
        reason = (reason || "Tried to Move {this} to {file}{rank}{inCheck}.").format({
            this: this,
            player,
            file,
            rank,
            promotionType,
            inCheck,
        });

        this.game.declareWinner(player.opponent, "Opponent made an invalid move{}.".format(inCheck));
        this.game.declareLoser(player, "Invalid - " + reason);

        return this.game.logicError(null, reason);

        // <<-- /Creer-Merge: move -->>
    },

    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    toString: function() {
        return "Piece {owner.color} {type} #{id} at {file}{rank}".format(this);
    }

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Piece;

// Piece: A chess piece.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Piece: A chess piece.
let Piece = Class(GameObject, {
    /**
     * Initializes Pieces.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * When the Piece has been captured (removed from the board) this is true. Otherwise false.
         *
         * @type {boolean}
         */
        this.captured = this.captured || false;

        /**
         * The file (column) coordinate of the Piece represented as a letter [a-h], with 'a' starting at the left of the board.
         *
         * @type {string}
         */
        this.file = this.file || "";

        /**
         * If the Piece has moved from its starting position.
         *
         * @type {boolean}
         */
        this.hasMoved = this.hasMoved || false;

        /**
         * The player that controls this chess Piece.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The rank (row) coordinate of the Piece represented as a number [1-8], with 1 starting at the bottom of the board.
         *
         * @type {number}
         */
        this.rank = this.rank || 0;

        /**
         * The type of chess Piece this is, either 'King, 'Queen', 'Knight', 'Rook', 'Bishop', or 'Pawn'.
         *
         * @type {string}
         */
        this.type = this.type || "";


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Piece",


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {string} file - The file coordinate to move to. Must be [a-h].
     * @param {number} rank - The rank coordinate to move to. Must be [1-8].
     * @param {string} promotionType - If this is a Pawn moving to the end of the board then this parameter is what to promote it to. When used must be 'Queen', 'Knight', 'Rook', or 'Bishop'.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, file, rank, promotionType, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // NOTE: we don't use normal invalidation logic,
        // as if a player fails to ever validate a move, the loose the game, so that's basically proper game logic
        return undefined;

        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves the Piece from its current location to the given rank and file.
     *
     * @param {Player} player - the player that called this.
     * @param {string} file - The file coordinate to move to. Must be [a-h].
     * @param {number} rank - The rank coordinate to move to. Must be [1-8].
     * @param {string} promotionType - If this is a Pawn moving to the end of the board then this parameter is what to promote it to. When used must be 'Queen', 'Knight', 'Rook', or 'Bishop'.
     * @returns {Move} The Move you did if successful, otherwise null if invalid. In addition if your move was invalid you will lose.
     */
    move: function(player, file, rank, promotionType) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        file = file[0].toLowerCase(); // cast the passed in file to just the first letter lower cased

        let invalid; // try to find a reason why this is invalid to force them to loose the game
        if(player !== this.game.currentPlayer) {
            invalid = `Tried to move ${this} during opponent's turn.`;
        }

        if(player.madeMove) {
            invalid = "Tried to do a second move during your turn.";
        }

        if(this.owner !== player) {
            invalid = `Tried to Move ${this}, which is not owned by them.`;
        }

        if(this.captured) {
            invalid = `Tried to move the already captured ${this}.`;
        }

        if(file < "a" || file > "h" || rank < 1 || rank > 8) {
            invalid = `Tried to move ${this} to the out of bounds position ${file}${rank}.`;
        }

        // try to find the move from chess.js's valid moves
        if(!invalid) {
            for(let move of this.game.validMoves) {
                const myPos = this.file + this.rank;
                const toPos = file + rank;
                if(myPos === move.from && toPos === move.to) { // we found the move!
                    let promotion;
                    if(move.promotion) { // then we have to make sure their promotion is valid
                        promotion = promotionType.toLowerCase();
                        if(promotion === "knight") {
                            promotion = "n";
                        }

                        promotion = promotion[0];

                        if(!["n", "b", "r", "q"].contains(promotion)) { // Knight, Bishop, Rook, and Queen are the only valid promotions. These chars are their char representations
                            invalid = `Move requires a valid promotion type, '${promotionType}' is not valid.`;
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
                        log.error(`Error this was not actually valid: ${this} from ${myPos} to ${toPos}.`);
                        break;
                    }
                    else { // it's valid! update the game to get the Move
                        return this.game.update(this, result);
                    }
                }
            }
        }

        // if we got here it is an invalid move because of game logic reasons (that chess.js does not surface)

        var inCheck = player.inCheck ? " while in check" : "";
        invalid = invalid || `Tried to Move ${this} to ${file}${rank}${inCheck}.`;

        this.game.declareWinner(player.opponent, `Opponent made an invalid move${inCheck}.`);
        this.game.declareLoser(player, `Invalid - ${invalid}`);

        return this.game.logicError(null, invalid);

        // <<-- /Creer-Merge: move -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    toString: function() {
        return `Piece ${this.owner.color} ${this.type} #${this.id} at ${this.file}${this.rank}`;
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Piece;

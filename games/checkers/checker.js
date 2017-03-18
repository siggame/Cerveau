// Checker: A checker on the game board.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between cree runs
//<<-- /Creer-Merge: requires -->>

// @class Checker: A checker on the game board.
let Checker = Class(GameObject, {
    /**
     * Initializes Checkers.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * If the checker has been kinged and can move backwards.
         *
         * @type {boolean}
         */
        this.kinged = this.kinged || false;

        /**
         * The player that controls this Checker.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The x coordinate of the checker.
         *
         * @type {number}
         */
        this.x = this.x || 0;

        /**
         * The y coordinate of the checker.
         *
         * @type {number}
         */
        this.y = this.y || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // put any initialization logic here. the base variables should be set from 'data' in Generated${obj_key}'s init function
        // NOTE: no players are connected at this point.
        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Checker",


    /**
     * Invalidation function for isMine
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateIsMine: function(player, args) {
        // <<-- Creer-Merge: invalidateIsMine -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        return undefined; // always valid
        // <<-- /Creer-Merge: invalidateIsMine -->>
    },

    /**
     * Returns if the checker is owned by your player or not.
     *
     * @param {Player} player - the player that called this.
     * @returns {boolean} True if it is yours, false if it is not yours.
     */
    isMine: function(player) {
        // <<-- Creer-Merge: isMine -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        return (player === this.owner);
        // <<-- /Creer-Merge: isMine -->>
    },


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {number} x - The x coordinate to move to.
     * @param {number} y - The y coordinate to move to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, x, y, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        if(this.game.currentPlayer !== player) {
            return `${player} it is not your turn!`;
        }

        if(this.owner !== player) {
            return `${this} is not owned by you.`;
        }

        if(this.game.checkerMoved) {
            if(this.game.checkerMoved !== this) {
                return "Tried to move a check after already moving one.";
            }
            else if(!this.game.checkerMovedJumped) {
                return "Tried to move again after not jumping another checker.";
            }
        }

        let checkerAt = this.game.getCheckerAt(x, y);
        if(checkerAt) {
            return `Cannot move to (${x}, ${y}) because there is ${checkerAt} present at that location.`;
        }

        const dy = y - this.y;
        const dx = x - this.x;

        const fromString = `(${this.x}, ${this.y}) -> (${x}, ${y})`;
        if(!this.kinged) { // then check if they are moving the right direction via dy when not kinged
            if((this.owner.yDirection === 1 && dy < 1) || (this.owner.yDirection === -1 && dy > -1)) {
                return `Moved ${this} in the wrong vertical direction ${fromString}`;
            }
        }

        let jumped = this.getJumped(x, y);
        if(jumped && jumped.owner === this.owner) { // then it's jumping something
            return `${this} tried to jump its own checker ${fromString}`;
        }
        else if(Math.abs(dx) === 1 && Math.abs(dy) === 1) { // then they are just moving 1 tile diagonally
            if(this.game.checkerMovedJumped) {
                return `The current checker must jump again, not move diagonally one tile ${fromString}`;
            }
            // else valid as normal move
        }
        else {
            return `Invalid move ${fromString}`;
        }
        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves the checker from its current location to the given (x, y).
     *
     * @param {Player} player - the player that called this.
     * @param {number} x - The x coordinate to move to.
     * @param {number} y - The y coordinate to move to.
     * @returns {Checker} Returns the same checker that moved if the move was successful. null otherwise.
     */
    move: function(player, x, y) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        this.x = x;
        this.y = y;

        // check if they need to be kinged
        if(this.y === (this.owner.yDirection === 1 ? (this.game.boardHeight - 1) : 0)) {
            this.kinged = true;
        }

        // mark us as the checker that moved
        if(!this.game.checkerMoved) {
            this.game.checkerMoved = this;
        }

        // and remove the checker we jumped (if we did), and check if we won
        let jumped = this.getJumped(x, y);
        if(jumped) {
            this.game.checkers.removeElement(jumped);
            jumped.owner.checkers.removeElement(jumped);

            this.game.order(jumped.owner, "gotCaptured", {
                checker: jumped,
            }); // tell the owner's AI that their jumped checker was captured

            // we need to check if the owner won because they just jumped all the other checkers
            var checkersOwnerWon = true;
            for(const checker of this.game.checkers) {
                if(this.owner !== checker.owner) {
                    checkersOwnerWon = false;
                    break;
                }
            }

            if(checkersOwnerWon) {
                this.game.declareLosers(this.owner.opponent, "No checkers remaining", { dontCheckForWinner: true });
                this.game.declareWinner(this.owner, "All enemy checkers jumped");
            }

            this.game.checkerMovedJumped = true;
        }

        return this;
        // <<-- /Creer-Merge: move -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    getJumped: function(x, y) {
        const dy = y - this.y;
        const dx = x - this.x;

        if(Math.abs(dx) === 2 && Math.abs(dy) === 2) { // then it's jumping something
            return this.game.getCheckerAt(this.x + dx/2, this.y + dy/2);
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Checker;

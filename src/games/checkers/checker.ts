import { IBaseGameObjectRequiredData } from "~/core/game";
import { ICheckerIsMineArgs, ICheckerMoveArgs, ICheckerProperties } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
import { removeElements } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * A checker on the game board.
 */
export class Checker extends GameObject {
    /**
     * If the checker has been kinged and can move backwards.
     */
    public kinged!: boolean;

    /**
     * The player that controls this Checker.
     */
    public owner: Player;

    /**
     * The x coordinate of the checker.
     */
    public x!: number;

    /**
     * The y coordinate of the checker.
     */
    public y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Checker is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: ICheckerProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            owner: Player;
            // <<-- /Creer-Merge: constructor-args -->>
        },
        required: IBaseGameObjectRequiredData,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.owner = args.owner;
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for isMine. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateIsMine(
        player: Player,
    ): void | string | ICheckerIsMineArgs {
        // <<-- Creer-Merge: invalidate-isMine -->>

        // Check all the arguments for isMine here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-isMine -->>
    }

    /**
     * Returns if the checker is owned by your player or not.
     *
     * @param player - The player that called this.
     * @returns True if it is yours, false if it is not yours.
     */
    protected async isMine(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: isMine -->>

        // Add logic here for isMine.

        return (player === this.owner);

        // <<-- /Creer-Merge: isMine -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param x - The x coordinate to move to.
     * @param y - The y coordinate to move to.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMove(
        player: Player,
        x: number,
        y: number,
    ): void | string | ICheckerMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>

        if (this.game.currentPlayer !== player) {
            return `${player} it is not your turn!`;
        }

        if (this.owner !== player) {
            return `${this} is not owned by you.`;
        }

        if (this.game.checkerMoved) {
            if (this.game.checkerMoved !== this) {
                return "Tried to move a check after already moving one.";
            }
            else if (!this.game.checkerMovedJumped) {
                return "Tried to move again after not jumping another checker.";
            }
        }

        const checkerAt = this.game.getCheckerAt(x, y);
        if (checkerAt) {
            return `Cannot move to (${x}, ${y}) because there is ${checkerAt} present at that location.`;
        }

        const dy = y - this.y;
        const dx = x - this.x;

        const fromString = `(${this.x}, ${this.y}) -> (${x}, ${y})`;
        if (!this.kinged) {
            // Then check if they are moving the right direction via dy when
            // not kinged.
            if ((this.owner.yDirection === 1 && dy < 1) ||
               (this.owner.yDirection === -1 && dy > -1)
            ) {
                return `Moved ${this} in the wrong vertical direction ${fromString}`;
            }
        }

        const jumped = this.getJumped(x, y);
        if (jumped && jumped.owner === this.owner) {
            // then it's jumping something
            return `${this} tried to jump its own checker ${fromString}`;
        }
        else if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
            // then they are just moving 1 tile diagonally
            if (this.game.checkerMovedJumped) {
                return `The current checker must jump again, not move diagonally one tile ${fromString}`;
            }
            // else valid as normal move
        }
        else {
            return `Invalid move ${fromString}`;
        }

        // <<-- /Creer-Merge: invalidate-move -->>
    }

    /**
     * Moves the checker from its current location to the given (x, y).
     *
     * @param player - The player that called this.
     * @param x - The x coordinate to move to.
     * @param y - The y coordinate to move to.
     * @returns Returns the same checker that moved if the move was successful.
     * undefined otherwise.
     */
    protected async move(
        player: Player,
        x: number,
        y: number,
    ): Promise<Checker> {
        // <<-- Creer-Merge: move -->>

        this.x = x;
        this.y = y;

        // check if they need to be kinged
        if (this.y === (this.owner.yDirection === 1
                ? (this.game.boardHeight - 1) : 0)) {
            this.kinged = true;
        }

        // mark us as the checker that moved
        if (!this.game.checkerMoved) {
            this.game.checkerMoved = this;
        }

        // and remove the checker we jumped (if we did), and check if we won
        const jumped = this.getJumped(x, y);
        if (jumped) {
            removeElements(this.game.checkers, jumped);
            removeElements(jumped.owner.checkers, jumped);

            // Tell the owner's AI that their jumped checker was captured
            await jumped.owner.ai.gotCaptured(jumped);

            this.game.checkerMovedJumped = true;
        }

        return this;

        // <<-- /Creer-Merge: move -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Gets the checker that was jumped at a given position
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns A checker, if one was jumped. undefined otherwise.
     */
    private getJumped(x: number, y: number): Checker | undefined {
        const dy = y - this.y;
        const dx = x - this.x;

        if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
            // Then it's jumping something
            return this.game.getCheckerAt(this.x + dx / 2, this.y + dy / 2);
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

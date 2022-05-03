// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, JungleGame, JungleGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>

//MIGHT NEED THIS LOOK HERE
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Chess Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class JungleGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID. */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "Jungle",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing. */
    public readonly game!: JungleGame;

    /** The factory that must be used to initialize new game objects. */
    public readonly create!: JungleGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    /**
     * Checks if the move a capture.
     * @param move - The move to check against.
     * @returns True is so, false otherwise.
     */
     public checkMoveForSTFR(): boolean {
         return this.game.jungle.isCapture();
     }

    // <<-- /Creer-Merge: public-methods -->>

    // <<-- Creer-Merge: protected-private-methods -->>

    /**
     * How many turns till 50 move draw during simplified three fold
     * repetition.
     */

    /** Starts the game play. */
    protected start(): void {
        super.start();
        void this.runSideToMove();
    }

    /**
     * Runs the current turn of the player whose turn it is.
     *
     * @returns A promise that resolves once this specific turn is ended.
     */
    private async runSideToMove(): Promise<void> {
        const playerIndex = this.game.jungle.getTurn() === "b" ? 0 : 1;
        const player = this.game.players[playerIndex];

        const move = await player.ai.makeMove();

        const validMove = this.game.jungle.isValidMove(move);

        if (!validMove) {
            this.declareLoser(
                `Made an invalid move ('${move}').
                Valid moves: ${
                    this.game.jungle
                        .getValidMoves() // Take all valid moves,
                }`,
                player,
            );
            this.declareWinner(
                "Opponent made an invalid move.",
                player.opponent,
            );
            this.endGame();

            return;
        }
        // else their move was accepted, update our state proxies
        this.game.fen = this.game.jungle.boardToFen();
        this.game.history.push(validMove);

        const [loserReason, winnerReason] = this.checkForGameOverReasons();
        if (loserReason) {
            if (winnerReason) {
                // first won, second lost
                this.declareWinner(winnerReason, player);
                this.declareLoser(loserReason, player.opponent);
            } else {
                // they all lost because the game is a draw
                this.declareLosers(loserReason, ...this.game.players);
            }

            this.endGame();

            return;
        }

        // now it is a new side's move
        void this.runSideToMove();
    }

    /**
     * Checks the game for a reason to end the game.
     *
     * @returns An empty array if the game is not over. Otherwise an array with
     * one or two strings in it. One means a draw for that reason, two means
     * the first won for that reason, and the second lost for that reason.
     */
    private checkForGameOverReasons(): Array<string | undefined> {
        const jungle = this.game.jungle;
        if (jungle.inDen()) {
            return ["Checkmated", "Checkmate!"];
        }

        if (jungle.insufficient_material()) {
            return [
                "Draw - Insufficient material.",
            ];
        }
        if (jungle.in_stalemate()) {
            return [
                "Stalemate - The side to move has been stalemated " +
                    "because they are not in check, but have no valid moves.",
            ];
        }
        return [];
    }

    /**
     * If for the last eight moves no capture, promotions, or pawn movement
     * has happened and moves 0,1,2, and 3 are identical to moves 4, 5, 6, and
     * 7 respectively, then a draw has occurred.
     *
     * @returns True if the last moves are indeed in simplified threefold
     * repetition (STFR), false otherwise.
     */
    private isInSimplifiedThreefoldRepetition(): boolean {
        return true
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

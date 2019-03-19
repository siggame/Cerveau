// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, ChessGame, ChessGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
import { ChessInstance, Move } from "chess.js";

/**
 * Checks if the move a capture, promotion, or pawn movement
 *
 * @param move - The move to check against
 * @returns True is so, false otherwise
 */
function checkMoveForSTFR(move: Move): boolean {
    return Boolean(move.captured || move.promotion || move.piece === "p");
}
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Chess Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class ChessGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-Chess",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: ChessGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: ChessGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    // any additional public methods you need can be added here

    // <<-- /Creer-Merge: public-methods -->>

    // <<-- Creer-Merge: protected-private-methods -->>

    /** Starts the game play */
    protected start(): void {
        super.start();
        this.runSideToMove();
    }

    /**
     * Runs the current turn of the player whose turn it is
     *
     * @returns A promise that resolves once this specific turn is ended.
     */
    private async runSideToMove(): Promise<void> {
        const playerIndex = this.game.chess.turn() === "w" ? 0 : 1;
        const player = this.game.players[playerIndex];

        const move = await player.ai.makeMove();

        const cleanedMove = this.cleanMove(move, this.game.chess);

        const valid = this.game.chess.move(cleanedMove, { sloppy: true });

        if (!valid) {
            this.declareLoser(`Made an invalid move ('${move}').
Valid moves: ${this.game.chess.moves()      // Take all valid moves,
    .map((validMove) => `'${validMove}'`)   // Wrap them in '' quotes,
    .join(", ")                             // Then finally add commas between each for readability
}`, player);
            this.declareWinner(
                "Opponent made an invalid move.",
                player.opponent,
            );
            this.endGame();

            return;
        }
        // else their move was accepted, update our state proxies
        this.game.fen = this.game.chess.fen();
        this.game.history.push(valid.san);

        const [ loserReason, winnerReason ] = this.checkForGameOverReasons();
        if (loserReason) {
            if (winnerReason) {
                // first won, second lost
                this.declareWinner(winnerReason, player);
                this.declareLoser(loserReason, player.opponent);
            }
            else {
                // they all lost because the game is a draw
                this.declareLosers(loserReason, ...this.game.players);
            }

            this.endGame();

            return;
        }

        // now it is a new side's move
        this.runSideToMove();
    }

    /**
     * Checks the game for a reason to end the game.
     *
     * @returns An empty array if the game is not over. Otherwise an array with
     * one or two strings in it. One means a draw for that reason, two means
     * the first won for that reason, and the second lost for that reason.
     */
    private checkForGameOverReasons(): Array<string | undefined> {
        const chess = this.game.chess;
        if (chess.in_checkmate()) {
            return ["Checkmated", "Checkmate!"];
        }

        if (chess.insufficient_material()) {
            return [
                "Draw - Insufficient material (K vs. K, K vs. KB, or K "
              + "vs. KN) for checkmate.",
            ];
        }
        if (chess.in_stalemate()) {
            return [
                "Stalemate - The side to move has been stalemated "
              + "because they are not in check but have no valid moves.",
            ];
        }

        if (this.game.settings.enableTFR && chess.in_threefold_repetition()) {
            return [
                "Stalemate - Board position has occurred three or more times.",
            ];
        }

        if (this.game.settings.enableSTFR
         && this.isInSimplifiedThreefoldRepetition()
        ) {
            return [ "Draw - Simplified threefold repetition occurred." ];
        }

        // chess.js checks for draws by checking:
        // - 50-move rule
        // - stalemate
        // - insufficient material
        // - three fold repetition
        // Keeping this check last, guarantees everything but the 50-move rule have been checked
        if (!chess.in_threefold_repetition() && chess.in_draw()) {
            return [
                "Draw - 50-move rule: 50 moves completed with no pawn "
              + "moved or piece captured.",
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
        const numberOfMoves = this.game.history.length;
        const history = this.game.chess.history({ verbose: true });

        if (numberOfMoves < 8) {
            return false; // not enough moves have even occurred to be in STFR
        }

        // for the last 4 "rounds" (two turns for each player)
        for (let i = 0; i < 4; i++) {
            const move = history[numberOfMoves + i - 8];
            const nextMove = history[numberOfMoves + i - 4];

            // if for the last eight moves a capture, promotion, or pawn
            // movement has happened, then simplified threefold repetition has
            // NOT occurred
            if (checkMoveForSTFR(move) || checkMoveForSTFR(nextMove)) {
                return false; // has not occurred
            }

            // if any of the moves 0 and 4, 1 and 5, ..., 3 and 7 are NOT
            // identical, then a draw has NOT occurred
            //    Two moves are identical if the starting position (file and
            //    rank) and ending position (file and rank) of the moves are
            //    identical.
            if (move.to !== nextMove.to || move.from !== nextMove.from) {
                return false; // has not occurred
            }
        }

        return true; // if we got here the last 8 moves are repeats,
                     // so it is in STFR
    }

    /**
     * Cleans a move so chess.js can accept a wider range of moves.
     *
     * @param uncleanedMoved - The SAN move to clean
     * @param chess - The chess.js instance to use for move hints
     * @returns A new SAN move that more easily works with chess.js
     */
    private cleanMove(uncleanedMoved: string, chess: ChessInstance): string {
        const move = uncleanedMoved.replace(/\s/g, ""); // remove all whitespace from move

        // First check for 0 vs O casteling
        if (move === "0-0" || move === "0-0-0") {
            return move.replace(/0/g, "O"); // replace all `0` characters with `O` as chess.js expects for castling
        }

        // Next check for UCI (Universal Chess Inferface) formatting
        const from = move[0] + move[1]; // first two chars are expected to be from square
        const to = move[2] + move[3]; // second two chars are expected to be to square
        const promotion = move[4]; // fifth char _might_ be the promotion char

        // \-> now check all moves to see if the from, to, and promotion match. If so use the SAN for it
        const moves = chess.moves({ verbose: true });
        const ourMove = moves.find((valid) => valid.from === from
                                           && valid.to === to
                                           && valid.promotion === promotion,
        );

        if (ourMove) {
            return ourMove.san;
        }

        // nothing matching, let's hope their move was valid!
        return move;
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

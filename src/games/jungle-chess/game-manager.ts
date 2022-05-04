// This file is where you should put logic to control the game and everything
// around it.
import {
    BaseClasses,
    JungleChessGame,
    JungleChessGameObjectFactory,
} from "./";

// <<-- Creer-Merge: imports -->>
import { Gameboard } from "./jungle-library";
import { Tile } from "./jungle-library";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the JungleChess Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class JungleChessGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID. */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "JungleChess",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing. */
    public readonly game!: JungleChessGame;

    /** The factory that must be used to initialize new game objects. */
    public readonly create!: JungleChessGameObjectFactory;

    board: Tile[][] = []
    jungle: Gameboard = new Gameboard(this.board, 'b', 0, 0, 7, 9)

    // <<-- Creer-Merge: public-methods -->>
    private start(): void {
        super.start();
        void this.runSideToMove(this.jungle)
    }

    private async runSideToMove(jungle): Promise<void> {
        const playerIndex = jungle.getTurn() === 'b' ? 0 : 1;
        const player = this.game.players[playerIndex]

        const move = await player.ai.makeMove();

        if (jungle.isValidMove(move)) {
            jungle.makeMove(move)
        }
        else {
            this.declareLoser(
                `Made an invalid move ('${move}').
                Valid moves: ${jungle.getAllMoves()}`,
                player,
            );
            this.declareWinner(
                "Opponent made an invalid move.",
                player.opponent
            );
            this.endGame();
        }
        //This is where we will check for game over conditions
        //check for game over reasons

        void this.runSideToMove(jungle)

    }

    // <<-- /Creer-Merge: public-methods -->>

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

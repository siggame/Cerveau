// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, JungleGame, JungleGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
//import { Gameboard } from "./jungle-library";
//import { Tile } from "./jungle-library";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the JungleChess Game.
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

    //public board: Tile[][] = []
    //public jungle: Gameboard = new Gameboard(this.board, 'b', 0, 0, 7, 9)

    // <<-- Creer-Merge: public-methods -->>
    protected start(): void {
        super.start();
        void this.runSideToMove();
    }

    private async runSideToMove(): Promise<void> {
        const playerIndex = this.game.jungle.getTurn() === "b" ? 0 : 1;
        const player = this.game.players[playerIndex];

        //this.game.jungle.printBoard();
        const move = await player.ai.makeMove();
        if (this.game.jungle.isValidMove(move)) {
            this.game.jungle.move(move);
        } else {
            this.declareLoser(
                `Made an invalid move ('${move}').
                Valid moves: ${this.game.jungle.getAllMoves()}`,
                player,
            );
            this.declareWinner(
                "Opponent made an invalid move.",
                player.opponent,
            );
            //this.endGame();
        }
        //This is where we will check for game over conditions
        //check for game over reasons

        void this.runSideToMove();
    }

    // <<-- /Creer-Merge: public-methods -->>

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

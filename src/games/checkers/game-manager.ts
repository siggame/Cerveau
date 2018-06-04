// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, CheckersGame, CheckersGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
import { Player } from "./player";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Checkers Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class CheckersGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-Test-Checkers",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The number of players that must connect to play this game */
    public static get requiredNumberOfPlayers(): number {
        // <<-- Creer-Merge: required-number-of-players -->>
        // override this if you want to set a different number of players
        return super.requiredNumberOfPlayers;
        // <<-- /Creer-Merge: required-number-of-players -->>
    }

    /** The game this GameManager is managing */
    public readonly game!: CheckersGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: CheckersGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    // any additional public methods you need can be added here

    // <<-- /Creer-Merge: public-methods -->>

    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>
        // add logic here for before the current player's turn starts
        // <<-- /Creer-Merge: before-turn -->>
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to check if they won the game during their turn,
     * and do end-of-turn effects.
     */
    protected async afterTurn(): Promise<void> {
        // <<-- Creer-Merge: after-turn -->>
        // We need to check if the owner won because they just jumped all
        // the other checkers
        let winner: Player | undefined;
        for (const player of this.game.players) {
            if (player.checkers.length === 0) {
                winner = player.opponent;
                break;
            }
        }

        if (winner) {
            this.declareLoser("No checkers remaining", winner.opponent);
            this.declareWinner("All enemy checkers jumped!", winner);
            this.endGame();
            return;
        }
        // <<-- /Creer-Merge: after-turn -->>

        super.afterTurn(); // this actually makes their turn end
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryWinConditions(reason: string): void {
        // <<-- Creer-Merge: secondary-win-conditions -->>
        // Add logic here checking for the secondary win conditions
        // <<-- /Creer-Merge: secondary-win-conditions -->>

        this.makePlayerWinViaCoinFlip("Identical AIs played the game.");
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

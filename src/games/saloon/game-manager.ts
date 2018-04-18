// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, SaloonGame, SaloonGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export class SaloonGameManager extends BaseClasses.GameManager {
    /** The name of this game (used as an ID internally) */
    public static get gameName(): string {
        return "Saloon";
    }

    /** The number of players that must connect to play this game */
    public static get requiredNumberOfPlayers(): number {
        // <<-- Creer-Merge: required-number-of-players -->>
        // override this if you want to set a different number of players
        return super.requiredNumberOfPlayers;
        // <<-- /Creer-Merge: required-number-of-players -->>
    }

    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-##-Saloon",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: SaloonGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: SaloonGameObjectFactory;

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
    protected async nextTurn(): Promise<void> {
        // <<-- Creer-Merge: next-turn -->>
        // add logic here after the current player's turn starts
        // <<-- /Creer-Merge: next-turn -->>

        super.nextTurn(); // this actually makes their turn end
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryGameOver(reason: string): void {
        // <<-- Creer-Merge: secondary-game-over -->>
        // Add logic here checking for the secondary win conditions
        // <<-- /Creer-Merge: secondary-game-over -->>

        this.makePlayerWinViaCoinFlip("Identical AIs played the game.");
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

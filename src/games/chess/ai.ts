import { BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Represents the AI that a player controls. This acts as an interface to send
 * the AI orders to execute.
 */
export class AI extends BaseClasses.AI {
    // <<-- Creer-Merge: attributes -->>
    // If the AI needs additional attributes add them here.
    // NOTE: these are not set in client AIs.
    // <<-- /Creer-Merge: attributes -->>
    /**
     * This is called every time it is this AI.player's turn to make a move.
     *
     * @returns A string in Standard Algebraic Notation (SAN) for the move you
     * want to make. If the move is invalid or not properly formatted you will
     * lose the game.
     */
    public async makeMove(): Promise<string> {
        return this.executeOrder("makeMove") as Promise<string>;
    }

    // <<-- Creer-Merge: functions -->>
    // If the AI needs additional attributes add them here.
    /// NOTE: these will not be callable in client AIs.
    // <<-- /Creer-Merge: functions -->>
}

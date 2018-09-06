import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Checker } from "./checker";
import { CheckersGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { CheckersGameSettingsManager } from "./game-settings";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The simple version of American Checkers. An 8x8 board with 12 checkers on
 * each side that must move diagonally to the opposing side until kinged.
 */
export class CheckersGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: CheckersGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * The height of the board for the Y component of a checker.
     */
    public readonly boardHeight!: number;

    /**
     * The width of the board for X component of a checker.
     */
    public readonly boardWidth!: number;

    /**
     * The checker that last moved and must be moved because only one checker
     * can move during each players turn.
     */
    public checkerMoved?: Checker;

    /**
     * If the last checker that moved jumped, meaning it can move again.
     */
    public checkerMovedJumped!: boolean;

    /**
     * All the checkers currently in the game.
     */
    public checkers!: Checker[];

    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     */
    public currentPlayer!: Player;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     */
    public currentTurn!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: CheckersGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        // they are on top, and move down the board until kinged
        this.players[0].yDirection = 1;

        // they are on bottom, and move up the board until king
        this.players[1].yDirection = -1;

        // Initialize the Checkers
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if ((x + y) % 2 === 1) {
                    let owner: Player | undefined;

                    if (y < 3) { // then it is player 0's checker
                        owner = this.players[0];
                    }
                    else if (y > 4) { // then it is player 1's checker
                        owner = this.players[1];
                    } // else is the middle, which has no initial checker pieces

                    if (owner) {
                        const checker = this.manager.create.checker({
                            owner,
                            x,
                            y,
                            kinged: false,
                        });

                        this.checkers.push(checker);
                        owner.checkers.push(checker);
                    }
                }

            }
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Gets a Checker (if it exists) at a given (x, y).
     *
     * @param x - The x co-ordinate of the checker.
     * @param y - The y co-ordinate of the checker.
     * @returns A Checker if found, undefined otherwise.
     */
    public getCheckerAt(x: number, y: number): Checker | undefined {
        return this.checkers.find((c) => c.x === x && c.y === y);
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

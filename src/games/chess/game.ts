import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { ChessGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { ChessGameSettingsManager } from "./game-settings";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
import * as chessjs from "chess.js";
import { MutableRequired } from "~/utils";

/** A player that can be mutated BEFORE the game starts */
type MutablePlayer = MutableRequired<Player>;
// <<-- /Creer-Merge: imports -->>

/**
 * The traditional 8x8 chess board with pieces.
 */
export class ChessGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: ChessGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * Forsyth-Edwards Notation (fen), a notation that describes the game board
     * state.
     */
    public fen!: string;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The list of [known] moves that have occured in the game, in Standard
     * Algebriac Notation (SAN) format. The first element is the first move,
     * with the last being the most recent.
     */
    public history!: string[];

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    // <<-- Creer-Merge: attributes -->>

    /** The chess.js instance used to do all logic. */
    public readonly chess = new chessjs.Chess();

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: ChessGameSettingsManager,
        required: Readonly<IBaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        if (this.settings.fen) {
            this.chess.load(this.settings.fen);
        }
        else if (this.settings.pgn) {
            this.chess.load_pgn(this.settings.pgn);
        }

        (this.players[0] as MutablePlayer).color = "white";
        (this.players[1] as MutablePlayer).color = "black";

        this.fen = this.chess.fen();
        this.history.push(...this.chess.history());
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

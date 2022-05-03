import { BaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { JungleGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { JungleGameSettingsManager } from "./game-settings";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
import { Gameboard } from "./jungle-library";
import { Tile } from "./jungle-library";

import { Mutable } from "~/utils";
// <<-- /Creer-Merge: imports -->>
type MutablePlayer = Mutable<Player>;
/**
 * A 7x9 board game with pieces.
 */
export class JungleGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it. */
    public readonly manager!: JungleGameManager;

    /** The settings used to initialize the game, as set by players. */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * Forsyth-Edwards Notation (fen), a notation that describes the game board
     * state.
     */
    public fen!: string;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     */
    public gameObjects!: { [id: string]: GameObject };

    /**
     * The list of [known] moves that have occurred in the game, in a format.
     * The first element is the first move, with the last element being the most
     * recent.
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
    public gameboard: Tile[][] = []
    public readonly jungle = new Gameboard(this.gameboard, 'b', 0, 0, 7, 9)
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
        protected settingsManager: JungleGameSettingsManager,
        required: Readonly<BaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        (this.players[0] as MutablePlayer).color = "b";
        (this.players[1] as MutablePlayer).color = "r";

        this.fen = this.jungle.boardToFen();
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
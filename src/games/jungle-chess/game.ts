import { BaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { JungleChessGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { JungleChessGameSettingsManager } from "./game-settings";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A 7x9 board game with pieces, to win the game the players must make
 * successful captures of the enemy and reach the opponents den.
 */
export class JungleChessGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it. */
    public readonly manager!: JungleChessGameManager;

    /** The settings used to initialize the game, as set by players. */
    public readonly settings = Object.freeze(this.settingsManager.values);

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
     * The jungleFen is similar to the chess FEN, the order looks like this,
     * board (split into rows by '/'), whose turn it is, half move, and full
     * move.
     */
    public jungleFen!: string;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

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
        protected settingsManager: JungleChessGameSettingsManager,
        required: Readonly<BaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        (this.players[0] as MutablePlayer).color = "b";
        (this.players[1] as MutablePlayer).color = "r";
        
        this.jungleFen = this.manager.jungle.boardToFen()
        // <<-- Creer-Merge: constructor -->>
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

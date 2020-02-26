import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBaseCoreminerPlayer } from "./";
import { AI } from "./ai";
import { GameObject } from "./game-object";
import { Tile } from "./tile";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements IBaseCoreminerPlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * The Tile this Player's base is on.
     */
    public baseTile!: Tile;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * The Tiles this Player's hoppers are on.
     */
    public hopperTiles!: Tile[];

    /**
     * If the player lost the game or not.
     */
    public lost!: boolean;

    /**
     * The name of the player.
     */
    public readonly name!: string;

    /**
     * This player's opponent in the game.
     */
    public readonly opponent!: Player;

    /**
     * The reason why the player lost the game.
     */
    public reasonLost!: string;

    /**
     * The reason why the player won the game.
     */
    public reasonWon!: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * Every Unit owned by this Player.
     */
    public units!: Unit[];

    /**
     * The amount of value (victory points) this Player has gained.
     */
    public value!: number;

    /**
     * If the player won the game or not.
     */
    public won!: boolean;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Player is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        // never directly created by game developers
        args: Readonly<IBaseCoreminerPlayer>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
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

import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { SpidersGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { SpidersGameSettingsManager } from "./game-settings";
import { Nest } from "./nest";
import { Player } from "./player";
import { Web } from "./web";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * There's an infestation of enemy spiders challenging your queen broodmother
 * spider! Protect her and attack the other broodmother in this turn based,
 * node based, game.
 */
export class SpidersGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: SpidersGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

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
     * The speed at which Cutters work to do cut Webs.
     */
    public readonly cutSpeed!: number;

    /**
     * Constant used to calculate how many eggs BroodMothers get on their
     * owner's turns.
     */
    public readonly eggsScalar!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The starting strength for Webs.
     */
    public readonly initialWebStrength!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The maximum strength a web can be strengthened to.
     */
    public readonly maxWebStrength!: number;

    /**
     * The speed at which Spiderlings move on Webs.
     */
    public readonly movementSpeed!: number;

    /**
     * Every Nest in the game.
     */
    public nests!: Nest[];

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The speed at which Spitters work to spit new Webs.
     */
    public readonly spitSpeed!: number;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

    /**
     * How much web strength is added or removed from Webs when they are
     * weaved.
     */
    public readonly weavePower!: number;

    /**
     * The speed at which Weavers work to do strengthens and weakens on Webs.
     */
    public readonly weaveSpeed!: number;

    /**
     * Every Web in the game.
     */
    public webs!: Web[];

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
        protected settingsManager: SpidersGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

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

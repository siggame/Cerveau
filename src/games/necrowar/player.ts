import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBaseNecrowarPlayer, IPlayerSpawnUnitArgs, IPlayerSpawnWorkerArgs,
       } from "./";
import { AI } from "./ai";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { Tower } from "./tower";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements IBaseNecrowarPlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * The amount of gold this Player has.
     */
    public gold!: number;

    /**
     * The amount of health remaining for this player's Castle.
     */
    public health!: number;

    /**
     * The tiles that the home base is located on.
     */
    public homeBase!: Tile[];

    /**
     * If the player lost the game or not.
     */
    public lost!: boolean;

    /**
     * The amount of mana this player has.
     */
    public mana!: number;

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
     * All tiles that this player can build on and move workers on.
     */
    public side!: Tile[];

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * Every Tower owned by this player.
     */
    public towers!: Tower[];

    /**
     * Every Unit owned by this Player.
     */
    public units!: Unit[];

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
        args: Readonly<IBaseNecrowarPlayer>,
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

    /**
     * Invalidation function for spawnUnit. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param type - What type of Unit to create (ghoul, hound, abomination,
     * wraith, or horseman).
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawnUnit(
        player: Player,
        type: "ghoul" | "hound" | "abomination" | "wraith" | "horseman",
    ): void | string | IPlayerSpawnUnitArgs {
        // <<-- Creer-Merge: invalidate-spawnUnit -->>

        // Check all the arguments for spawnUnit here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-spawnUnit -->>
    }

    /**
     * Spawn a fighting Unit on this player's path spawn tile.
     *
     * @param player - The player that called this.
     * @param type - What type of Unit to create (ghoul, hound, abomination,
     * wraith, or horseman).
     * @returns True if Unit was created successfully, false otherwise.
     */
    protected async spawnUnit(
        player: Player,
        type: "ghoul" | "hound" | "abomination" | "wraith" | "horseman",
    ): Promise<boolean> {
        // <<-- Creer-Merge: spawnUnit -->>

        // Add logic here for spawnUnit.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: spawnUnit -->>
    }

    /**
     * Invalidation function for spawnWorker. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @param type - What type of Unit to create (worker, zombie, ghoul).
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawnWorker(
        player: Player,
        type: "worker" | "zombie" | "ghoul" | "hound" | "abomination" | "wraith" | "horseman",
    ): void | string | IPlayerSpawnWorkerArgs {
        // <<-- Creer-Merge: invalidate-spawnWorker -->>

        // Check all the arguments for spawnWorker here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-spawnWorker -->>
    }

    /**
     * Spawn a worker Unit on this player's worker spawn tile.
     *
     * @param player - The player that called this.
     * @param type - What type of Unit to create (worker, zombie, ghoul).
     * @returns True if Unit was created successfully, false otherwise.
     */
    protected async spawnWorker(
        player: Player,
        type: "worker" | "zombie" | "ghoul" | "hound" | "abomination" | "wraith" | "horseman",
    ): Promise<boolean> {
        // <<-- Creer-Merge: spawnWorker -->>

        // Add logic here for spawnWorker.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: spawnWorker -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBaseStumpedPlayer } from "./";
import { AI } from "./ai";
import { Beaver } from "./beaver";
import { GameObject } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements IBaseStumpedPlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * The list of Beavers owned by this Player.
     */
    public beavers!: Beaver[];

    /**
     * How many branches are required to build a lodge for this Player.
     */
    public branchesToBuildLodge!: number;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * A list of Tiles that contain lodges owned by this player.
     */
    public lodges!: Tile[];

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
        args: Readonly<IBaseStumpedPlayer>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Gets all the beavers alive for this player.
     *
     * @returns A new array with all the beavers owned by this player.
     */
    public getAliveBeavers(): Beaver[] {
        // Return all our beavers and filter out dead ones (health === 0)
        // concatenated with the newly spawned beavers
        // NOTE: only works when you call this on the current player
        // (as they spawn the new beavers)
        return this.beavers
            .concat(this.game.newBeavers)
            .filter((beaver) => beaver.health > 0);
    }

    /** Re-calculates this player's branchesToBuildLodge number */
    public calculateBranchesToBuildLodge(): void {
        this.branchesToBuildLodge = Math.ceil(
            this.game.lodgeCostConstant ** this.lodges.length,
        );
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

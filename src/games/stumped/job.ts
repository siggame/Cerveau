import { IBaseGameObjectRequiredData } from "~/core/game";
import { IJobProperties, IJobRecruitArgs } from "./";
import { Beaver } from "./beaver";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Information about a beaver's job.
 */
export class Job extends GameObject {
    /**
     * The number of actions this Job can make per turn.
     */
    public readonly actions!: number;

    /**
     * How many combined resources a beaver with this Job can hold at once.
     */
    public readonly carryLimit!: number;

    /**
     * Scalar for how many branches this Job harvests at once.
     */
    public readonly chopping!: number;

    /**
     * How much food this Job costs to recruit.
     */
    public readonly cost!: number;

    /**
     * The amount of damage this Job does per attack.
     */
    public readonly damage!: number;

    /**
     * How many turns a beaver attacked by this Job is distracted by.
     */
    public readonly distractionPower!: number;

    /**
     * The amount of starting health this Job has.
     */
    public readonly health!: number;

    /**
     * The number of moves this Job can make per turn.
     */
    public readonly moves!: number;

    /**
     * Scalar for how much food this Job harvests at once.
     */
    public readonly munching!: number;

    /**
     * The Job title.
     */
    public readonly title!: string;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Job is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: IJobProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        },
        required: IBaseGameObjectRequiredData,
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
     * Invalidation function for recruit. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile that is a lodge owned by you that you wish to
     * spawn the Beaver of this Job on.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateRecruit(
        player: Player,
        tile: Tile,
    ): void | string | IJobRecruitArgs {
        // <<-- Creer-Merge: invalidate-recruit -->>

        if (!player || player !== this.game.currentPlayer) {
            return `Not ${player}'s turn.`;
        }
        if (!tile) {
            return `${tile} is not a valid Tile.`;
        }
        if (tile.lodgeOwner !== player) {
            return `${tile} is not owned by ${player}.`;
        }
        if (tile.beaver) {
            return `There's already ${tile.beaver} at that lodge`;
        }
        if (player.getAliveBeavers().length >= this.game.freeBeaversCount && tile.food < this.cost) {
            return `${tile} does not have enough food available. (${tile.food}/${this.cost})`;
        }

        // <<-- /Creer-Merge: invalidate-recruit -->>
    }

    /**
     * Recruits a Beaver of this Job to a lodge
     *
     * @param player - The player that called this.
     * @param tile - The Tile that is a lodge owned by you that you wish to
     * spawn the Beaver of this Job on.
     * @returns The recruited Beaver if successful, undefined otherwise.
     */
    protected async recruit(player: Player, tile: Tile): Promise<Beaver> {
        // <<-- Creer-Merge: recruit -->>

        // if they have more beavers
        if (player.getAliveBeavers().length >= this.game.freeBeaversCount) {
            tile.food -= this.cost;
        }

        const beaver = this.manager.create.beaver({
            job: this,
            owner: player,
            tile,
            recruited: false,
        });

        return beaver;

        // <<-- /Creer-Merge: recruit -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

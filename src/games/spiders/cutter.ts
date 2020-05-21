import { BaseGameObjectRequiredData } from "~/core/game";
import { ICutterCutArgs, ICutterProperties, SpiderlingArgs } from "./";
import { Player } from "./player";
import { Spiderling } from "./spiderling";
import { Web } from "./web";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A Spiderling that can cut existing Webs.
 */
export class Cutter extends Spiderling {
    /**
     * The Web that this Cutter is trying to cut. Undefined if not cutting.
     */
    public cuttingWeb?: Web;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Cutter is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<
            SpiderlingArgs &
                ICutterProperties & {
                    // <<-- Creer-Merge: constructor-args -->>
                    // You can add more constructor args in here
                    // <<-- /Creer-Merge: constructor-args -->>
                }
        >,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /** Kills the Cutter */
    public kill(): void {
        super.kill();

        this.cuttingWeb = undefined;
    }

    /**
     * Finishes the actions of the Cutter
     *
     * @param forceFinish - true if forcing the finish prematurely
     * @returns True if the base logic can handle finishing
     */
    public finish(forceFinish?: boolean): boolean {
        if (this.finish(forceFinish)) {
            return true; // because they finished moving or something the base Spiderling class can handle
        }

        if (!forceFinish && this.cuttingWeb && !this.cuttingWeb.hasSnapped()) {
            this.cuttingWeb.snap();
        }

        this.cuttingWeb = undefined;

        return false;
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for cut. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param web - The web you want to Cut. Must be connected to the Nest this
     * Cutter is currently on.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateCut(
        player: Player,
        web: Web,
    ): void | string | ICutterCutArgs {
        // <<-- Creer-Merge: invalidate-cut -->>

        const invalid = super.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!this.nest) {
            return `${this} is not on a Nest.`;
        }

        if (!web.isConnectedTo(this.nest)) {
            return `${this} can only cut Webs connected to the Nest it is on (${this.nest}), ${web} is not.`;
        }

        // <<-- /Creer-Merge: invalidate-cut -->>
    }

    /**
     * Cuts a web, destroying it, and any Spiderlings on it.
     *
     * @param player - The player that called this.
     * @param web - The web you want to Cut. Must be connected to the Nest this
     * Cutter is currently on.
     * @returns True if the cut was successfully started, false otherwise.
     */
    protected async cut(player: Player, web: Web): Promise<boolean> {
        // <<-- Creer-Merge: cut -->>

        this.busy = "Cutting";
        this.cuttingWeb = web;

        // find coworkers
        for (const spider of web.getSideSpiders()) {
            if (
                spider !== this &&
                spider instanceof Cutter &&
                spider.cuttingWeb === web
            ) {
                this.coworkers.add(spider);
                this.numberOfCoworkers = this.coworkers.size;
                spider.coworkers.add(this);
                spider.numberOfCoworkers = spider.coworkers.size;
            }
        }

        // workRemaining =  5 * strength^2 / (cutterSpeed * sqrt(distance))
        this.workRemaining =
            (web.strength ** 2 * 5) /
            (this.game.cutSpeed * Math.sqrt(web.length));

        return true;

        // <<-- /Creer-Merge: cut -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

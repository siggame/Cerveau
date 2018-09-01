import { IBaseGameObjectRequiredData } from "~/core/game";
import { ISpitterProperties, SpiderlingArgs } from "./";
import { Nest } from "./nest";
import { Player } from "./player";
import { Spiderling } from "./spiderling";

// <<-- Creer-Merge: imports -->>
import { euclideanDistance } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * A Spiderling that creates and spits new Webs from the Nest it is on to
 * another Nest, connecting them.
 */
export class Spitter extends Spiderling {
    /**
     * The Nest that this Spitter is creating a Web to spit at, thus connecting
     * them. Undefined if not spitting.
     */
    public spittingWebToNest?: Nest;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Spitter is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: SpiderlingArgs & ISpitterProperties & {
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

    /** Kills the Spitter */
    public kill(): void {
        super.kill();

        this.spittingWebToNest = undefined;
    }

    /**
     * Finishes the actions of the Spitter
     *
     * @param forceFinish - true if forcing the finish prematurely
     * @returns True if the base finished, false otherwise
     */
    public finish(forceFinish?: boolean): boolean {
        if (super.finish(forceFinish)) {
            return true; // because they finished moving or something the base Spiderling class can handle
        }

        if (forceFinish) {
            this.spittingWebToNest = undefined;

            return false;
        }

        // if we got here they finished spitting
        const newWeb = this.manager.create.web({
            nestA: this.nest,
            nestB: this.spittingWebToNest,
        });

        // cancel spitters on the current nest to the destination
        for (const spider of newWeb.getSideSpiders()) {
            if (spider !== this && spider instanceof Spitter && (
                spider.spittingWebToNest === this.spittingWebToNest || spider.spittingWebToNest === this.nest
            )) {
                spider.finish(true);
            }
        }

        this.spittingWebToNest = undefined;

        return false;
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for spit. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param nest - The Nest you want to spit a Web to, thus connecting that
     * Nest and the one the Spitter is on.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateSpit(
        player: Player,
        nest: Nest,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-spit -->>

        const invalid = super.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!this.nest) {
            return `${this} is not on a Nest`;
        }

        if (nest === this.nest) {
            return `${this} cannot spit at the same Nest it is on (${nest}).`;
        }

        for (const web of nest.webs) {
            if (web.isConnectedTo(this.nest, nest)) {
                return `${this} cannot spit a new Web from ${this.nest} to ${nest} because ${web} already exists.`;
            }
        }

        // <<-- /Creer-Merge: invalidate-spit -->>
        return arguments;
    }

    /**
     * Creates and spits a new Web from the Nest the Spitter is on to another
     * Nest, connecting them.
     *
     * @param player - The player that called this.
     * @param nest - The Nest you want to spit a Web to, thus connecting that
     * Nest and the one the Spitter is on.
     * @returns True if the spit was successful, false otherwise.
     */
    protected async spit(player: Player, nest: Nest): Promise<boolean> {
        // <<-- Creer-Merge: spit -->>

        if (!this.nest) {
            throw new Error(`${this} is trying to spit without being on a Nest!`);
        }

        this.busy = "Spitting";
        this.spittingWebToNest = nest;

        // find coworkers
        const sideSpiders = this.nest.spiders.concat(nest.spiders);
        for (const spider of sideSpiders) {
            if (spider !== this
                && spider instanceof Spitter
                && (spider.spittingWebToNest === nest
                    || spider.spittingWebToNest === this.nest
                )
            ) {
                this.coworkers.add(spider);
                this.numberOfCoworkers = this.coworkers.size;
                spider.coworkers.add(this);
                spider.numberOfCoworkers = spider.coworkers.size;
            }
        }

        this.workRemaining = euclideanDistance(this.nest, nest) / this.game.spitSpeed;

        return true;

        // <<-- /Creer-Merge: spit -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { IWebProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Nest } from "./nest";
import { Spiderling } from "./spiderling";

// <<-- Creer-Merge: imports -->>
import { clamp, removeElementFrom } from "~/utils";
import { Cutter } from "./cutter";
import { Spider } from "./spider";
import { Weaver } from "./weaver";
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.Web have different args.
 */
export interface IWebConstructorArgs
extends IGameObjectConstructorArgs, IWebProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A connection (edge) to a Nest (node) in the game that Spiders can converge
 * on (regardless of owner). Spiders can travel in either direction on Webs.
 */
export class Web extends GameObject {
    /**
     * How long this Web is, i.e., the distance between its nestA and nestB.
     */
    public readonly length!: number;

    /**
     * How much weight this Web currently has on it, which is the sum of all
     * its Spiderlings weight.
     */
    public load!: number;

    /**
     * The first Nest this Web is connected to.
     */
    public nestA?: Nest;

    /**
     * The second Nest this Web is connected to.
     */
    public nestB?: Nest;

    /**
     * All the Spiderlings currently moving along this Web.
     */
    public spiderlings!: Spiderling[];

    /**
     * How much weight this Web can take before snapping and destroying itself
     * and all the Spiders on it.
     */
    public strength!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Web is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IWebConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Snaps the web, killing all spiders on it.
     */
    public snap(): void {
        if (this.hasSnapped()) {
            return; // as it's snapping more than once at the end of the turn
        }

        const spiderlings = this.spiderlings.slice();
        for (const spiderling of spiderlings) {
            spiderling.kill();
        }

        this.strength = -1; // has now snapped

        // if any Spiderlings are doing something with this web on nestA or B, tell them to finish
        const sideSpiders = this.getSideSpiders();
        for (const spider of sideSpiders) {
            if (
                (spider instanceof Cutter && spider.cuttingWeb === this) ||
                (spider instanceof Weaver && (
                    spider.strengtheningWeb === this ||
                    spider.weakeningWeb === this
                ))
            ) { // then they may be busy with this
                spider.finish(true);
            }
        }

        removeElementFrom(this,
            this.game.webs,
            this.nestA!.webs,
            this.nestB!.webs,
        );

        this.nestA = undefined;
        this.nestB = undefined;
    }

    /**
     * Returns if this Web has been snapped, and is thus no longer part of the game.
     *
     * @returns True if the web has been snapped (is dead), false otherwise
     */
    public hasSnapped(): boolean {
        return this.strength === -1;
    }

    /**
     * Checks if the Web is connected to some Nest
     *
     * @param nest - The nest to check if is connected to at nestA or nestB
     * @param otherNest - if passed then checks if nestA and nestB are the
     * otherNest and the previous arg nest (in either order).
     * @returns True if it is connected to that web, false otherwise,
     * undefined if nest is undefined.
     */
    public isConnectedTo(nest: Nest, otherNest?: Nest): boolean | undefined {
        if (!nest) {
            return undefined;
        }

        if (!otherNest) {
            return this.nestA === nest || this.nestB === nest;
        }

        return (this.nestA === nest && this.nestB === otherNest) ||
                (this.nestA === otherNest && this.nestB === nest);
    }

    /**
     * Gets the other nest, given one of its nests A or B
     *
     * @param nest - the nest to get the other one
     * @returns the other Nest that the passed in nest is not, undefined is
     * nest is not part of this Web.
     */
    public getOtherNest(nest: Nest): Nest | undefined {
        if (!this.isConnectedTo(nest)) {
            return undefined;
        }

        return this.nestA === nest ? this.nestB : this.nestA;
    }

    /**
     * Should be called whenever something changes on the web, so it needs to
     * re-calculate its current load and maybe snap.
     *
     * @param num - the load (weight) of a spiderling to add
     */
    public addLoad(num: number): void {
        this.load = Math.max(this.load + num, 0);

        if (this.load > this.strength) {
            this.snap();
        }
    }

    /**
     * Adds some number to this web's strength, and might snap it
     *
     * @param num - number to add to this Web's strength
     */
    public addStrength(num: number): void {
        this.strength = clamp(this.strength + num, 1, this.game.maxWebStrength);
        if (this.load >= this.strength) {
            this.snap();
        }
    }

    /**
     * Gets a new array containing all the spiders on this Web's nestA & B.
     *
     * @returns An array of Spiders in nest A and B (the sides of this web).
     */
    public getSideSpiders(): Spider[] {
        return this.nestA
            ? this.nestA.spiders.concat(this.nestB!.spiders)
            : [];
    }

    // <<-- /Creer-Merge: public-functions -->>
}

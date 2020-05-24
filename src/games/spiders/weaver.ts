import { BaseGameObjectRequiredData } from "~/core/game";
import {
    SpiderlingArgs,
    WeaverProperties,
    WeaverStrengthenArgs,
    WeaverWeakenArgs,
} from "./";
import { Player } from "./player";
import { Spiderling } from "./spiderling";
import { Web } from "./web";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A Spiderling that can alter existing Webs by weaving to add or remove silk
 * from the Webs, thus altering its strength.
 */
export class Weaver extends Spiderling {
    /**
     * The Web that this Weaver is strengthening. Undefined if not
     * strengthening.
     */
    public strengtheningWeb?: Web;

    /**
     * The Web that this Weaver is weakening. Undefined if not weakening.
     */
    public weakeningWeb?: Web;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Weaver is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<
            SpiderlingArgs & WeaverProperties & {
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

    /**
     * Kills the Weaver
     */
    public kill(): void {
        super.kill();

        this.strengtheningWeb = undefined;
        this.weakeningWeb = undefined;
    }

    /**
     * Finishes the actions of the Weaver
     *
     * @param forceFinish - true if forcing the finish prematurely
     * @returns True if they finished, false otherwise
     */
    public finish(forceFinish?: boolean): boolean {
        const weakening = this.busy === "Weakening";

        if (super.finish(forceFinish)) {
            return true; // because they finished moving or something the base Spiderling class can handle
        }

        const web = weakening ? this.weakeningWeb : this.strengtheningWeb;

        this.weakeningWeb = undefined;
        this.strengtheningWeb = undefined;

        if (!forceFinish && web && !web.hasSnapped()) {
            // Then they are finishing a weave, not being forced to finish
            // because the web snapped
            web.addStrength((weakening ? -1 : 1) * this.game.weavePower);
        }

        return false;
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for strengthen. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @param web - The web you want to strengthen. Must be connected to the
     * Nest this Weaver is currently on.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateStrengthen(
        player: Player,
        web: Web,
    ): void | string | WeaverStrengthenArgs {
        // <<-- Creer-Merge: invalidate-strengthen -->>

        const invalid = this.invalidateWeave(player, web, false);
        if (invalid) {
            return invalid;
        }

        // <<-- /Creer-Merge: invalidate-strengthen -->>
    }

    /**
     * Weaves more silk into an existing Web to strengthen it.
     *
     * @param player - The player that called this.
     * @param web - The web you want to strengthen. Must be connected to the
     * Nest this Weaver is currently on.
     * @returns True if the strengthen was successfully started, false
     * otherwise.
     */
    protected async strengthen(player: Player, web: Web): Promise<boolean> {
        // <<-- Creer-Merge: strengthen -->>

        return this.weave(player, web, "Strengthening");

        // <<-- /Creer-Merge: strengthen -->>
    }

    /**
     * Invalidation function for weaken. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param web - The web you want to weaken. Must be connected to the Nest
     * this Weaver is currently on.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateWeaken(
        player: Player,
        web: Web,
    ): void | string | WeaverWeakenArgs {
        // <<-- Creer-Merge: invalidate-weaken -->>

        const invalid = this.invalidateWeave(player, web, true);
        if (invalid) {
            return invalid;
        }

        // <<-- /Creer-Merge: invalidate-weaken -->>
    }

    /**
     * Weaves more silk into an existing Web to strengthen it.
     *
     * @param player - The player that called this.
     * @param web - The web you want to weaken. Must be connected to the Nest
     * this Weaver is currently on.
     * @returns True if the weaken was successfully started, false otherwise.
     */
    protected async weaken(player: Player, web: Web): Promise<boolean> {
        // <<-- Creer-Merge: weaken -->>

        return this.weave(player, web, "Weakening");

        // <<-- /Creer-Merge: weaken -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * A generic strengthen/weaken wrapper because both are so similar to try to invalidate it
     *
     * @param player - the player that called this.
     * @param web - The web you want to weaken. Must be connected to the Nest this Weaver is currently on.
     * @param weaveType - should be "Strengthening" or "Weakening" as appropriate
     * @returns True if the weaken was successfully started, false otherwise.
     */
    protected invalidateWeave(
        player: Player,
        web: Web,
        weakening: boolean,
    ): string | undefined {
        const invalid = super.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (this.nest !== web.nestA && this.nest !== web.nestB) {
            return `${this} can only strengthen Webs connected to ${this.nest}, ${web} is not.`;
        }

        if (weakening && web.strength <= 1) {
            return `${this} cannot weaken ${web} as its strength is at the minimum (1).`;
        }

        if (!weakening && web.strength >= this.game.maxWebStrength) {
            return `${this} cannot strengthen ${web} as its strength is at the maximum (${this.game.maxWebStrength}).`;
        }
    }

    /**
     * A generic strengthen/weaken wrapper because both are so similar
     *
     * @param player - the player that called this.
     * @param web - The web you want to weaken. Must be connected to the Nest this Weaver is currently on.
     * @param weaveType - should be "Strengthening" or "Weakening" as appropriate
     * @returns True if the weaken was successfully started, false otherwise.
     */
    private weave(
        player: Player,
        web: Web,
        weaveType: "Strengthening" | "Weakening",
    ): true {
        this.busy = weaveType;

        const webField =
            weaveType === "Strengthening"
                ? "strengtheningWeb"
                : "weakeningWeb";

        this[webField] = web;

        // workRemaining = distance * sqrt(strength) / speed
        this.workRemaining =
            (web.length * Math.sqrt(web.strength)) / this.game.weaveSpeed;

        // find coworkers
        for (const spider of web.getSideSpiders()) {
            if (
                spider !== this &&
                spider instanceof Weaver &&
                spider[webField] === web
            ) {
                this.coworkers.add(spider);
                this.numberOfCoworkers = this.coworkers.size;
                spider.coworkers.add(this);
                spider.numberOfCoworkers = spider.coworkers.size;
            }
        }

        return true;
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

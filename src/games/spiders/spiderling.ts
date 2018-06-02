import { IBaseGameObjectRequiredData } from "~/core/game";
import { ISpiderlingProperties } from "./";
import { Nest } from "./nest";
import { Player } from "./player";
import { ISpiderConstructorArgs, Spider } from "./spider";
import { Web } from "./web";

// <<-- Creer-Merge: imports -->>
import { removeElements } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.Spiderling have different args.
 */
export interface ISpiderlingConstructorArgs
extends ISpiderConstructorArgs, ISpiderlingProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A Spider spawned by the BroodMother.
 */
export class Spiderling extends Spider {
    /**
     * When empty string this Spiderling is not busy, and can act. Otherwise a
     * string representing what it is busy with, e.g. 'Moving', 'Attacking'.
     */
    public busy!: "" | "Moving" | "Attacking";

    /**
     * The Web this Spiderling is using to move. Null if it is not moving.
     */
    public movingOnWeb?: Web;

    /**
     * The Nest this Spiderling is moving to. Null if it is not moving.
     */
    public movingToNest?: Nest;

    /**
     * The number of Spiderlings busy with the same work this Spiderling is
     * doing, speeding up the task.
     */
    public numberOfCoworkers!: number;

    /**
     * How much work needs to be done for this Spiderling to finish being busy.
     * See docs for the Work forumla.
     */
    public workRemaining!: number;

    // <<-- Creer-Merge: attributes -->>

    public readonly coworkers = new Set<Spiderling>();

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Spiderling is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: ISpiderlingConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /** Kills the Spiderling */
    public kill(): void {
        super.kill();

        this.busy = "";
        this.workRemaining = -1;
        this.movingToNest = undefined;

        for (const coworker of this.coworkers) {
            coworker.coworkers.delete(this);
            coworker.numberOfCoworkers = coworker.coworkers.size;
        }

        this.coworkers.clear();
        this.numberOfCoworkers = 0;

        if (this.movingOnWeb) {
            removeElements(this.movingOnWeb.spiderlings, this);
            this.movingOnWeb = undefined;
        }
    }

    /**
     * Tells the Spiderling to finish what it is doing
     * (moving, cutting, spitting, weaving)
     *   Note: coworkers are finished in the Game class, not here
     *
     * @param forceFinish - True if the task was not finished by THIS spiderling
     * @returns true if finished, false otherwise
     */
    public finish(forceFinish: boolean = false): boolean {
        const finishing = this.busy;
        this.busy = "";
        this.workRemaining = 0;

        if (finishing === "Moving") {
            this.nest = this.movingToNest!;
            this.nest.spiders.push(this);
            removeElements(this.movingOnWeb!.spiderlings, this);
            this.movingOnWeb!.addLoad(-1);

            this.movingToNest = undefined;
            this.movingOnWeb = undefined;

            const enemyBroodMother = this.owner.opponent.broodMother;
            if (this.nest === enemyBroodMother.nest) {
                // then we reached the enemy's BroodMother! Kamikaze into her!
                enemyBroodMother.health = Math.max(enemyBroodMother.health - 1, 0);
                if (enemyBroodMother.health === 0) {
                    enemyBroodMother.isDead = true;
                }
                this.kill();
            }

            return true;
        }
        else if (finishing === "Attacking") {
            return true;
        }
        else { // they finished doing a different action (cut, weave, spit)
            this.coworkers.clear();
            this.numberOfCoworkers = this.coworkers.size;
            return false;
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for attack. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param spiderling - The Spiderling to attack.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateAttack(
        player: Player,
        spiderling: Spiderling,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-attack -->>

        const invalid = super.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!spiderling) {
            return `${this} cannot attack because '${spiderling}' is not a Spiderling.`;
        }

        if (spiderling.nest !== this.nest) {
            return `${this} cannot attack because '${spiderling}' is not on the same Nest as itself.`;
        }

        if (this === spiderling) {
            return `${this} cannot attack itself.`;
        }

        if (spiderling.isDead) {
            return `${this} cannot attack because'${spiderling}' is dead.`;
        }

        // <<-- /Creer-Merge: invalidate-attack -->>
        return arguments;
    }

    /**
     * Attacks another Spiderling
     *
     * @param player - The player that called this.
     * @param spiderling - The Spiderling to attack.
     * @returns True if the attack was successful, false otherwise.
     */
    protected async attack(
        player: Player,
        spiderling: Spiderling,
    ): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        // Rock Paper Scissors
        // Cutter > Weaver > Spitter > Cutter
        // Ties, both die

        if (this.gameObjectName === spiderling.gameObjectName) { // they are the same type, so
            this.kill();
            spiderling.kill();
        }

        if (
            (this.gameObjectName === "Cutter" && spiderling.gameObjectName === "Weaver") ||
            (this.gameObjectName === "Weaver" && spiderling.gameObjectName === "Spitter") ||
            (this.gameObjectName === "Spitter" && spiderling.gameObjectName === "Cutter")
        ) {
            spiderling.kill();
        }

        if (
            (spiderling.gameObjectName === "Cutter" && this.gameObjectName === "Weaver") ||
            (spiderling.gameObjectName === "Weaver" && this.gameObjectName === "Spitter") ||
            (spiderling.gameObjectName === "Spitter" && this.gameObjectName === "Cutter")
        ) {
            this.kill();
        }

        if (!this.isDead) {
            this.busy = "Attacking"; // so they cannot attack again
            this.workRemaining = 1;
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param web - The Web you want to move across to the other Nest.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateMove(player: Player, web: Web): string | IArguments {
        // <<-- Creer-Merge: invalidate-move -->>

        const invalid = super.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!web) {
            return `${web} is not a Web for ${this} to move on.`;
        }

        if (!this.nest) {
            return `${this} is not on a Nest to move from`;
        }

        if (!web.isConnectedTo(this.nest)) {
            return `${web} is not connected to ${this.nest} for ${this} to move on.`;
        }

        // <<-- /Creer-Merge: invalidate-move -->>
        return arguments;
    }

    /**
     * Starts moving the Spiderling across a Web to another Nest.
     *
     * @param player - The player that called this.
     * @param web - The Web you want to move across to the other Nest.
     * @returns True if the move was successful, false otherwise.
     */
    protected async move(player: Player, web: Web): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        this.busy = "Moving";
        this.workRemaining = Math.ceil(web.length / this.game.movementSpeed);

        this.movingOnWeb = web;
        this.movingToNest = web.getOtherNest(this.nest!);

        removeElements(this.nest!.spiders, this);
        this.nest = undefined;

        web.spiderlings.push(this);
        web.addLoad(1);

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Invalidates base logic for any spider to do anything.
     *
     * @param player - The player trying to command this Spiderling.
     * @returns A string if an invalid reason was found, undefined otherwise.
     */
    protected invalidate(player: Player): string | undefined {
        const invalid = super.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (this.busy) {
            return `${this} is already busy with '${this.busy}'.`;
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBottleProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface IBottleConstructorArgs
extends IGameObjectConstructorArgs, IBottleProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A bottle thrown by a bartender at a Tile.
 */
export class Bottle extends GameObject {
    /**
     * The Direction this Bottle is flying and will move to between turns, can
     * be 'North', 'East', 'South', or 'West'.
     */
    public readonly direction!: string;

    /**
     * The direction any Cowboys hit by this will move, can be 'North', 'East',
     * 'South', or 'West'.
     */
    public readonly drunkDirection!: string;

    /**
     * True if this Bottle has impacted and has been destroyed (removed from the
     * Game). False if still in the game flying through the saloon.
     */
    public isDestroyed!: boolean;

    /**
     * The Tile this bottle is currently flying over.
     */
    public tile?: Tile;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Bottle is created.
     *
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: IBottleConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>

        this.game.bottles.push(this);
        this.tile.bottle = this;

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: functions -->>

    /**
     * Advances the bottle (moves it) 1 tile in between turns
     * Note: game calls this so game will update this bottle's tile
     */
    public advance(): void {
        // We won't update this.tile.bottle to us, as the game will handle
        // bottle <--> bottle collisions after all bottles have advanced

        this.tile.bottle = null; // we moved off it
        this.tile = this.tile.getNeighbor(this.direction);

        if (!this.tile.isPathableToBottles()) {
            this.break(); // hit something
        }
    }

    /**
     * Breaks (destroys) this bottle, getting cowboys drunk in the process
     *
     * @param cowboy The cowboy to break on
     */
    public break(cowboy): void {
        if (this.isDestroyed) {
            return; // we're already broken :(
        }

        cowboy = cowboy || this.tile.cowboy;

        if (cowboy) {
            cowboy.getDrunk(this.drunkDirection);
        }

        this.isDestroyed = true;
        this.tile.bottle = null;
        this.tile = null;
        this.game.bottles.removeElement(this);
    }

    // <<-- /Creer-Merge: functions -->>
}

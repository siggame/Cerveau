import { IBaseGameObjectRequiredData } from "~/core/game";
import { IFurnishingProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface IFurnishingConstructorArgs
extends IGameObjectConstructorArgs, IFurnishingProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * An furnishing in the Saloon that must be pathed around, or destroyed.
 */
export class Furnishing extends GameObject {
    /**
     * How much health this Furnishing currently has.
     */
    public health!: number;

    /**
     * If this Furnishing has been destroyed, and has been removed from the
     * game.
     */
    public isDestroyed!: boolean;

    /**
     * True if this Furnishing is a piano and can be played, False otherwise.
     */
    public readonly isPiano!: boolean;

    /**
     * If this is a piano and a Cowboy is playing it this turn.
     */
    public isPlaying!: boolean;

    /**
     * The Tile that this Furnishing is located on.
     */
    public tile?: Tile;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Furnishing is created.
     *
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: IFurnishingConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>

        this.game.furnishings.push(this);
        this.health = this.isPiano ? 48 : 16;
        this.tile!.furnishing = this;

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: functions -->>

    /**
     * Damages this Furnishing for some amount of damage, setting isDestroyed if it dies
     *
     * @param damage How much damage to do to this.
     */
    public damage(damage: number): void {
        this.health = Math.max(0, this.health - damage);

        if (this.health === 0) { // it has been destroyed
            this.isDestroyed = true;
            this.isPlaying = false;
            this.tile!.furnishing = undefined;
            this.tile = undefined;

            if (this.isPiano) {
                // then we may have been the last piano getting destroyed, so check to end the game
                this.manager.checkForWinner();
            }
        }
    }

    // <<-- /Creer-Merge: functions -->>
}
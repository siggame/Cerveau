import { IBaseGameObjectRequiredData } from "~/core/game";
import { ISpawnerProperties } from "./";
import { GameObject } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * What type of resource this is ('food' or 'branches').
 */
export type SpawnerType = "food" | "branches";

/**
 * A resource spawner that generates branches or food.
 */
export class Spawner extends GameObject {
    /**
     * True if this Spawner has been harvested this turn, and it will not heal
     * at the end of the turn, false otherwise.
     */
    public hasBeenHarvested!: boolean;

    /**
     * How much health this Spawner has, which is used to calculate how much of
     * its resource can be harvested.
     */
    public health!: number;

    /**
     * The Tile this Spawner is on.
     */
    public readonly tile: Tile;

    /**
     * What type of resource this is ('food' or 'branches').
     */
    public readonly type!: "food" | "branches";

    // <<-- Creer-Merge: attributes -->>

    /** The cooldown on being harvested */
    public harvestCooldown = 0;

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Spawner is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: ISpawnerProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            tile: Tile;
            type: "branches" | "food";
            // <<-- /Creer-Merge: constructor-args -->>
        },
        required: IBaseGameObjectRequiredData,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.health = 1;
        this.tile = args.tile;
        this.tile.spawner = this;
        this.game.spawner.push(this);

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

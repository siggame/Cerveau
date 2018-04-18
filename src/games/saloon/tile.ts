import { IBaseGameObjectRequiredData } from "~/core/game";
import { ITileProperties } from "./";
import { Bottle } from "./bottle";
import { Cowboy } from "./cowboy";
import { Furnishing } from "./furnishing";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { YoungGun } from "./young-gun";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface ITileConstructorArgs
extends IGameObjectConstructorArgs, ITileProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A Tile in the game that makes up the 2D map grid.
 */
export class Tile extends GameObject {
    /**
     * The beer Bottle currently flying over this Tile, null otherwise.
     */
    public bottle?: Bottle;

    /**
     * The Cowboy that is on this Tile, null otherwise.
     */
    public cowboy?: Cowboy;

    /**
     * The furnishing that is on this Tile, null otherwise.
     */
    public furnishing?: Furnishing;

    /**
     * If this Tile is pathable, but has a hazard that damages Cowboys that path
     * through it.
     */
    public hasHazard!: boolean;

    /**
     * If this Tile is a balcony of the Saloon that YoungGuns walk around on,
     * and can never be pathed through by Cowboys.
     */
    public isBalcony!: boolean;

    /**
     * The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the
     * map.
     */
    public readonly tileEast?: Tile;

    /**
     * The Tile to the 'North' of this one (x, y-1). Null if out of bounds of
     * the map.
     */
    public readonly tileNorth?: Tile;

    /**
     * The Tile to the 'South' of this one (x, y+1). Null if out of bounds of
     * the map.
     */
    public readonly tileSouth?: Tile;

    /**
     * The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the
     * map.
     */
    public readonly tileWest?: Tile;

    /**
     * The x (horizontal) position of this Tile.
     */
    public readonly x!: number;

    /**
     * The y (vertical) position of this Tile.
     */
    public readonly y!: number;

    /**
     * The YoungGun on this tile, null otherwise.
     */
    public youngGun?: YoungGun;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Tile is created.
     *
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: ITileConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { IStructureProperties } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The type of Structure this is ('shelter', 'monument', 'wall', 'road',
 * 'neutral').
 */
export type StructureType = "neutral" | "shelter" | "monument" | "wall" | "road";

/**
 * A structure on a Tile.
 */
export class Structure extends GameObject {
    /**
     * The range of this Structure's effect. For example, a radius of 1 means
     * this Structure affects a 3x3 square centered on this Structure.
     */
    public readonly effectRadius!: number;

    /**
     * The number of materials in this Structure. Once this number reaches 0,
     * this Structure is destroyed.
     */
    public materials!: number;

    /**
     * The owner of this Structure if any, otherwise undefined.
     */
    public owner?: Player;

    /**
     * The Tile this Structure is on.
     */
    public tile?: Tile;

    /**
     * The type of Structure this is ('shelter', 'monument', 'wall', 'road',
     * 'neutral').
     */
    public readonly type!: "neutral" | "shelter" | "monument" | "wall" | "road";

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Structure is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<IStructureProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            /** The Tile this Structure will be placed on. */
            tile: Tile;
            /** The type of structure it is. */
            type: StructureType;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.tile = args.tile;

        this.materials = this.game.getStructureCost(this.type);
        this.effectRadius = this.game.getStructureRange(this.type);

        this.game.newStructures.push(this);
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

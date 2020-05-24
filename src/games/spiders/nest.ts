import { BaseGameObjectRequiredData } from "~/core/game";
import { NestConstructorArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Spider } from "./spider";
import { Web } from "./web";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A location (node) connected to other Nests via Webs (edges) in the game that
 * Spiders can converge on, regardless of owner.
 */
export class Nest extends GameObject {
    /**
     * The Player that 'controls' this Nest as they have the most Spiders on
     * this nest.
     */
    public controllingPlayer?: Player;

    /**
     * All the Spiders currently located on this Nest.
     */
    public spiders!: Spider[];

    /**
     * Webs that connect to this Nest.
     */
    public webs!: Web[];

    /**
     * The X coordinate of the Nest. Used for distance calculations.
     */
    public readonly x!: number;

    /**
     * The Y coordinate of the Nest. Used for distance calculations.
     */
    public readonly y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Nest is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: NestConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
                // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
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

import { BaseGameObjectRequiredData } from "~/core/game";
import { ProjectileConstructorArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Tracks any projectiles moving through space.
 */
export class Projectile extends GameObject {
    /**
     * The remaining health of the projectile.
     */
    public energy!: number;

    /**
     * The amount of remaining distance the projectile can move.
     */
    public fuel!: number;

    /**
     * The Player that owns and can control this Projectile.
     */
    public owner?: Player;

    /**
     * The unit that is being attacked by this projectile.
     */
    public target: Unit;

    /**
     * The x value this projectile is on.
     */
    public x!: number;

    /**
     * The y value this projectile is on.
     */
    public y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Projectile is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: ProjectileConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
            /** The target. */
            target: Unit;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.target = args.target;
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

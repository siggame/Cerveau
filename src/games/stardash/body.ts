import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBodyProperties, IBodySpawnArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * The type of celestial body it is.
 */
export type BodyBodyType = "planet" | "asteroid" | "sun";

/**
 * The type of material the celestial body has.
 */
export type BodyMaterialType = "none" | "genarium" | "rarium" | "legendarium" | "Mythicite";

/**
 * A celestial body located within the game.
 */
export class Body extends GameObject {
    /**
     * The amount of material the object has.
     */
    public amount!: number;

    /**
     * The type of celestial body it is.
     */
    public readonly bodyType!: "planet" | "asteroid" | "sun";

    /**
     * The type of material the celestial body has.
     */
    public readonly materialType!: "none" | "genarium" | "rarium" | "legendarium" | "Mythicite";

    /**
     * The radius of the circle that this body takes up.
     */
    public radius!: number;

    /**
     * The x value this celestial body is on.
     */
    public x!: number;

    /**
     * The y value this celestial body is on.
     */
    public y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Body is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<IBodyProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
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

    /**
     * Invalidation function for spawn. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param x - The x value of the spawned unit.
     * @param y - The y value of the spawned unit.
     * @param title - The job title of the unit being spawned.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawn(
        player: Player,
        x: number,
        y: number,
        title: string,
    ): void | string | IBodySpawnArgs {
        // <<-- Creer-Merge: invalidate-spawn -->>
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        //if (this.owner !== player || this.owner === undefined) {
        //    return `${this} isn't owned by you.`;
        //}
        // Make sure the unit hasn't acted.
        if (this.bodyType == "planet") {
            return `${this} isn't a planet, so you can't make ships here`;
        }

        // Check all the arguments for spawn here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-spawn -->>
    }

    /**
     * Spawn a unit on some value of this celestial body.
     *
     * @param player - The player that called this.
     * @param x - The x value of the spawned unit.
     * @param y - The y value of the spawned unit.
     * @param title - The job title of the unit being spawned.
     * @returns True if successfully taken, false otherwise.
     */
    protected async spawn(
        player: Player,
        x: number,
        y: number,
        title: string,
    ): Promise<boolean> {
        // <<-- Creer-Merge: spawn -->>

        // Add logic here for spawn.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: spawn -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

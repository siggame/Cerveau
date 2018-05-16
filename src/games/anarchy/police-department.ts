import { IBaseGameObjectRequiredData } from "~/core/game";
import { IPoliceDepartmentProperties } from "./";
import { Building, IBuildingConstructorArgs } from "./building";
import { Player } from "./player";
import { Warehouse } from "./warehouse";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.PoliceDepartment have different args.
 */
export interface IPoliceDepartmentConstructorArgs
extends IBuildingConstructorArgs, IPoliceDepartmentProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * Used to keep cities under control and raid Warehouses.
 */
export class PoliceDepartment extends Building {
    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a PoliceDepartment is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IPoliceDepartmentConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

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
     * Invalidation function for raid. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param warehouse - The warehouse you want to raid.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateRaid(
        player: Player,
        warehouse: Warehouse,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-raid -->>

        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        // <<-- /Creer-Merge: invalidate-raid -->>
        return arguments;
    }

    /**
     * Bribe the police to raid a Warehouse, dealing damage equal based on the
     * Warehouse's current exposure, and then resetting it to 0.
     *
     * @param player - The player that called this.
     * @param warehouse - The warehouse you want to raid.
     * @returns The amount of damage dealt to the warehouse, or -1 if there was
     * an error.
     */
    protected async raid(
        player: Player,
        warehouse: Warehouse,
    ): Promise<number> {
        // <<-- Creer-Merge: raid -->>

        const oldHealth = warehouse.health;
        warehouse.health = Math.max(warehouse.health - warehouse.exposure, 0);
        warehouse.exposure = 0;

        this.bribed = true;
        player.bribesRemaining--;

        return oldHealth - warehouse.health;

        // <<-- /Creer-Merge: raid -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

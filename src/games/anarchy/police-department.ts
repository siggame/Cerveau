import { IBaseGameObjectRequiredData } from "~/core/game";
import { IPoliceDepartmentProperties } from "./";
import { Building, IBuildingConstructorArgs } from "./building";
import { Player } from "./player";
import { Warehouse } from "./warehouse";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

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
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
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

    /**
     * Invalidation function for raid. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player The player that called this.
     * @param warehouse The warehouse you want to raid.
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

        if (!warehouse) {
            return `${warehouse} not a valid Warehouse to for ${this} to raid.`;
        }

        // <<-- /Creer-Merge: invalidate-raid -->>
        return arguments;
    }

    /**
     * Bribe the police to raid a Warehouse, dealing damage equal based on the
     * Warehouse's current exposure, and then resetting it to 0.
     *
     * @param player The player that called this.
     * @param warehouse The warehouse you want to raid.
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

    // <<-- Creer-Merge: functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: functions -->>
}

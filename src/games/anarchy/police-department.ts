import { IBaseGameObjectRequiredData } from "~/core/game";
import { Building, IBuildingConstructorArgs, Player, Warehouse } from "./";
import { IPoliceDepartmentProperties } from "./game-interfaces";

// <<-- Creer-Merge: requires -->>
// <<-- /Creer-Merge: requires -->>

export interface IPoliceDepartmentConstructorArgs extends IPoliceDepartmentProperties, IBuildingConstructorArgs {
    // <<-- Creer-Merge: constructor-args -->>

    // You can add more constructor args in here!

    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * PoliceDepartment: Used to keep cities under control and raid Warehouses.
 */
export class PoliceDepartment extends Building {
    /**
     * Initializes PoliceDepartments.
     * @param data - the data
     * @param required omg
     */
    constructor(data: IPoliceDepartmentConstructorArgs, required: IBaseGameObjectRequiredData) {
        super(data, required);

        // <<-- Creer-Merge: init -->>

        // put any initialization logic here. the base variables should be set from 'data' above
        // NOTE: no players are connected (nor created) at this point. For that logic use 'begin()'

        // <<-- /Creer-Merge: init -->>
    }

    /**
     * Invalidation function for raid
     * Try to find a reason why the passed in parameters are invalid,
     * and return a human readable string telling them why it is invalid
     *
     * @param player - the player that called this.
     * @param warehouse - The warehouse you want to raid.
     * @returns  a string that is the invalid reason, if the arguments are invalid.
     * Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateRaid(player: Player, warehouse?: Warehouse): string | IArguments {
        // <<-- Creer-Merge: invalidateRaid -->>
        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!warehouse) {
            return `${warehouse} not a valid Warehouse to for ${this} to raid.`;
        }
        // <<-- /Creer-Merge: invalidateRaid -->>
        return arguments;
    }

    /**
     * Bribe the police to raid a Warehouse, dealing damage equal based on the
     * Warehouse's current exposure, and then resetting it to 0.
     * @param player - the player that called this.
     * @param warehouse - The warehouse you want to raid.
     * @returns The amount of damage dealt to the warehouse, or -1 if there was an error.
     */
    protected raid(player: Player, warehouse: Warehouse): number {
        // <<-- Creer-Merge: raid -->>

        const oldHealth = warehouse.health;
        warehouse.health = Math.max(warehouse.health - warehouse.exposure, 0);
        warehouse.exposure = 0;

        this.bribed = true;
        player.bribesRemaining--;

        return oldHealth - warehouse.health;

        // <<-- /Creer-Merge: raid -->>
    }

    // <<-- Creer-Merge: added-functions -->>

    // You can add additional functions here. These functions will not be directly callable by client AIs

    // <<-- /Creer-Merge: added-functions -->>

}

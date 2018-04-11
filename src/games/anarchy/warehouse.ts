// Warehouse: A typical abandoned warehouse... that anarchists hang out in and can be bribed to burn down Buildings.

import { IBaseGameObjectRequiredData } from "~/core/game";
import { Building, IBuildingConstructorArgs, Player } from "./";
import { IWarehouseProperties } from "./game-interfaces";

// <<-- Creer-Merge: requires -->>
import { clamp, manhattanDistance } from "~/utils";
// <<-- /Creer-Merge: requires -->>

export interface IWarehouseConstructorArgs extends IWarehouseProperties, IBuildingConstructorArgs {
    // <<-- Creer-Merge: constructor-args -->>

    // You can add more constructor args in here!

    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A typical abandoned warehouse... that anarchists hang out in and can be
 * bribed to burn down Buildings.
 */
export class Warehouse extends Building {
    /**
     * How exposed the anarchists in this warehouse are to
     * PoliceDepartments. Raises when bribed to ignite buildings, and drops
     * each turn if not bribed.
     */
    public exposure!: number;

    /**
     * The amount of fire added to buildings when bribed to ignite a
     * building. Headquarters add more fire than normal Warehouses.
     */
    public readonly fireAdded!: number;

    /**
     * Initializes Warehouses.
     *
     * @param data a simple mapping passed in to the constructor with
     * whatever you sent with it. GameSettings are in here by key/value as well.
     * @param required ha
     */
    constructor(data: IWarehouseConstructorArgs, required: IBaseGameObjectRequiredData) {
        super(data, required);

        // <<-- Creer-Merge: init -->>

        this.fireAdded = 3;

        if (this.isHeadquarters) {
            this.fireAdded = this.game.maxFire;
        }

        // <<-- /Creer-Merge: init -->>
    }

    /**
     * Invalidation function for ignite
     * Try to find a reason why the passed in parameters are invalid, and
     * return a human readable string telling them why it is invalid
     *
     * @param player - the player that called this.
     * @param building - The Building you want to light on fire.
     * @returns a string that is the invalid reason, if the
     * arguments are invalid. Otherwise undefined (nothing) if the inputs are
     * valid.
     */
    protected invalidateIgnite(player: Player, building?: Building): string | IArguments {
        // <<-- Creer-Merge: invalidateIgnite -->>

        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!building) {
            return `${building} not a valid building to for ${this} to ignite.`;
        }

        if (building.isHeadquarters) {
            return `${building} Headquarters cannot be targeted by Warehouses directly.`;
        }

        // <<-- /Creer-Merge: invalidateIgnite -->>
        return arguments;
    }

    /**
     * Bribes the Warehouse to light a Building on fire. This adds this
     * building's fireAdded to their fire, and then this building's exposure is
     * increased based on the Manhattan distance between the two buildings.
     * @param player - the player that called this.
     * @param building - The Building you want to light on fire.
     * @returns The exposure added to this Building's exposure. -1 is returned if there was an error.
     */
    protected ignite(player: Player, building: Building): number {
        // <<-- Creer-Merge: ignite -->>

        building.fire = clamp(building.fire + this.fireAdded, 0, this.game.maxFire);
        const exposure = manhattanDistance(this, building);
        this.exposure += exposure; // Do we want a cap on this?

        this.bribed = true;
        player.bribesRemaining--;

        return exposure;

        // <<-- /Creer-Merge: ignite -->>
    }

    // <<-- Creer-Merge: added-functions -->>
    // <<-- /Creer-Merge: added-functions -->>

}

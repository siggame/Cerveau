// FireDepartment: Can put out fires completely.
import { IBaseGameObjectRequiredData } from "src/core/game";
import { Building, IBuildingConstructorArgs, Player } from "./";
import { IFireDepartmentProperties } from "./game-interfaces";

// <<-- Creer-Merge: imports -->>
import { clamp } from "src/utils";
// <<-- /Creer-Merge: imports -->>

export interface IFireDepartmentConstructorArgs extends IFireDepartmentProperties, IBuildingConstructorArgs {
    // <<-- Creer-Merge: constructor-args -->>

    // You can add more constructor args in here!

    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * Can put out fires completely.
 */
export class FireDepartment extends Building {
    /**
     * The amount of fire removed from a building when bribed to extinguish a building.
     */
    public fireExtinguished: number = 0;

    /**
     * Initializes FireDepartments.
     * @param data initial values for the FireDepartment (automatically applied)
     * @param required d
     */
    constructor(data: IFireDepartmentConstructorArgs, required: IBaseGameObjectRequiredData) {
        super(data, required);

        // <<-- Creer-Merge: init -->>

        this.fireExtinguished = 2;

        // <<-- /Creer-Merge: init -->>
    }

    /**
     * Invalidation function for extinguish
     * Try to find a reason why the passed in parameters are invalid, and return
     * a human readable string telling them why it is invalid if it is invalid
     * @param {Player} player - the player invoking this function
     * @param {Object} building da building the extinguish
     * @returns {string|undefined} a string that is the invalid reason,
     * if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateExtinguish(player: Player, building: Building): string | IArguments {
        // <<-- Creer-Merge: invalidateExtinguish -->>
        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!building || !(building instanceof Building) || building.isHeadquarters) {
            return `${building} not a valid building to for ${this} to extinguish.`;
        }

        // <<-- /Creer-Merge: invalidateExtinguish -->>
        return arguments;
    }

    /**
     * Bribes this FireDepartment to extinguish the some of the fire in a building.
     * @param {Player} player - the player that called this.
     * @param {Building} building - The Building you want to extinguish.
     * @returns {boolean} True if the bribe worked, false otherwise.
     */
    protected async extinguish(player: Player, building: Building): Promise<boolean> {
        // <<-- Creer-Merge: extinguish -->>

        building.fire = clamp(building.fire - this.fireExtinguished, 0, this.game.maxFire);

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: extinguish -->>
    }

    // <<-- Creer-Merge: added-functions -->>
    // You can add additional functions here. These functions will not be directly callable by client AIs
    // <<-- /Creer-Merge: added-functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { IFireDepartmentProperties } from "./";
import { Building, IBuildingConstructorArgs } from "./building";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
import { clamp } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.FireDepartment have different args.
 */
export interface IFireDepartmentConstructorArgs
extends IBuildingConstructorArgs, IFireDepartmentProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * Can put out fires completely.
 */
export class FireDepartment extends Building {
    /**
     * The amount of fire removed from a building when bribed to extinguish a
     * building.
     */
    public readonly fireExtinguished!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a FireDepartment is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IFireDepartmentConstructorArgs,
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
     * Invalidation function for extinguish. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param building - The Building you want to extinguish.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateExtinguish(
        player: Player,
        building: Building,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-extinguish -->>

        const invalid = this.invalidateBribe(player);
        if (invalid) {
            return invalid;
        }

        if (!building || !(building instanceof Building) || building.isHeadquarters) {
            return `${building} not a valid building to for ${this} to extinguish.`;
        }

        // <<-- /Creer-Merge: invalidate-extinguish -->>
        return arguments;
    }

    /**
     * Bribes this FireDepartment to extinguish the some of the fire in a
     * building.
     *
     * @param player - The player that called this.
     * @param building - The Building you want to extinguish.
     * @returns True if the bribe worked, false otherwise.
     */
    protected async extinguish(
        player: Player,
        building: Building,
    ): Promise<boolean> {
        // <<-- Creer-Merge: extinguish -->>

        building.fire = clamp(
            building.fire - this.fireExtinguished,
            0,
            this.game.maxFire,
        );

        this.bribed = true;
        player.bribesRemaining--;

        return true;

        // <<-- /Creer-Merge: extinguish -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

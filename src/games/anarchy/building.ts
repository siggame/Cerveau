import { BaseGameObjectRequiredData } from "~/core/game";
import { BuildingConstructorArgs } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A basic building. It does nothing besides burn down. Other Buildings inherit
 * from this class.
 */
export class Building extends GameObject {
    /**
     * When true this building has already been bribed this turn and cannot be
     * bribed again this turn.
     */
    public bribed!: boolean;

    /**
     * The Building directly to the east of this building, or undefined if not
     * present.
     */
    public readonly buildingEast?: Building;

    /**
     * The Building directly to the north of this building, or undefined if not
     * present.
     */
    public readonly buildingNorth?: Building;

    /**
     * The Building directly to the south of this building, or undefined if not
     * present.
     */
    public readonly buildingSouth?: Building;

    /**
     * The Building directly to the west of this building, or undefined if not
     * present.
     */
    public readonly buildingWest?: Building;

    /**
     * How much fire is currently burning the building, and thus how much
     * damage it will take at the end of its owner's turn. 0 means no fire.
     */
    public fire!: number;

    /**
     * How much health this building currently has. When this reaches 0
     * the Building has been burned down.
     */
    public health!: number;

    /**
     * True if this is the Headquarters of the owning player, false otherwise.
     * Burning this down wins the game for the other Player.
     */
    public readonly isHeadquarters!: boolean;

    /**
     * The player that owns this building. If it burns down (health reaches 0)
     * that player gets an additional bribe(s).
     */
    public owner: Player;

    /**
     * The location of the Building along the x-axis.
     */
    public readonly x!: number;

    /**
     * The location of the Building along the y-axis.
     */
    public readonly y!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Building is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: BuildingConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
            /** The owner of this building. */
            owner: Player;
            /** The x location of this building. */
            x: number;
            /** The y location of this building. */
            y: number;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>

        this.owner = args.owner;
        this.health = this.game.settings.buildingStartingHealth;

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Gets the neighbor in a direction of the building.
     *
     * @param direction - The direction to get at.
     * @returns The building in that direction, if there is one.
     */
    public getNeighbor(direction: string): Building | undefined {
        switch (direction.toLowerCase()) {
            case "north":
                return this.buildingNorth;
            case "east":
                return this.buildingEast;
            case "south":
                return this.buildingSouth;
            case "west":
                return this.buildingWest;
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Tries to find a reason why the bribe (action) is invalid.
     *
     * @param player - The player trying to bribe this building.
     * @returns A game logic error is returned if the bribe is NOT valid, undefined otherwise.
     */
    protected invalidateBribe(player: Player): string | undefined {
        if (player !== this.owner) {
            return `${this} is not owned by ${player} and cannot be bribed.`;
        }

        if (player.bribesRemaining <= 0) {
            return `${player} has no bribes left to bribe ${this} with.`;
        }

        if (this.health <= 0) {
            return `${this} has been burned down and cannot be bribed.`;
        }

        if (this.bribed) {
            return `${this} has already been bribed this turn and cannot be bribed again.`;
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

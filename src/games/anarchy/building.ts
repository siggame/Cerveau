import { IBaseGameObjectRequiredData } from "src/core/game";
import { GameObject, Player } from "./";
import { IBuildingProperties } from "./game-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be required here safely between cree runs
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
    public bribed: boolean;

    /**
     * The Building directly to the east of this building, or null if not
     * present.
     */
    public readonly buildingEast?: Building;

    /**
     * The Building directly to the north of this building, or null if not
     * present.
     *
     * @type {Building}
     */
    public readonly buildingNorth?: Building;

    /**
     * The Building directly to the south of this building, or null if not
     * present.
     */
    public readonly buildingSouth?: Building;

    /**
     * The Building directly to the west of this building, or null if not
     * present.
     */
    public readonly buildingWest?: Building;

    /**
     * How much fire is currently burning the building, and thus how much damage
     * it will take at the end of its owner's turn. 0 means no fire.
     */
    public fire: number;

    /**
     * How much health this building currently has. When this reaches 0 the
     * Building has been burned down.
     */
    public health: number;

    /**
     * True if this is the Headquarters of the owning player, false otherwise.
     * Burning this down wins the game for the other Player.
     */
    public readonly isHeadquarters: boolean;

    /**
     * The player that owns this building. If it burns down (health reaches 0)
     * that player gets an additional bribe(s).
     */
    public readonly owner: Player;

    /**
     * The location of the Building along the x-axis.
     */
    public x: number;

    /**
     * The location of the Building along the y-axis.
     */
    public y: number;

    // <<-- Creer-Merge: added-properties -->>
    public maxHealth: number = 100;
    // <<== /Creer-Merge: added-properties -->>

    /**
     * Initializes Buildings
     * @param data the initial data for this Building. These values are already
     *             hooked up in the super method for you for this classes
     *             member properties.
     */
    constructor(data: IBuildingProperties, required: IBaseGameObjectRequiredData) {
        super(data, required);

        // <<-- Creer-Merge: init -->>

        this.health = this.maxHealth;

        if (this.isHeadquarters) {
            this.isHeadquarters = true;
            this.owner.headquarters = this;
            this.health *= this.game.settings.headquartersHealthScalar;
            (this as any).fireAdded = this.game.maxFire;
        }

        // <<-- /Creer-Merge: init -->>
    }

    // <<-- Creer-Merge: added-functions -->>

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

    /**
     * Tries to find a reason why the bribe (action) is invalid
     *
     * @param player - the player trying to bribe this building
     * @returns a game logic error is returned if the bribe is NOT valid, undefined otherwise
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

    // <<-- /Creer-Merge: added-functions -->>
}

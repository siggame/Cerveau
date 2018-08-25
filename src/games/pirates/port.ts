import { IBaseGameObjectRequiredData } from "~/core/game";
import { IPortProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.Port have different args.
 */
export interface IPortConstructorArgs
extends IGameObjectConstructorArgs, IPortProperties {
    // <<-- Creer-Merge: constructor-args -->>
    tile: Tile;
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A port on a Tile.
 */
export class Port extends GameObject {
    /**
     * For players, how much more gold this Port can spend this turn. For
     * merchants, how much gold this Port has accumulated (it will spawn a ship
     * when the Port can afford one).
     */
    public gold!: number;

    /**
     * (Merchants only) How much gold was invested into this Port. Investment
     * determines the strength and value of the next ship.
     */
    public investment!: number;

    /**
     * The owner of this Port, or null if owned by merchants.
     */
    public owner?: Player;

    /**
     * The Tile this Port is on.
     */
    public readonly tile: Tile;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Port is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IPortConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        this.tile = data.tile;
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
     * @param type - What type of Unit to create ('crew' or 'ship').
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateSpawn(
        player: Player,
        type: "crew" | "ship",
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-spawn -->>

        if (this.owner !== player) {
            return `${this} isn't yer port.`;
        }

        if (player !== this.game.currentPlayer) {
            return `Avast, it ain't yer turn, ${player}.`;
        }

        if (type === "crew") { // Crew
            if (player.gold < this.game.crewCost) {
                return `Ye don't have enough gold to spawn a crew at ${this}.`;
            }

            if (this.gold < this.game.crewCost) {
                return `${this} can't spend enough gold to spawn a crew this turn! Ye gotta wait til next turn.`;
            }
        }
        else { // Ships
            if (player.gold < this.game.shipCost) {
                return `Ye don't have enough gold to spawn a ship at ${this}.`;
            }

            if (this.gold < this.game.shipCost) {
                return `${this} can't spend enough gold to spawn a ship this turn! Ye gotta wait til next turn.`;
            }

            if (this.tile.unit && this.tile.unit.shipHealth > 0) {
                return `Blimey! There isn't enough space in ${this} to spawn a ship.`;
            }
        }

        // <<-- /Creer-Merge: invalidate-spawn -->>
        return arguments;
    }

    /**
     * Spawn a Unit on this port.
     *
     * @param player - The player that called this.
     * @param type - What type of Unit to create ('crew' or 'ship').
     * @returns True if Unit was created successfully, false otherwise.
     */
    protected async spawn(
        player: Player,
        type: "crew" | "ship",
    ): Promise<boolean> {
        // <<-- Creer-Merge: spawn -->>

        // Make sure there's a unit on this tile
        if (!this.tile.unit) {
            this.tile.unit = this.game.manager.create.unit({
                tile: this.tile,
            });

            this.game.manager.newUnits.push(this.tile.unit);
        }

        if (type === "crew")		{
            this.tile.unit.crew++;
            this.tile.unit.crewHealth += this.game.crewHealth;
            this.tile.unit.acted = true;
            this.tile.unit.moves = 0;
            this.tile.unit.owner = player;
            player.gold -= this.game.crewCost;
            this.gold -= this.game.crewCost;
        }
        else {
            this.tile.unit.shipHealth = this.game.shipHealth;
            this.tile.unit.acted = true;
            this.tile.unit.moves = 0;
            player.gold -= this.game.shipCost;
            this.gold -= this.game.shipCost;
        }

        return true;

        // <<-- /Creer-Merge: spawn -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

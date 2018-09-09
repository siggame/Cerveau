import { IBaseGameObjectRequiredData } from "~/core/game";
import { IUnitActArgs, IUnitAttackArgs, IUnitDropArgs, IUnitMoveArgs,
         IUnitPickupArgs, IUnitProperties } from "./";
import { GameObject } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A unit in the game. May be a manager, intern, or physicist.
 */
export class Unit extends GameObject {
    /**
     * Whether this Unit has performed its action this turn.
     */
    public acted!: boolean;

    /**
     * The amount of blueium carried by this unit.
     */
    public blueium!: number;

    /**
     * The amount of blueium ore carried by this unit.
     */
    public blueiumOre!: number;

    /**
     * If a ship is on this Tile, how much health it has remaining.
     */
    public health!: number;

    /**
     * The Job this Unit does.
     */
    public readonly job: Job;

    /**
     * How many more times this Unit may move this turn.
     */
    public moves!: number;

    /**
     * The Player that owns and can control this Unit.
     */
    public owner?: Player;

    /**
     * The amount of redium carried by this unit.
     */
    public redium!: number;

    /**
     * The amount of redium ore carried by this unit.
     */
    public rediumOre!: number;

    /**
     * Duration of stun immunity.
     */
    public stunImmune!: number;

    /**
     * Duration the unit is stunned.
     */
    public stunTime!: number;

    /**
     * The Tile this Unit is on.
     */
    public tile?: Tile;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Unit is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: IUnitProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        },
        required: IBaseGameObjectRequiredData,
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
     * Invalidation function for act. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit acts on.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateAct(
        player: Player,
        tile: Tile,
    ): void | string | IUnitActArgs {
        // <<-- Creer-Merge: invalidate-act -->>

        // Check all the arguments for act here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-act -->>
    }

    /**
     * Makes the unit do something to a machine on its tile. Interns sabotage,
     * physicists run, and managers protect.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit acts on.
     * @returns True if successfully acted, false otherwise.
     */
    protected async act(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: act -->>

        // Add logic here for act.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: act -->>
    }

    /**
     * Invalidation function for attack. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateAttack(
        player: Player,
        tile: Tile,
    ): void | string | IUnitAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>

        // Check all the arguments for attack here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-attack -->>
    }

    /**
     * Attacks a unit on a ajacent tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        // Add logic here for attack.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for drop. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param amount - The amount of materials to dropped. Amounts <= 0 will
     * drop all the materials on the Unit.
     * @param material - The material the unit will drop.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateDrop(
        player: Player,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): void | string | IUnitDropArgs {
        // <<-- Creer-Merge: invalidate-drop -->>

        // Check all the arguments for drop here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-drop -->>
    }

    /**
     * Drops material at the units feat
     *
     * @param player - The player that called this.
     * @param amount - The amount of materials to dropped. Amounts <= 0 will
     * drop all the materials on the Unit.
     * @param material - The material the unit will drop.
     * @returns True if successfully deposited, false otherwise.
     */
    protected async drop(
        player: Player,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): Promise<boolean> {
        // <<-- Creer-Merge: drop -->>

        // Add logic here for drop.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: drop -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Unit should move to.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMove(
        player: Player,
        tile: Tile,
    ): void | string | IUnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>

        // makes sure the player is the owner of the unit.
        if (!player || this.owner !== player) {
            return `${this} is not your unit ${player}.`;
        }
        // Make it is that players turn.
        if (player !== this.game.currentPlayer) {
            return `It is not your turn ${player}!`;
        }
        // make sure the unit is on the planet.... wait...
        if (!tile) {
            return `${this}, gratz. You proved flat earthers correct.`;
        }
        // Make sure the unit is alive.
        if (this.health <= 0) {
            return `${this} is fuel.`;
        }
        // make sure the unit can function
        if (this.stunTime > 0) {
            return `${this} is stunned and cannot move.`;
        }
        // Make sure there isn't a wall there. Ouch.
        if (tile.isWall) {
            return `${this} cannot walk through solid matter. Yet....`;
        }
        // Make sure the unit still has moves
        if (this.moves <= 0) {
            return `${this} cannot move anymore this turn`;
        }
        // Make sure there isn't a machine there.
        if (tile.machine) {
            return `${this} cannot walk over machines. They are expensive`;
        }
        // Make sure the unit hasn't acted.
        if (this.acted) {
            return `${this} has already acted this turn. Or not enough coffee`;
        }
        // Make sure the tile isn't ocuppied.
        if (tile.unit) {
            return `${this} cannot walk through units. Yet.....`;
        }
        // make sure the tile is next to the unit
        if (this.tile !== tile.tileEast && this.tile !== tile.tileSouth && this.tile
           !== tile.tileWest && this.tile !== tile.tileNorth) {
            return `${this} can only travel to an adjacent tile.`;
        }

        // Check all the arguments for move here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-move -->>
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Unit should move to.
     * @returns True if it moved, false otherwise.
     */
    protected async move(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        // Add logic here for move.
        tile.unit = undefined;
        this.tile = tile;
        tile.unit = this;

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for pickup. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param amount - The amount of materials to pick up. Amounts <= 0 will
     * pick up all the materials on the Unit.
     * @param material - The material the unit will pick up.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidatePickup(
        player: Player,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): void | string | IUnitPickupArgs {
        // <<-- Creer-Merge: invalidate-pickup -->>

        // Check all the arguments for pickup here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-pickup -->>
    }

    /**
     * Picks up material at the units feat
     *
     * @param player - The player that called this.
     * @param amount - The amount of materials to pick up. Amounts <= 0 will
     * pick up all the materials on the Unit.
     * @param material - The material the unit will pick up.
     * @returns True if successfully deposited, false otherwise.
     */
    protected async pickup(
        player: Player,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): Promise<boolean> {
        // <<-- Creer-Merge: pickup -->>

        // Add logic here for pickup.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: pickup -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

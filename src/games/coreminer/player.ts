import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBaseCoreminerPlayer, IPlayerBuyArgs, IPlayerTransferArgs } from "./";
import { AI } from "./ai";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements IBaseCoreminerPlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * The Tile this Player's base is on.
     */
    public baseTile!: Tile;

    /**
     * The bombs stored in the Player's supply.
     */
    public bombs!: number;

    /**
     * The building material stored in the Player's supply.
     */
    public buildingMaterials!: number;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * The dirt stored in the Player's supply.
     */
    public dirt!: number;

    /**
     * The Tiles this Player's hoppers are on.
     */
    public hopperTiles!: Tile[];

    /**
     * If the player lost the game or not.
     */
    public lost!: boolean;

    /**
     * The amount of money this Player currently has.
     */
    public money!: number;

    /**
     * The name of the player.
     */
    public readonly name!: string;

    /**
     * This player's opponent in the game.
     */
    public readonly opponent!: Player;

    /**
     * The reason why the player lost the game.
     */
    public reasonLost!: string;

    /**
     * The reason why the player won the game.
     */
    public reasonWon!: string;

    /**
     * The Tiles on this Player's side of the map.
     */
    public side!: Tile[];

    /**
     * The Tiles this Player may spawn Units on.
     */
    public spawnTiles!: Tile[];

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * Every Unit owned by this Player.
     */
    public units!: Unit[];

    /**
     * The amount of value (victory points) this Player has gained.
     */
    public value!: number;

    /**
     * If the player won the game or not.
     */
    public won!: boolean;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Player is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        // never directly created by game developers
        args: Readonly<IBaseCoreminerPlayer>,
        required: Readonly<IBaseGameObjectRequiredData>,
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
     * Invalidation function for buy. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param resource - The type of resource to buy.
     * @param amount - The amount of resource to buy.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateBuy(
        player: Player,
        resource: "dirt" | "bomb" | "buildingMaterials",
        amount: number,
    ): void | string | IPlayerBuyArgs {
        // <<-- Creer-Merge: invalidate-buy -->>

        // Check all the arguments for buy here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-buy -->>
    }

    /**
     * Purchases a resource and adds it to the Player's supply.
     *
     * @param player - The player that called this.
     * @param resource - The type of resource to buy.
     * @param amount - The amount of resource to buy.
     * @returns True if successfully purchased, false otherwise.
     */
    protected async buy(
        player: Player,
        resource: "dirt" | "bomb" | "buildingMaterials",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: buy -->>

        // Add logic here for buy.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: buy -->>
    }

    /**
     * Invalidation function for transfer. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param unit - The Unit to transfer materials to.
     * @param resource - The type of resource to transfer.
     * @param amount - The amount of resource to transfer.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateTransfer(
        player: Player,
        unit: Unit,
        resource: "dirt" | "bomb" | "buildingMaterials",
        amount: number,
    ): void | string | IPlayerTransferArgs {
        // <<-- Creer-Merge: invalidate-transfer -->>

        // Check all the arguments for transfer here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-transfer -->>
    }

    /**
     * Transfers a resource from the Player's supply to a Unit.
     *
     * @param player - The player that called this.
     * @param unit - The Unit to transfer materials to.
     * @param resource - The type of resource to transfer.
     * @param amount - The amount of resource to transfer.
     * @returns True if successfully transfered, false otherwise.
     */
    protected async transfer(
        player: Player,
        unit: Unit,
        resource: "dirt" | "bomb" | "buildingMaterials",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: transfer -->>

        // Add logic here for transfer.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: transfer -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { BaseGameObjectRequiredData } from "~/core/game";
import {
    MinerBuildArgs,
    MinerBuyArgs,
    MinerConstructorArgs,
    MinerDumpArgs,
    MinerMineArgs,
    MinerMoveArgs,
    MinerTransferArgs,
    MinerUpgradeArgs,
} from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { Upgrade } from "./upgrade";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A Miner in the game.
 */
export class Miner extends GameObject {
    /**
     * The number of bombs being carried by this Miner.
     */
    public bombs!: number;

    /**
     * The number of building materials carried by this Miner.
     */
    public buildingMaterials!: number;

    /**
     * The amount of dirt carried by this Miner.
     */
    public dirt!: number;

    /**
     * The remaining health of this Miner.
     */
    public health!: number;

    /**
     * The remaining mining power this Miner has this turn.
     */
    public miningPower!: number;

    /**
     * The number of moves this Miner has left this turn.
     */
    public moves!: number;

    /**
     * The amount of ore carried by this Miner.
     */
    public ore!: number;

    /**
     * The Player that owns and can control this Miner.
     */
    public readonly owner: Player;

    /**
     * The Tile this Miner is on.
     */
    public tile?: Tile;

    /**
     * The Upgrade this Miner is on.
     */
    public upgrade: Upgrade;

    /**
     * The upgrade level of this Miner. Starts at 0.
     */
    public upgradeLevel!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Miner is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: MinerConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
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
     * Invalidation function for build. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to build on.
     * @param type - The structure to build (support, ladder, or shield).
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateBuild(
        player: Player,
        tile: Tile,
        type: "support" | "ladder" | "shield",
    ): void | string | MinerBuildArgs {
        // <<-- Creer-Merge: invalidate-build -->>

        // Check all the arguments for build here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-build -->>
    }

    /**
     * Builds a support, shield, or ladder on Miner's Tile, or an
     * adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to build on.
     * @param type - The structure to build (support, ladder, or shield).
     * @returns True if successfully built, False otherwise.
     */
    protected async build(
        player: Player,
        tile: Tile,
        type: "support" | "ladder" | "shield",
    ): Promise<boolean> {
        // <<-- Creer-Merge: build -->>

        // Add logic here for build.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: build -->>
    }

    /**
     * Invalidation function for buy. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param resource - The type of resource to buy.
     * @param amount - The amount of resource to buy. Amounts <= 0 will buy all
     * of that material Player can.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateBuy(
        player: Player,
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): void | string | MinerBuyArgs {
        // <<-- Creer-Merge: invalidate-buy -->>

        // Check all the arguments for buy here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-buy -->>
    }

    /**
     * Purchase a resource from the Player's base or hopper.
     *
     * @param player - The player that called this.
     * @param resource - The type of resource to buy.
     * @param amount - The amount of resource to buy. Amounts <= 0 will buy all
     * of that material Player can.
     * @returns True if successfully purchased, false otherwise.
     */
    protected async buy(
        player: Player,
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: buy -->>

        // Add logic here for buy.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: buy -->>
    }

    /**
     * Invalidation function for dump. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile the materials will be dumped on.
     * @param material - The material the Miner will drop. 'dirt', 'ore',
     * or 'bomb'.
     * @param amount - The number of materials to drop. Amounts <= 0 will drop
     * all of the material.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateDump(
        player: Player,
        tile: Tile,
        material: "dirt" | "ore" | "bomb",
        amount: number,
    ): void | string | MinerDumpArgs {
        // <<-- Creer-Merge: invalidate-dump -->>

        // Check all the arguments for dump here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-dump -->>
    }

    /**
     * Dumps materials from cargo to an adjacent Tile. If the Tile is a base or
     * a hopper Tile, materials are sold instead of placed.
     *
     * @param player - The player that called this.
     * @param tile - The Tile the materials will be dumped on.
     * @param material - The material the Miner will drop. 'dirt', 'ore',
     * or 'bomb'.
     * @param amount - The number of materials to drop. Amounts <= 0 will drop
     * all of the material.
     * @returns True if successfully dumped materials, false otherwise.
     */
    protected async dump(
        player: Player,
        tile: Tile,
        material: "dirt" | "ore" | "bomb",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: dump -->>

        // Add logic here for dump.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: dump -->>
    }

    /**
     * Invalidation function for mine. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile the materials will be mined from.
     * @param amount - The amount of material to mine up. Amounts <= 0 will mine
     * all the materials that the Miner can.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMine(
        player: Player,
        tile: Tile,
        amount: number,
    ): void | string | MinerMineArgs {
        // <<-- Creer-Merge: invalidate-mine -->>

        // Check all the arguments for mine here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-mine -->>
    }

    /**
     * Mines the Tile the Miner is on or an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile the materials will be mined from.
     * @param amount - The amount of material to mine up. Amounts <= 0 will mine
     * all the materials that the Miner can.
     * @returns True if successfully mined, false otherwise.
     */
    protected async mine(
        player: Player,
        tile: Tile,
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: mine -->>

        // Add logic here for mine.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: mine -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Miner should move to.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMove(
        player: Player,
        tile: Tile,
    ): void | string | MinerMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>

        // Check all the arguments for move here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-move -->>
    }

    /**
     * Moves this Miner from its current Tile to an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Miner should move to.
     * @returns True if it moved, false otherwise.
     */
    protected async move(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        // Add logic here for move.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for transfer. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param miner - The Miner to transfer materials to.
     * @param resource - The type of resource to transfer.
     * @param amount - The amount of resource to transfer. Amounts <= 0 will
     * transfer all the of the material.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateTransfer(
        player: Player,
        miner: Miner,
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): void | string | MinerTransferArgs {
        // <<-- Creer-Merge: invalidate-transfer -->>

        // Check all the arguments for transfer here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-transfer -->>
    }

    /**
     * Transfers a resource from the one Miner to another.
     *
     * @param player - The player that called this.
     * @param miner - The Miner to transfer materials to.
     * @param resource - The type of resource to transfer.
     * @param amount - The amount of resource to transfer. Amounts <= 0 will
     * transfer all the of the material.
     * @returns True if successfully transferred, false otherwise.
     */
    protected async transfer(
        player: Player,
        miner: Miner,
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: transfer -->>

        // Add logic here for transfer.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: transfer -->>
    }

    /**
     * Invalidation function for upgrade. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateUpgrade(
        player: Player,
    ): void | string | MinerUpgradeArgs {
        // <<-- Creer-Merge: invalidate-upgrade -->>

        // Check all the arguments for upgrade here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        return undefined; // means nothing could be found that was ivalid.

        // <<-- /Creer-Merge: invalidate-upgrade -->>
    }

    /**
     * Upgrade this Miner by installing an upgrade module.
     *
     * @param player - The player that called this.
     * @returns True if successfully upgraded, False otherwise.
     */
    protected async upgrade(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: upgrade -->>

        // Add logic here for upgrade.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: upgrade -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

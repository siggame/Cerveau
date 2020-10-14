import { BaseGameObjectRequiredData } from "~/core/game";
import {
    UnitBuildArgs,
    UnitBuyArgs,
    UnitConstructorArgs,
    UnitDumpArgs,
    UnitMineArgs,
    UnitMoveArgs,
    UnitTransferArgs,
    UnitUpgradeArgs,
} from "./";
import { GameObject } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A unit in the game.
 */
export class Unit extends GameObject {
    /**
     * The number of bombs being carried by this Unit. (0 to job cargo
     * capacity - other carried materials).
     */
    public bombs!: number;

    /**
     * The number of building materials carried by this Unit. (0 to job cargo
     * capacity - other carried materials).
     */
    public buildingMaterials!: number;

    /**
     * The amount of dirt carried by this Unit. (0 to job cargo capacity -
     * other carried materials).
     */
    public dirt!: number;

    /**
     * The remaining health of a Unit.
     */
    public health!: number;

    /**
     * The Job this Unit has.
     */
    public readonly job: Job;

    /**
     * The maximum amount of cargo this Unit can carry.
     */
    public maxCargoCapacity!: number;

    /**
     * The maximum health of this Unit.
     */
    public maxHealth!: number;

    /**
     * The maximum mining power of this Unit.
     */
    public maxMiningPower!: number;

    /**
     * The maximum moves this Unit can have.
     */
    public maxMoves!: number;

    /**
     * The remaining mining power this Unit has this turn.
     */
    public miningPower!: number;

    /**
     * The number of moves this Unit has left this turn.
     */
    public moves!: number;

    /**
     * The amount of ore carried by this Unit. (0 to job capacity - other
     * carried materials).
     */
    public ore!: number;

    /**
     * The Player that owns and can control this Unit.
     */
    public owner?: Player;

    /**
     * The Tile this Unit is on.
     */
    public tile?: Tile;

    /**
     * The upgrade level of this unit. Starts at 0.
     */
    public upgradeLevel!: number;

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
        args: UnitConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
            /** The job this unit will have. */
            job: Job;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.job = args.job;
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
    ): void | string | UnitBuildArgs {
        // <<-- Creer-Merge: invalidate-build -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        if (!this.tile) {
            return `${this} is lost in the mines! Their tile is undefined!`;
        }

        if (tile.isBase) {
            return "You cannot build on a base.";
        }

        if (tile.isHopper) {
            return "You cannot build on a hopper.";
        }

        if (tile.isSupport) {
            return "You cannot build on a support.";
        }

        if (tile.isLadder) {
            return "You cannot build on a ladder.";
        }

        if (tile.dirt + tile.ore > 0 && type !== "shield") {
            return "You cannot build on a filled tile unless you are building a shield!";
        }

        // Tile must be adjacent to or the same as the tile the unit is on
        if (
            tile !== this.tile.tileEast &&
            tile !== this.tile.tileNorth &&
            tile !== this.tile.tileWest &&
            tile !== this.tile.tileSouth &&
            tile !== this.tile
        ) {
            return "That tile is too far away to be built on.";
        }
        switch (type) {
            case "support":
                if (this.buildingMaterials < this.game.supportCost) {
                    return "You don't have enough building materials to build a support";
                }
                break;

            case "ladder":
                if (this.buildingMaterials < this.game.ladderCost) {
                    return "You don't have enough building materials to build a ladder";
                }
                break;

            case "shield":
                if (tile.dirt + tile.ore === 0) {
                    return "You can't build a shield on an empty tile.";
                }

                if (tile.shielding === 2) {
                    return "This tile already has full shield.";
                }

                if (this.buildingMaterials < this.game.shieldCost) {
                    return "You don't have enough building materials to build a shield";
                }
                break;

            default:
                return "Invalid build type.";
        }
        // <<-- /Creer-Merge: invalidate-build -->>
    }

    /**
     * Builds a support, shield, or ladder on Unit's tile, or an adjacent Tile.
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
        switch (type) {
            case "support":
                tile.isSupport = true;
                this.buildingMaterials -= this.game.supportCost;
                break;

            case "ladder":
                tile.isLadder = true;
                this.buildingMaterials -= this.game.ladderCost;
                break;

            case "shield":
                tile.shielding = 2;
                this.buildingMaterials -= this.game.shieldCost;
        }

        return true;
        // <<-- /Creer-Merge: build -->>
    }

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
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): void | string | UnitBuyArgs {
        // <<-- Creer-Merge: invalidate-buy -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        if (!this.tile) {
            return `This unit is not on a tile!`;
        }

        if (
            this.tile.getNeighbors().indexOf(player.baseTile) === -1 &&
            this.tile !== player.baseTile
        ) {
            if (
                !(this.tile.tileNorth && this.tile.tileNorth.isHopper) &&
                !(this.tile.tileEast && this.tile.tileEast.isHopper) &&
                !(this.tile.tileSouth && this.tile.tileSouth.isHopper) &&
                !(this.tile.tileWest && this.tile.tileWest.isHopper) &&
                !this.tile.isHopper
            ) {
                return `A unit cannot buy unless it is near an allied hopper or base!`;
            }
        }

        const cargo =
            this.ore +
            this.dirt +
            this.bombs * this.game.bombSize +
            this.buildingMaterials;

        switch (resource) {
            case "dirt":
                if (player.money < amount * this.game.dirtPrice) {
                    return `You cannot afford that much dirt!`;
                }
                if (cargo + amount > this.maxCargoCapacity) {
                    return `This unit cannot hold that much extra dirt!`;
                }
                break;
            case "ore":
                return `You're supposed to be mining ore, not buying it! Get back to work!`;
                break;
            case "bomb":
                if (player.money < amount * this.game.bombPrice) {
                    return `You cannot afford that many bombs!`;
                }
                if (
                    cargo + amount * this.game.bombSize >
                    this.maxCargoCapacity
                ) {
                    return `This unit cannot hold that many bombs!`;
                }
                break;
            case "buildingMaterials":
                if (player.money < amount * this.game.buildingMaterialPrice) {
                    return `You cannot afford that many building materials!`;
                }
                if (cargo + amount > this.maxCargoCapacity) {
                    return `This unit cannot hold that many additional building materials!`;
                }
        }
        // <<-- /Creer-Merge: invalidate-buy -->>
    }

    /**
     * Purchase a resource from the player's base or hopper.
     *
     * @param player - The player that called this.
     * @param resource - The type of resource to buy.
     * @param amount - The amount of resource to buy.
     * @returns True if successfully purchased, false otherwise.
     */
    protected async buy(
        player: Player,
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: buy -->>
        switch (resource) {
            case "dirt":
                this.dirt += amount;
                player.money -= amount * this.game.dirtPrice;
                break;
            case "ore":
                return false;
            case "bomb":
                this.bombs += amount;
                player.money -= amount * this.game.bombPrice;
                break;
            case "buildingMaterials":
                this.buildingMaterials += amount;
                player.money -= amount * this.game.buildingMaterialPrice;
        }

        return true;
        // <<-- /Creer-Merge: buy -->>
    }

    /**
     * Invalidation function for dump. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the materials will be dumped on.
     * @param material - The material the Unit will drop. 'dirt', 'ore',
     * or 'bomb'.
     * @param amount - The number of materials to drop. Amounts <= 0 will drop
     * all the materials.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateDump(
        player: Player,
        tile: Tile,
        material: "dirt" | "ore" | "bomb",
        amount: number,
    ): void | string | UnitDumpArgs {
        // <<-- Creer-Merge: invalidate-dump -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        // Make sure the unit is on a tile.
        if (!this.tile) {
            return `${this} is not on a tile.`;
        }

        // Checks if the tile is a ladder
        if (
            this.tile.isLadder &&
            (material === `dirt` || material === `ore`)
        ) {
            return `You cannot dump dirt or ore onto a ladder tile.`;
        }

        // Checks if the tile is a support
        if (
            this.tile.isSupport &&
            (material === `dirt` || material === `ore`)
        ) {
            return `You cannot dump dirt or ore onto a support tile.`;
        }

        // Checks if tile is falling.
        if (
            this.tile.isFalling &&
            (material === `dirt` || material === `ore`)
        ) {
            return `This tile is falling, you have bigger things to worry about than dumping dirt or ore.`;
        }

        // Checks if you have negative dirt.
        if (material === `dirt` && this.dirt < 0) {
            return "You have negative dirt. This should not happen. Contact devs.";
        }

        // Checks if you have dirt to dump
        if (material === `dirt` && this.dirt === 0) {
            return "You have no dirt to dump.";
        }

        if (material === `bomb` && this.bombs === 0) {
            return `You have no bombs to dump.`;
        }

        if (material === `bomb` && this.bombs < 0) {
            return `You have negative bombs. This should not happen. Contact devs.`;
        }

        if (material === `ore` && this.ore === 0) {
            return `You have no ore to dump.`;
        }

        if (material === `ore` && this.ore < 0) {
            return `You have negative ore. This should not happen. Contact devs.`;
        }
        // <<-- /Creer-Merge: invalidate-dump -->>
    }

    /**
     * Dumps materials from cargo to an adjacent tile. If the tile is a base or
     * hopper tile, materials are sold instead of placed.
     *
     * @param player - The player that called this.
     * @param tile - The tile the materials will be dumped on.
     * @param material - The material the Unit will drop. 'dirt', 'ore',
     * or 'bomb'.
     * @param amount - The number of materials to drop. Amounts <= 0 will drop
     * all the materials.
     * @returns True if successfully dumped materials, false otherwise.
     */
    protected async dump(
        player: Player,
        tile: Tile,
        material: "dirt" | "ore" | "bomb",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: dump -->>
        let trueAmount = amount;
        if ((tile.isHopper || tile.isBase) && material === `ore`) {
            if (amount <= 0) {
                trueAmount = this.ore;
            }
            player.money += trueAmount * this.game.oreValue;
            player.value += trueAmount;
            this.ore -= trueAmount;
        } else if ((tile.isHopper || tile.isBase) && material === `dirt`) {
            if (amount <= 0) {
                trueAmount = this.dirt;
            }
            player.money += trueAmount;
            // Dirt grants no value
            this.dirt -= trueAmount;
        } else if ((tile.isHopper || tile.isBase) && material === `bomb`) {
            player.money += amount * this.game.bombPrice; // sell bombs at sale price
            this.bombs -= amount;
        } else {
            // Not dumping into base/hopper
            if (material === `dirt`) {
                tile.dirt += trueAmount;
                this.dirt -= trueAmount;
            }

            if (material === `ore`) {
                tile.ore += trueAmount;
                this.ore -= trueAmount;
            }

            if (material === `bomb`) {
                if (amount <= 0) {
                    trueAmount = this.bombs;
                }
                for (let i = 0; i < trueAmount; i++) {
                    const bomb = this.game.manager.create.unit({
                        job: this.game.jobs[1],
                        tile,
                    });
                    this.game.units.push(bomb);
                    player.units.push(bomb);
                    tile.units.push(bomb);
                }
                this.bombs -= trueAmount;
            }
        }

        return true;
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
     * all the materials that the Unit can.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMine(
        player: Player,
        tile: Tile,
        amount: number,
    ): void | string | UnitMineArgs {
        // <<-- Creer-Merge: invalidate-mine -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        let trueAmount = amount;
        if (amount < 0) {
            trueAmount =
                tile.dirt +
                tile.ore +
                (tile.isSupport ? this.game.settings.supportCost : 0) +
                (tile.isLadder ? this.game.settings.ladderCost : 0);
        }

        const cargo =
            this.ore +
            this.dirt +
            this.buildingMaterials +
            this.bombs * this.game.bombSize;
        trueAmount = Math.min(
            trueAmount,
            this.miningPower,
            this.maxCargoCapacity - cargo,
        );

        if (trueAmount === 0) {
            if (this.miningPower === 0) {
                return `This unit is out of mining power!`;
            } else if (this.maxCargoCapacity - cargo === 0) {
                return `This unit is out of cargo space!`;
            } else {
                return `There is nothing for this unit to mine!`;
            }
        }
        // <<-- /Creer-Merge: invalidate-mine -->>
    }

    /**
     * Mines the Tile the Unit is on or an adjacent tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile the materials will be mined from.
     * @param amount - The amount of material to mine up. Amounts <= 0 will mine
     * all the materials that the Unit can.
     * @returns True if successfully mined, false otherwise.
     */
    protected async mine(
        player: Player,
        tile: Tile,
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: mine -->>

        // --- 80 Columns ---------------------------------------------------- #
        // A unit may mine ore and dirt from a tile. If a tile contains both, we
        // can make them mine ore first, then dirt, or vice versa, or alternate
        // between the two. Balancing will decide, just clearly pick one.
        // Update isFalling variables
        // Supports give support to 3 in a horizontal line sbove them (T shape
        // kinda)
        // Supports 3 above (add ore + dirt) - 3 * material (ore and dirt) of
        // block support is on

        let amountLeft = amount;
        if (amountLeft <= 0) {
            amountLeft = tile.ore + tile.dirt;
        }
        let currentLoad =
            this.bombs * this.game.bombSize +
            this.buildingMaterials +
            this.dirt +
            this.ore;

        if (tile.isLadder && this.miningPower) {
            this.miningPower -= this.game.settings.ladderCost;
        }

        if (tile.isSupport && this.miningPower) {
            this.miningPower -= this.game.settings.supportCost;
        }

        if (tile.shielding > 0 && this.miningPower) {
            this.miningPower -= tile.shielding * this.game.settings.shieldCost;
        }

        if (tile.ore > 0 && this.miningPower) {
            const actualOreAmount = Math.min(
                tile.ore,
                this.miningPower,
                this.maxCargoCapacity - currentLoad,
            );
            tile.ore -= actualOreAmount;
            this.ore += actualOreAmount;
            this.miningPower -= actualOreAmount;
        }

        if (tile.dirt > 0 && amountLeft > 0 && this.miningPower) {
            const actualDirtAmount = Math.min(
                tile.dirt,
                this.miningPower,
                this.maxCargoCapacity - currentLoad,
            );

            tile.dirt -= actualDirtAmount;
            this.dirt += actualDirtAmount;
            amountLeft -= actualDirtAmount;
            currentLoad += actualDirtAmount;
            this.miningPower -= actualDirtAmount;
        }

        // Check if mined tile is still filled
        if (tile.ore + tile.dirt <= 0) {
            // Check if any tiles are potentially going to fall
            if (
                tile.tileNorth !== undefined &&
                tile.tileNorth.ore + tile.tileNorth.dirt > 0
            ) {
                this.game.fallingTiles.push(tile.tileNorth);
                tile.isFalling = true;
            }

            // Check if unit is going to fall
            if (this.tile) {
                if (this.tile.tileSouth && this.tile.tileSouth === tile) {
                    // Fall logic
                    while (
                        this.tile.tileSouth !== undefined &&
                        this.tile.tileSouth.ore + this.tile.tileSouth.dirt <=
                            0 &&
                        !this.tile.tileSouth.isLadder
                    ) {
                        this.tile.units.splice(
                            this.tile.units.indexOf(this),
                            1,
                        );
                        this.tile = this.tile.tileSouth;
                        this.tile.units.push(this);
                    }
                }
            }
        }

        return false;
        // <<-- /Creer-Merge: mine -->>
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
    ): void | string | UnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        if (!tile) {
            return `${this} cannot move to an uncharted part of the planet! Target tile does not exist!`;
        }

        if (this.moves <= 0) {
            return `This unit is out of moves!`;
        }

        if (!this.tile) {
            return `This unit is not on a tile!`;
        }

        if (this.tile.dirt + this.tile.ore > 0) {
            return `This unit is stuck in a filled tile and cannot move!`;
        }

        if (this.tile.getNeighbor("North") === tile && !this.tile.isLadder) {
            return `This unit cannot fly upwards! It needs a ladder!`;
        }

        if (tile.dirt + tile.ore > 0) {
            return `This unit cannot enter a filled tile!`;
        }

        if (this.moves <= 0) {
            return `${this} is out of fuel, and must fabricate more! It cannot move any more this turn!`;
        }

        if (this.tile.getNeighbors().indexOf(tile) === -1) {
            return `${this} cannot teleport yet! This unit can only move to adjacent tiles.`;
        }

        if (this.tile === tile) {
            return `${this} is already on the tile it is trying to move to!`;
        }

        if (this.tile.dirt + this.tile.ore > 0) {
            return `${this} is buried in ${this.tile}! This unit is stuck, and must dig itself out.`;
        }

        if (tile.dirt + tile.ore > 0) {
            return `${this} cannot phase through dirt and ore!`;
        }

        if (tile === this.tile.tileNorth && !this.tile.isLadder) {
            return `${this} cannot fly! This unit needs a ladder!`;
        }
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
        // Move unit
        if (!this.tile) {
            throw new Error(`${this} has no Tile to move from!`);
        }
        this.tile.units = this.tile.units.filter((u) => u !== this);
        this.tile = tile;
        tile.units.push(this);
        this.moves -= 1;

        // Fall logic
        let distance = 0;
        while (
            this.tile.tileSouth !== undefined &&
            this.tile.tileSouth.ore + this.tile.tileSouth.dirt <= 0 &&
            !this.tile.tileSouth.isLadder
        ) {
            this.tile.units = this.tile.units.filter((u) => u !== this);
            this.tile = this.tile.tileSouth;
            this.tile.units.push(this);
            distance++;
        }

        // Calculate damage
        const healthLevel = this.job.health.indexOf(this.maxHealth);
        if (distance > 0) {
            const damage = distance - (healthLevel + 1);

            if (damage > 0) {
                this.health = Math.max(
                    this.health - damage * this.maxHealth,
                    0,
                );
            }
        }

        return true;

        // <<-- /Creer-Merge: move -->>
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
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): void | string | UnitTransferArgs {
        // <<-- Creer-Merge: invalidate-transfer -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        const otherUnit = this.invalidateGeneralUnitMethod(player);
        if (otherUnit) {
            return otherUnit;
        }
        // this outer if is a redundant check but TS is complaining
        // and overriding it is forbidden in the linter rules
        if (this.tile && unit.tile) {
            if (this.tile?.getNeighbors().indexOf(unit.tile) === -1) {
                return `The target: ${unit} is not adjacent to ${this}!`;
            }
        }

        let actualAmount;
        switch (resource) {
            case "dirt":
                if (this.dirt < amount) {
                    return `${this} cannot transfer more dirt than they have!`;
                }
                actualAmount = amount <= 0 ? this.dirt : amount;
                break;
            case "ore":
                if (this.ore < amount) {
                    return `${this} cannot transfer more ore than they have!`;
                }
                actualAmount = amount <= 0 ? this.ore : amount;
                break;
            case "bomb":
                if (this.bombs < amount) {
                    return `${this} cannot transfer more bombs than they have!`;
                }
                actualAmount = amount <= 0 ? this.bombs : amount;
                break;
            case "buildingMaterials":
                if (this.buildingMaterials < amount) {
                    return `${this} cannot transfer more building materials than they have!`;
                }
                actualAmount = amount <= 0 ? this.buildingMaterials : amount;
                break;
            default:
                return `Invalid transfer material!`;
        }

        // updated to use new function
        const unitCargoCapacity = unit.getCargoAmount();

        if (actualAmount > unit.maxCargoCapacity - unitCargoCapacity) {
            return `The target: ${unit} cannot hold that many materials!`;
        }

        // <<-- /Creer-Merge: invalidate-transfer -->>
    }

    /**
     * Transfers a resource from the one Unit to another.
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
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: transfer -->>

        let actualAmount;
        switch (resource) {
            case "dirt":
                actualAmount = amount <= 0 ? this.dirt : amount;
                this.dirt -= actualAmount;
                unit.dirt += actualAmount;
                break;
            case "ore":
                actualAmount = amount <= 0 ? this.ore : amount;
                this.ore -= actualAmount;
                unit.ore += actualAmount;
                break;
            case "bomb":
                actualAmount = amount <= 0 ? this.bombs : amount;
                this.bombs -= actualAmount;
                unit.bombs += actualAmount;
                break;
            case "buildingMaterials":
                actualAmount = amount <= 0 ? this.buildingMaterials : amount;
                this.buildingMaterials -= actualAmount;
                unit.buildingMaterials += actualAmount;
        }

        return true;

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
    ): void | string | UnitUpgradeArgs {
        // <<-- Creer-Merge: invalidate-upgrade -->>
        const generalFailure = this.invalidateGeneralUnitMethod(player);
        if (generalFailure) {
            return generalFailure;
        }

        if (this.tile && this.tile.owner !== player) {
            return `${this} must be on your base or hopper to upgrade!`;
        }

        if (this.upgradeLevel >= this.game.jobs[0].health.length - 1) {
            return `${this} is already fully upgraded!`;
        }

        if (player.money < this.game.upgradePrice) {
            return `You cannot afford to upgrade this unit!`;
        }
        // <<-- /Creer-Merge: invalidate-upgrade -->>
    }

    /**
     * Upgrade this Unit.
     *
     * @param player - The player that called this.
     * @returns True if successfully upgraded, False otherwise.
     */
    protected async upgrade(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: upgrade -->>
        this.upgradeLevel++;
        this.maxCargoCapacity = this.job.cargoCapacity[this.upgradeLevel];
        this.maxHealth = this.job.health[this.upgradeLevel];
        this.maxMiningPower = this.job.miningPower[this.upgradeLevel];
        this.maxMoves = this.job.moves[this.upgradeLevel];

        return true;
        // <<-- /Creer-Merge: upgrade -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.
    /**
     * General invalidation function for unit methods. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing.
     */
    protected invalidateGeneralUnitMethod(player: Player): string | void {
        if (!player) {
            return "This player does not exist!";
        }

        if (player !== this.game.currentPlayer) {
            return "It is not your turn!";
        }

        if (!this) {
            return "This unit does not exist!";
        }

        if (this.owner !== player) {
            return "This unit does not belong to you!";
        }

        if (!this.health) {
            return "This unit has been destroyed!";
        }

        if (!this.tile) {
            return "This unit is lost in the mines!";
        }

        if (this.job.title === this.game.jobs[1].title) {
            return "Bombs cannot perform actions!";
        }

        if (this.job.title !== this.game.jobs[0].title) {
            return "This unit is not a miner when it should be!";
        }
    }

    /**
     * Simple helper function to get the amount of cargo.
     *
     * @returns The amount of cargo.
     */
    protected getCargoAmount(): number {
        return (
            this.dirt +
            this.ore +
            this.bombs * this.game.bombSize +
            this.buildingMaterials
        );
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

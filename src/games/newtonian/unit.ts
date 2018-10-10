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
     * Whether or not this Unit has performed its action this turn.
     */
    public acted!: boolean;

    /**
     * The amount of blueium carried by this unit. (0 to job carry capacity -
     * other carried items).
     */
    public blueium!: number;

    /**
     * The amount of blueium ore carried by this unit. (0 to job carry capacity
     * - other carried items).
     */
    public blueiumOre!: number;

    /**
     * The remaining health of a unit.
     */
    public health!: number;

    /**
     * The Job this Unit has.
     */
    public readonly job: Job;

    /**
     * The number of moves this unit has left this turn.
     */
    public moves!: number;

    /**
     * The Player that owns and can control this Unit.
     */
    public owner?: Player;

    /**
     * The amount of redium carried by this unit. (0 to job carry capacity -
     * other carried items).
     */
    public redium!: number;

    /**
     * The amount of redium ore carried by this unit. (0 to job carry capacity
     * - other carried items).
     */
    public rediumOre!: number;

    /**
     * Duration of stun immunity. (0 to timeImmune).
     */
    public stunImmune!: number;

    /**
     * Duration the unit is stunned. (0 to the game constant stunTime).
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
        args: Readonly<IUnitProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            job: Job;
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.job = args.job;
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
        // changing its value in this scope is enough.// check widespread reasons.
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // make sure the unit is on the planet.... wait...
        if (!tile) {
            return `${this}, gratz. You proved flat earthers correct.`;
        }
        // make sure the tile is next to the unit
        if (this.tile !== tile.tileEast && this.tile !== tile.tileSouth &&
            this.tile !== tile.tileWest && this.tile !== tile.tileNorth) {
            return `${this} can only act on an adjacent tile.`;
        }
        // make sure valid target
        // if the unit is a physicist
        if (this.job.title === "physicist") {
            // if the tile has a unit.
            if (tile.unit) {
                // if the target isn't a manager.
                if (tile.unit.job.title !== "manager") {
                    return `${this} tried to act on ${tile.unit} which is not a manager`;
                }
            }
            // if there isn't a machine.
            else if (!tile.machine) {
                return `${this} tried to act on ${tile} which does not contain a machine`;
            }
        }
        // if the unit is a manager.
        if (this.job.title === "manager") {
            // if the tile has a unit.
            if (tile.unit) {
                // if the target isn't a intern.
                if (tile.unit.job.title !== "intern") {
                    return `${this} tried to act on ${tile.unit} which is not a intern`;
                }
            }
            // if the target isn't a unit.
            else {
                return `${this} tried to act on ${tile} which is doesn't contain a unit`;
            }
        }
        // if the unit is a intern.
        if (this.job.title === "intern") {
            // if the tile has a unit.
            if (tile.unit) {
                if (tile.unit.job.title !== "physicist") {
                    return `${this} tried to act on ${tile.unit} which is not a physicist`;
                }
            }
            // if there isn't a machine.
            else if (!tile.machine) {
                return `${this} tried to act on ${tile} which does not contain a machine`;
            }
            // if the machine hasn't been worked.
            else if (tile.machine.worked <= 1) {
                return `${this} tried to act on ${tile} which was not worked enough`;
            }
            // if there isn't a machine or unit.
            else {
                return `${this} tried to act on ${tile} which is doesn't contain a unit or machine`;
            }
        }

        // <<-- /Creer-Merge: invalidate-act -->>
    }

    /**
     * Makes the unit do something to a machine adjacent to its tile. Interns
     * sabotage, physicists work. Interns stun physicist, physicist stuns
     * manager, manager stuns intern.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit acts on.
     * @returns True if successfully acted, false otherwise.
     */
    protected async act(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: act -->>

        // Add logic here for act.
        // checking if player object is Physicist
        if (this.job.title === "physicist") {
            // if their target is a machine
            if (tile.machine) {
                // if it is a blueium machine.
                if (tile.machine.oreType === "blueium") {
                    // if the machine has been worked
                    if (tile.machine.worked > 0) {
                        // work the machine.
                        tile.machine.worked++;
                    }
                    // if it has enough ore to start being worked.
                    else if (tile.blueiumOre >= tile.machine.refineInput) {
                        // work the machine.
                        tile.machine.worked++;
                        // grab it's input.
                        tile.blueiumOre -= tile.machine.refineInput;
                    }
                    // resolve the machine being worked.
                    if (tile.machine.worked === tile.machine.refineTime) {
                        // add the refined material.
                        tile.blueium += tile.machine.refineOutput;
                        // reset the work cycle.
                        tile.machine.worked = 0;
                    }
                }
                // if it is a redium machine.
                if (tile.machine.oreType === "redium") {
                    // if the machine has been worked
                    if (tile.machine.worked > 0) {
                        // work the machine.
                        tile.machine.worked++;
                    }
                    // if it has enough ore to start being worked.
                    else if (tile.rediumOre >= tile.machine.refineInput) {
                        // work the machine.
                        tile.machine.worked++;
                        // grab it's input.
                        tile.rediumOre -= tile.machine.refineInput;
                    }
                    // resolve the machine being worked.
                    if (tile.machine.worked === tile.machine.refineTime) {
                        // add the refined material.
                        tile.redium += tile.machine.refineOutput;
                        // reset the work cycle.
                        tile.machine.worked = 0;
                    }
                }
            }
            // if the target is a unit, stun it.
            else if (tile.unit) {
                // stun the unit.
                tile.unit.stunTime += this.game.stunTime;
                // make it immune.
                tile.unit.stunImmune += this.game.timeImmune;
            }
        }
        // checking if player object is manager
        else if (this.job.title === "manager") {
            // if the target is a unit, stun it.
            if (tile.unit) {
                // stun the unit.
                tile.unit.stunTime += this.game.stunTime;
                // make it immune.
                tile.unit.stunImmune += this.game.timeImmune;
            }

        }
        // checking if player object is intern
        else if (this.job.title === "intern") {
            // if the target is a machine, delay it.
            if (tile.machine) {
                // reset it's work cycle, because you are mean.
                tile.machine.worked = 1;
            }
            // if the target is a unit, stun it.
            else if (tile.unit) {
                // stun the unit.
                tile.unit.stunTime += this.game.stunTime;
                // make it immune.
                tile.unit.stunImmune += this.game.timeImmune;
            }
        }

        // TODO: replace this with actual logic
        return true;

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
        // changing its value in this scope is enough.// check widespread reasons.
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // Handle possible tile invalidations here:
        if (!tile) {
            return `${this} is trying to attack a tile that doesn't exist`;
        }
        // make sure the tile is in range.
        if (tile.tileNorth !== this.tile || tile.tileSouth !== this.tile
            || tile.tileEast !== this.tile || tile.tileSouth !== this.tile) {
            return `${this} is trying to attack ${tile} which is too far away.`;
        }
        // check if the unit is attacking a wall (not needed but we try to be funny).
        if (tile.isWall === true) {
            return `${this} hurt its hand attacking a wall.`;
        }
        // make sure the the unit is attacking a unit.
        if (tile.unit === undefined) {
            return `${this} is attacking ${tile} that doesn't have a unit.`;
        }
        // make sure you aren't attacking a friend.
        if (tile.unit.owner === player) {
            return `${this} is trying to attack the ally: ${tile.unit}`;
        }
        // Handle possible unit invalidations here:
        if (this.owner === undefined) {
            return `${this} is attacking a unit that has no owner. Report this to the game Devs`;
        }
        // make sure the unit has a job.
        if (this.job === undefined) {
            return `${this} doesn't have a job. That shouldn't be possible.`;
        }
        if (!this.tile) {
            return `${this} is trying to attack things in the afterlife. Stop it.`;
        }

        // <<-- /Creer-Merge: invalidate-attack -->>
    }

    /**
     * Attacks a unit on an adjacent tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        // Write logic here
        try {
            if (tile.unit === undefined) {
                throw new Error("Unit on tile is undefined.");
            }
            tile.unit.health = tile.unit.health - this.job.damage;
            if (tile.unit.health <= 0) {
                tile.unit.health = 0; // set unit's health to zero.
                tile.unit = undefined; // Unlink tile.
                this.tile = undefined; // and dead unit.
            }
        }
        catch (err) {
            return false; // if error occurs, return false.
        }
        this.acted = true; // unit has acted

        return true; // return true by default
        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for drop. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the materials will be dropped on.
     * @param amount - The number of materials to dropped. Amounts <= 0 will
     * drop all the materials.
     * @param material - The material the unit will drop. 'redium', 'blueium',
     * 'redium ore', or 'blueium ore'.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateDrop(
        player: Player,
        tile: Tile,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): void | string | IUnitDropArgs {
        // <<-- Creer-Merge: invalidate-drop -->>
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // make sure there isn't a wall there.
        if (tile.isWall) {
            return `${this} can't place stuff on a wall. That just don't work, my friend.`;
        }
        // make sure the target tile exists.
        if (!tile) {
            return `${this} is trying to prove flat earthers correct. Target Tile doesn't exist.`;
        }
        // make sure the unit is on a tile.
        if (!this.tile) {
            return `${this} is probably dead. It can't drop things.`;
        }
        // make sure it is selecting a ajacent tile.
        if (tile !== this.tile && this.tile !== tile.tileEast &&
            this.tile !== tile.tileSouth && this.tile !== tile.tileWest &&
            this.tile !== tile.tileNorth) {
            return `${this} can only drop things to an adjacent tile or it's tile. Did you flunk geography?`;
        }

        return;
        // <<-- /Creer-Merge: invalidate-drop -->>
    }

    /**
     * Drops materials at the units feet or adjacent tile.
     *
     * @param player - The player that called this.
     * @param tile - The tile the materials will be dropped on.
     * @param amount - The number of materials to dropped. Amounts <= 0 will
     * drop all the materials.
     * @param material - The material the unit will drop. 'redium', 'blueium',
     * 'redium ore', or 'blueium ore'.
     * @returns True if successfully deposited, false otherwise.
     */
    protected async drop(
        player: Player,
        tile: Tile,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): Promise<boolean> {
        // <<-- Creer-Merge: drop -->>
        let amt = amount;

        if (material === "redium" && this.redium < amount) {
            amt = this.redium;
        }
        if (material === "redium ore" && this.rediumOre < amount) {
            amt = this.rediumOre;
        }
        if (material === "blueium" && this.blueium < amount) {
            amt = this.blueium;
        }
        if (material === "blueium ore" && this.blueiumOre < amount) {
            amt = this.blueiumOre;
        }

        // If amount <= 0, the unit will drop all resources.
        if (amount <= 0) {
            tile.blueium += this.blueium;
            tile.blueiumOre += this.blueiumOre;
            tile.redium += this.redium;
            tile.rediumOre += this.rediumOre;
            this.blueium = this.redium = this.blueiumOre = this.rediumOre = 0;
        }
        // Drops certain amount of redium ore.
        else if (material === "redium ore") {
            tile.rediumOre += amt;
            this.rediumOre -= amt;
        }
        // Drops certain amount of redium.
        else if (material === "redium") {
            tile.redium += amt;
            this.redium -= amt;
        }
        // Drops certain amount of blueium.
        else if (material === "blueium") {
            tile.blueium += amt;
            this.blueium -= amt;
        }
        // Drops certain amount of blueium ore.
        else if (material === "blueium ore") {
            tile.blueiumOre += amt;
            this.blueiumOre -= amt;
        }

        return true;

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

        // check widespread reasons.
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }
        // make sure the unit is on the planet.... wait...
        if (!tile) {
            return `${this}, gratz. You proved flat earthers correct.`;
        }
        // make sure the unit is on a tile.
        if (!this.tile) {
            return `${this} is on a tile that doesn't exist and it should be dead.`;
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
        // Make sure the tile isn't ocuppied.
        if (tile.unit) {
            return `${this} cannot walk through units. Yet.....`;
        }
        // make sure the tile is next to the unit.
        if (this.tile !== tile.tileEast && this.tile !== tile.tileSouth &&
            this.tile !== tile.tileWest && this.tile !== tile.tileNorth) {
            return `${this} can only travel to an adjacent tile. Did you flunk geography?`;
        }
        // make sure they aren't entering a spawn area.
        if (tile.type === "spawn" && this.tile.type !== "spawn") {
            return `${this} is entering a invalid tile. Units cannot re-enter the spawn area upon leaving.`;
        }

        return;

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
        if (!this.tile) {
            throw new Error(`${this} has no Tile to move from!`);
        }
        this.tile.unit = undefined;
        this.tile = tile;
        tile.unit = this;
        this.moves -= 1;

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for pickup. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the materials will be picked up from.
     * @param amount - The amount of materials to pick up. Amounts <= 0 will
     * pick up all the materials that the unit can.
     * @param material - The material the unit will pick up. 'redium',
     * 'blueium', 'redium ore', or 'blueium ore'.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidatePickup(
        player: Player,
        tile: Tile,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): void | string | IUnitPickupArgs {
        // <<-- Creer-Merge: invalidate-pickup -->>

        // Check all the arguments for pickup here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // check common invalidates.
        const reason = this.invalidate(player, false);
        // if there is a reason, report it.
        if (reason) {
            return reason;
        }
        // make sure the unit is on a tile.
        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }
        // make sure the target tile exists.
        if (!tile) {
            return `${this} can only pick things up off tiles that exist`;
        }
        // make sure the tile is adjacent to the current tile, or its tile.
        if (tile !== this.tile && this.tile !== tile.tileEast &&
            this.tile !== tile.tileSouth && this.tile !== tile.tileWest &&
            this.tile !== tile.tileNorth) {
            return `${this} can only pickup resources on or adjacent to its tile.`;
        }

        // tracks the material to be picked up.
        let totalMaterialOnTile = 0;

        // sets up the amount of material.
        switch (material) {
            case "redium ore": {
                totalMaterialOnTile = tile.rediumOre;
                break;
            }
            case "redium": {
                totalMaterialOnTile = tile.redium;
                break;
            }
            case "blueium": {
                totalMaterialOnTile = tile.blueium;
                break;
            }
            case "blueium ore": {
                totalMaterialOnTile = tile.blueiumOre;
            }
        }

        const actualAmount = amount <= 0
            ? totalMaterialOnTile
            : Math.min(totalMaterialOnTile, amount);

        // Amount of materials the unit is currently carrying
        const currentLoad = this.rediumOre + this.redium + this.blueium + this.blueiumOre;
        // if the unit can't carry anymore.
        if (currentLoad === this.job.carryLimit) {
            return `${this} is already carrying as many resources as it can.`;
        }
        // if there is nothing to pickup.
        if (actualAmount <= 0) {
            return `There are no resources on ${tile} for ${this} to pickup.`;
        }
        // <<-- /Creer-Merge: invalidate-pickup -->>
    }

    /**
     * Picks up material at the units feet or adjacent tile.
     *
     * @param player - The player that called this.
     * @param tile - The tile the materials will be picked up from.
     * @param amount - The amount of materials to pick up. Amounts <= 0 will
     * pick up all the materials that the unit can.
     * @param material - The material the unit will pick up. 'redium',
     * 'blueium', 'redium ore', or 'blueium ore'.
     * @returns True if successfully deposited, false otherwise.
     */
    protected async pickup(
        player: Player,
        tile: Tile,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
    ): Promise<boolean> {
        // <<-- Creer-Merge: pickup -->>
        let totalMaterialOnTile = 0;

        switch (material) {
            case "redium ore": {
                totalMaterialOnTile = tile.rediumOre;
                break;
            }
            case "redium": {
                totalMaterialOnTile = tile.redium;
                break;
            }
            case "blueium": {
                totalMaterialOnTile = tile.blueium;
                break;
            }
            case "blueium ore": {
                totalMaterialOnTile = tile.blueiumOre;
            }
        }

        let actualAmount = amount <= 0 ? totalMaterialOnTile
            : Math.min(totalMaterialOnTile, amount);
        const currentLoad = this.rediumOre + this.redium + this.blueium + this.blueiumOre;

        actualAmount = Math.min(actualAmount, this.job.carryLimit - currentLoad);

        switch (material) {
            case "redium ore": {
                tile.rediumOre -= actualAmount;
                this.rediumOre += actualAmount;
                break;
            }
            case "redium": {
                tile.redium -= actualAmount;
                this.redium += actualAmount;
                break;
            }
            case "blueium": {
                tile.blueium -= actualAmount;
                this.blueium += actualAmount;
                break;
            }
            case "blueium ore": {
                tile.blueiumOre -= actualAmount;
                this.blueiumOre += actualAmount;
            }
        }

        return true;

        // <<-- /Creer-Merge: pickup -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Tries to invalidate args for an action function
     *
     * @param player - the player commanding this Unit
     * @param checkAction - true to check if this Unit has an action
     * @returns The reason this is invalid, undefined if looks valid so far.
     */
    private invalidate(
        player: Player,
        checkAction: boolean = false,
    ): string | undefined {
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (this.owner !== player) {
            return `${this} isn't owned by you.`;
        }
        // Make sure the unit hasn't acted.
        if (checkAction && this.acted) {
            return `${this} has already acted this turn. Or not enough coffee`;
        }
        // make sure the unit can function
        if (this.stunTime > 0) {
            return `${this} is stunned and cannot move.`;
        }
        // Make sure the unit is alive.
        if (this.health <= 0) {
            return `${this} is fuel.`;
        }
    }

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

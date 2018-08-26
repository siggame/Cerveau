import { IBaseGameObjectRequiredData } from "~/core/game";
import { IUnitProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
import { StructureType } from "./structure";
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.Unit have different args.
 */
export interface IUnitConstructorArgs
extends IGameObjectConstructorArgs, IUnitProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A unit in the game.
 */
export class Unit extends GameObject {
    /**
     * Whether this Unit has performed its action this turn.
     */
    public acted!: boolean;

    /**
     * The amount of energy this Unit has (from 0.0 to 100.0).
     */
    public energy!: number;

    /**
     * The amount of food this Unit is holding.
     */
    public food!: number;

    /**
     * The Job this Unit was recruited to do.
     */
    public job: Job;

    /**
     * The amount of materials this Unit is holding.
     */
    public materials!: number;

    /**
     * The tile this Unit is moving to. This only applies to neutral fresh
     * humans spawned on the road. Otherwise, the tile this Unit is on.
     */
    public movementTarget?: Tile;

    /**
     * How many moves this Unit has left this turn.
     */
    public moves!: number;

    /**
     * The Player that owns and can control this Unit, or null if the Unit is
     * neutral.
     */
    public owner?: Player;

    /**
     * The Units in the same squad as this Unit. Units in the same squad attack
     * and defend together.
     */
    public squad!: Unit[];

    /**
     * Whether this Unit is starving. Starving Units regenerate energy at half
     * the rate they normally would while resting.
     */
    public starving!: boolean;

    /**
     * The Tile this Unit is on.
     */
    public tile?: Tile;

    /**
     * The number of turns before this Unit dies. This only applies to neutral
     * fresh humans created from combat. Otherwise, 0.
     */
    public turnsToDie!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Unit is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IUnitConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>

        this.energy = data.energy || 100;
        this.job = data.job || this.game.jobs[0];
        this.moves = this.job.moves;
        this.owner = data.owner;
        this.tile = data.tile;
        this.turnsToDie = data.turnsToDie || -1;
        this.movementTarget = data.movementTarget;

        this.game.units.push(this);
        if (this.owner) {
            this.owner.units.push(this);
            this.owner.calculateSquads();
        }
        else {
            this.squad = [this];
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for attack. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateAttack(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-attack -->>

        const reason = this.invalidate(player, true, false);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (this.job.title !== "soldier") {
            return `${this} cannot attack as they are not a soldier! Their only combat ability is as a meatshield!`;
        }

        if (this.tile.hasNeighbor(tile)) {
            return `${tile} is not adjacent to ${this}.`;
        }

        if (tile.structure && tile.structure.type !== "road") {
            // Attacking a structure, no checks needed here
        }
        else if (tile.unit) {
            // Attacking a unit
            if (tile.unit.owner === player) {
                return `${this} can't attack friends!`;
            }
        }
        else {
            return `There is nothing on ${tile} for ${this} to attack!`;
        }

        // <<-- /Creer-Merge: invalidate-attack -->>
        return arguments;
    }

    /**
     * Attacks an adjacent Tile. Costs an action for each Unit in this Unit's
     * squad. Units in the squad without an action don't participate in combat.
     * Units in combat cannot move afterwards. Attacking structures will not
     * give materials.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        let attackSum = 0; // damage to be distributed
        const toDie = new Set<Unit>(); // update dead later
        for (const soldier of this.squad) {
            let attackMod = 1; // damage modifier, if unit near allied monument
            if (!soldier.acted) { // if soldier hasn't acted
                if (soldier.isInRange("monument")) {
                    attackMod = this.game.monumentCostMult;
                } // if ally monument nearby, take less dmg from contributing
                soldier.energy -= soldier.job.actionCost * attackMod;
                soldier.acted = true;
                soldier.moves = 0;
                attackSum += soldier.job.actionCost;
                if (soldier.energy <= 0) { // if died
                    // soldier.energy is negative here, can only contribute as much energy as unit has
                    attackSum += soldier.energy / attackMod;
                    toDie.add(soldier);
                }
            }
        }

        // EVERYTHING BEFORE IS CALCULATING DAMAGE, AFTER IS DEALING THE DAMAGE
        if (tile.structure && tile.structure.type !== "road") { // checking if unit or attack-able structure
            // Attack a structure
            tile.structure.materials -= attackSum;
            if (tile.structure.materials <= 0) {
                // Structure will get removed from arrays in next turn logic
                tile.structure.tile = undefined;
                tile.structure = undefined;
            }
        }
        else { // assuming unit, which it should be if not a structure
            // Attack a unit/squad
            if (!tile.unit) {
                throw new Error(`${this} attacking ${tile} with no unit on it!`);
            }

            for (const target of tile.unit.squad) {
                let attackMod = 1; // damage modifier
                if (target.isInRange("monument")) {
                    // if near enemy monument, take less dmg
                    attackMod = this.game.monumentCostMult;
                }
                target.energy -= attackSum * attackMod / tile.unit.squad.length;
                if (target.energy <= 0) {
                    toDie.add(target);
                }
            }
        }

        // IT'S KILLING TIME
        for (const dead of toDie) {
            // Drop carried resources
            if (!dead.tile) {
                throw new Error(`${dead} is already dead`);
            }
            dead.tile.food += dead.food;
            dead.tile.materials += dead.materials;
            dead.food = 0;
            dead.materials = 0;

            if (dead.owner) {
                if (dead.job.title !== "cat overlord") {
                    // actually fresh human converting time, not in fact killing time
                    dead.job = this.game.jobs[0];
                    dead.turnsToDie = 10;
                    dead.energy = 100;
                    dead.squad = [dead];

                    // Don't actually remove it from the player's units array yet
                    dead.owner.defeatedUnits.push(dead);

                    // Make sure the previous owner can't control it anymore
                    dead.owner = undefined;
                }
            }
            else {
                // Neutral fresh human, will get removed from arrays in next turn logic
                dead.tile.unit = undefined;
                dead.tile = undefined;
            }
        }

        // updating squads
        for (const p of this.game.players) {
            p.calculateSquads();
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for changeJob. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param job - The name of the Job to change to.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateChangeJob(
        player: Player,
        job: "soldier" | "gatherer" | "builder" | "missionary",
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-changeJob -->>

        const reason = this.invalidate(player, true, false);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (this.job.title === "cat overlord") {
            return `${this} is the overlord. It cannot change jobs!`;
        }

        if (this.job.title === job) {
            return `${this} cannot change to its own job!`;
        }

        if (this.energy < 100) {
            return `${this} must be at 100 energy to change jobs`;
        }

        if (!player.cat.tile) {
            return `Player's Cat ${player.cat} is not on a Tile!`;
        }

        if (Math.abs(this.tile.x - player.cat.tile.x) > 1
         || Math.abs(this.tile.y - player.cat.tile.y) > 1
        ) {
            return `${this} must be adjacent or diagonal to your cat to change jobs`;
        }

        // <<-- /Creer-Merge: invalidate-changeJob -->>
        return arguments;
    }

    /**
     * Changes this Unit's Job. Must be at max energy (100.0) to change Jobs.
     *
     * @param player - The player that called this.
     * @param job - The name of the Job to change to.
     * @returns True if successfully changed Jobs, false otherwise.
     */
    protected async changeJob(
        player: Player,
        job: "soldier" | "gatherer" | "builder" | "missionary",
    ): Promise<boolean> {
        // <<-- Creer-Merge: changeJob -->>

        const actualJob = this.game.jobs.find((j) => j.title === job);
        if (!actualJob) {
            throw new Error(`Trying to set ${this} to unknown job ${job}.`);
        }

        if (!this.tile || !this.owner) {
            throw new Error(`${this} is dead and cannot change job`);
        }

        this.job = actualJob;
        this.acted = true;
        this.moves = 0; // It takes all their time
        this.tile.food += this.food;
        this.tile.materials += this.materials;
        this.food = 0;
        this.materials = 0;
        this.owner.calculateSquads();

        return true;

        // <<-- /Creer-Merge: changeJob -->>
    }

    /**
     * Invalidation function for construct. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to construct the Structure on. It must have
     * enough materials on it for a Structure to be constructed.
     * @param type - The type of Structure to construct on that Tile.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateConstruct(
        player: Player,
        tile: Tile,
        type: "neutral" | "shelter" | "monument" | "wall" | "road",
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-construct -->>

        const reason = this.invalidate(player, true, true);

        if (reason) {
            return reason;
        }
        else if (this.job.title !== "builder") {
            return `${this} is not a builder. Only builders can construct!`;
        }
        else if (tile.structure) {
            return `${tile} already has a structure! ${this} cannot construct here!`;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        // Check structure type and if they have enough materials
        if (tile.unit && type !== "shelter") {
            return `${this} can't construct on ${tile} because ${tile.unit} is there!`;
        }

        if (!this.tile.hasNeighbor(tile)) {
            return `${tile} is not adjacent to ${this}.`;
        }

        const matsNeeded = this.game.getStructureCost(type);
        if (tile.materials < matsNeeded) {
            return `There aren't enough materials on ${tile}. You need ${matsNeeded} to construct a ${type}.`;
        }

        // <<-- /Creer-Merge: invalidate-construct -->>
        return arguments;
    }

    /**
     * Constructs a Structure on an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to construct the Structure on. It must have
     * enough materials on it for a Structure to be constructed.
     * @param type - The type of Structure to construct on that Tile.
     * @returns True if successfully constructed a structure, false otherwise.
     */
    protected async construct(
        player: Player,
        tile: Tile,
        type: "neutral" | "shelter" | "monument" | "wall" | "road",
    ): Promise<boolean> {
        // <<-- Creer-Merge: construct -->>

        tile.structure = this.manager.create.structure({
            owner: player,
            tile,
            type,
        });

        const mult = this.isInRange("monument")
            ? this.game.monumentCostMult
            : 1;
        this.energy -= this.job.actionCost * mult;
        tile.materials -= tile.structure.materials;
        tile.harvestRate = 0;

        return true;

        // <<-- /Creer-Merge: construct -->>
    }

    /**
     * Invalidation function for convert. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile with the Unit to convert.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateConvert(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-convert -->>

        const reason = this.invalidate(player, true, true);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (this.job.title !== "missionary") {
            return `${this} isn't a missionary and is thus unable to convince units to join you cul- I mean kingdom.`;
        }

        if (!tile) {
            return `${this} can't convert a nonexistent tile to your cause.`;
        }

        if (!this.tile.hasNeighbor(tile)) {
            return `${this} can only convert units on adjacent tiles.`;
        }

        if (!tile.unit) {
            return `${this} must convert a unit. There is no unit on ${tile}.`;
        }

        if (tile.unit.owner) {
            return `The unit on ${tile} is already owned by somebody. ${this} can't convert it.`;
        }

        // <<-- /Creer-Merge: invalidate-convert -->>
        return arguments;
    }

    /**
     * Converts an adjacent Unit to your side.
     *
     * @param player - The player that called this.
     * @param tile - The Tile with the Unit to convert.
     * @returns True if successfully converted, false otherwise.
     */
    protected async convert(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: convert -->>

        // Unit will be added to the player's units array at the start of their next turn
        const unit = tile.unit;
        if (!unit) {
            throw new Error(`No unit on ${tile} to convert!`);
        }

        unit.turnsToDie = -1;
        unit.owner = player;
        unit.energy = 100;
        unit.acted = true;
        unit.moves = 0;
        unit.movementTarget = undefined;

        const mult = this.isInRange("monument")
            ? this.game.monumentCostMult
            : 1;
        this.energy -= this.job.actionCost * mult;
        this.acted = true;
        player.newUnits.push(unit);

        return true;

        // <<-- /Creer-Merge: convert -->>
    }

    /**
     * Invalidation function for deconstruct. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to deconstruct. It must have a Structure on it.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateDeconstruct(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-deconstruct -->>

        const reason = this.invalidate(player, true, true);
        if (reason) {
            return reason;
        }

        if (!tile.structure) {
            return `No structure on ${tile} for ${this} to deconstruct.`;
        }

        if (tile.structure.type === "road") {
            return `${this} cannot deconstruct roads!`;
        }

        else if (this.job.title !== "builder") {
            return `${this} is not a builder. Only builders can deconstruct.`;
        }

        else if (this.owner === tile.structure.owner) {
            return `${this} cannot deconstruct friendly structures. `
                 + "Soldiers can destroy them by attacking them, though.";
        }

        else if (this.materials + this.food >= this.job.carryLimit) {
            return `${this} cannot carry any more materials.`;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (!this.tile.hasNeighbor(tile)) {
            return `${tile} is not adjacent to ${this}.`;
        }

        // <<-- /Creer-Merge: invalidate-deconstruct -->>
        return arguments;
    }

    /**
     * Removes materials from an adjacent Tile's Structure. You cannot
     * deconstruct friendly structures (see Unit.attack).
     *
     * @param player - The player that called this.
     * @param tile - The Tile to deconstruct. It must have a Structure on it.
     * @returns True if successfully deconstructed, false otherwise.
     */
    protected async deconstruct(
        player: Player,
        tile: Tile,
    ): Promise<boolean> {
        // <<-- Creer-Merge: deconstruct -->>

        const structure = tile.structure;
        if (!structure) {
            throw new Error(`No structure on ${tile} to desconstruct!`);
        }

        const amount = Math.min(
            this.job.carryLimit - this.materials - this.food,
            structure.materials,
        );

        this.materials += amount;
        structure.materials -= amount;

        // Destroy structure if it's out of materials
        if (structure.materials <= 0) {
            // Structure is removed from arrays in next turn logic
            structure.tile = undefined;
            tile.structure = undefined;
        }

        const mult = this.isInRange("monument")
            ? this.game.monumentCostMult
            : 1;

        this.energy -= this.job.actionCost * mult;
        this.acted = true;

        return true;

        // <<-- /Creer-Merge: deconstruct -->>
    }

    /**
     * Invalidation function for drop. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to drop materials/food on.
     * @param resource - The type of resource to drop ('materials' or 'food').
     * @param amount - The amount of the resource to drop. Amounts <= 0 will
     * drop as much as possible.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateDrop(
        player: Player,
        tile: Tile,
        resource: "materials" | "food",
        amount: number = 0,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-drop -->>

        const reason = this.invalidate(player, false, false);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (tile !== this.tile && !this.tile.hasNeighbor(tile)) {
            return `${this} can only drop things on or adjacent to your tile.`;
        }

        if (tile.structure) {
            if (tile.structure.type === "shelter") {
                if (tile.structure.owner !== player) {
                    return `${this} can't drop things in enemy shelters. Nice thought though.`;
                }
                else if (resource[0] !== "f" && resource[0] !== "F") {
                    return `${this} can only store food in shelters.`;
                }
            }
            else if (tile.structure.type !== "road") {
                return `${this} can't drop resources on structures.`;
            }
        }

        // <<-- /Creer-Merge: invalidate-drop -->>
        return arguments;
    }

    /**
     * Drops some of the given resource on or adjacent to the Unit's Tile. Does
     * not count as an action.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to drop materials/food on.
     * @param resource - The type of resource to drop ('materials' or 'food').
     * @param amount - The amount of the resource to drop. Amounts <= 0 will
     * drop as much as possible.
     * @returns True if successfully dropped the resource, false otherwise.
     */
    protected async drop(
        player: Player,
        tile: Tile,
        resource: "materials" | "food",
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: drop -->>

        if (amount < 1) {
            // Drop it all
            amount = resource === "food"
            ? this.food
            : this.materials;
        }

        // Drop the resource
        if (resource === "food") {
            amount = Math.min(amount, this.food);
            if (tile.structure && tile.structure.type === "shelter" && this.owner) {
                this.owner.food += amount;
            }
            else {
                tile.food += amount;
            }
            this.food -= amount;
        }
        else {
            amount = Math.min(amount, this.materials);
            tile.materials += amount;
            this.materials -= amount;
        }

        return true;

        // <<-- /Creer-Merge: drop -->>
    }

    /**
     * Invalidation function for harvest. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile you want to harvest.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateHarvest(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-harvest -->>

        const reason = this.invalidate(player, true, true);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (tile !== this.tile && !this.tile.hasNeighbor(tile)) {
            return "You can only harvest on or adjacent to your tile.";
        }

        // Make sure unit is harvesting a valid tile
        if (tile.structure) {
            if (tile.structure.type !== "shelter" || tile.structure.owner === player) {
                return "You can only steal from enemy shelters.";
            }
        }
        else if (tile.harvestRate < 1) {
            return "You can't harvest food from that tile.";
        }
        else if (tile.turnsToHarvest !== 0) {
            return "This tile isn't ready to harvest.";
        }

        const carry = this.food + this.materials;
        if (carry >= this.job.carryLimit) {
            return "You cannot carry anymore";
        }

        // <<-- /Creer-Merge: invalidate-harvest -->>
        return arguments;
    }

    /**
     * Harvests the food on an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile you want to harvest.
     * @returns True if successfully harvested, false otherwise.
     */
    protected async harvest(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: harvest -->>

        const carry = this.job.carryLimit - (this.food + this.materials);
        let pickup = 0;
        if (tile.structure && tile.structure.owner) {
            pickup = Math.min(tile.structure.owner.food, carry);
            tile.structure.owner.food -= pickup;
        }
        else {
            pickup = Math.min(tile.harvestRate, carry);
            tile.turnsToHarvest = this.game.turnsBetweenHarvests;
        }

        const mult = this.isInRange("monument") ? this.game.monumentCostMult : 1;
        this.energy -= this.job.actionCost * mult;
        this.food += pickup;
        this.acted = true;

        return true;

        // <<-- /Creer-Merge: harvest -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Unit should move to.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateMove(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-move -->>
        const reason = this.invalidate(player, false, false);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (tile.unit) {
            return `Can't move because the tile is already occupied by ${tile.unit}.`;
        }

        if (this.moves < 1) {
            return "Your unit is out of moves!";
        }

        if (this.tile.hasNeighbor(tile)) {
            return "Your unit must move to a tile to the north, south, east, or west.";
        }

        if (tile.structure && tile.structure.type !== "road" && tile.structure.type !== "shelter") {
            return "Units cannot move onto structures other than roads and shelters.";
        }

        // <<-- /Creer-Merge: invalidate-move -->>
        return arguments;
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

        if (!this.tile || !this.owner) {
            throw new Error(`${this} is trying to move while dead!`);
        }

        // Deduct the move from the unit
        this.moves -= 1;

        // Update the tiles
        this.tile.unit = undefined;
        this.tile = tile;
        tile.unit = this;

        // Recalculate squads
        this.owner.calculateSquads();
        // console.log(`${this} moving to ${tile}`);

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for pickup. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to pickup materials/food from.
     * @param resource - The type of resource to pickup ('materials' or
     * 'food').
     * @param amount - The amount of the resource to pickup. Amounts <= 0 will
     * pickup as much as possible.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidatePickup(
        player: Player,
        tile: Tile,
        resource: "materials" | "food",
        amount: number = 0,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-pickup -->>

        const reason = this.invalidate(player, false, false);
        if (reason) {
            return reason;
        }

        if (!this.tile) {
            return `${this} is not on a Tile!`;
        }

        if (!tile) {
            return `${this} can only pick things up off tiles that exist`;
        }
        if (tile !== this.tile && !this.tile.hasNeighbor(tile)) {
            return `${this} can only pickup resources on or adjacent to its tile.`;
        }

        amount = amount < 1
            ? tile[resource]
            : Math.min(tile[resource], amount);

        // Make sure it picks up more than 0 resources
        if (Math.floor(this.energy) <= 0) {
            return `${this} doesn't have enough energy to pickup anything.`;
        }

        if (this.getCarryLeft() <= 0) {
            return `${this} is already carrying as many resources as it can.`;
        }

        if (amount <= 0) {
            return `There are no resources on ${tile} for ${this} to pickup.`;
        }

        // looks valid, let's update amount to the computed value
        amount = Math.min(amount, this.getCarryLeft(), Math.floor(this.energy));

        // <<-- /Creer-Merge: invalidate-pickup -->>
        return arguments;
    }

    /**
     * Picks up some materials or food on or adjacent to the Unit's Tile. Does
     * not count as an action.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to pickup materials/food from.
     * @param resource - The type of resource to pickup ('materials' or
     * 'food').
     * @param amount - The amount of the resource to pickup. Amounts <= 0 will
     * pickup as much as possible.
     * @returns True if successfully picked up a resource, false otherwise.
     */
    protected async pickup(
        player: Player,
        tile: Tile,
        resource: "materials" | "food",
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: pickup -->>

        amount = Math.min(amount, tile[resource]);
        tile[resource] -= amount;
        this[resource] += amount;
        this.energy -= amount;

        return true;

        // <<-- /Creer-Merge: pickup -->>
    }

    /**
     * Invalidation function for rest. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateRest(player: Player): string | IArguments {
        // <<-- Creer-Merge: invalidate-rest -->>

        const reason = this.invalidate(player, true, false);
        if (reason) {
            return reason;
        }

        if (this.energy >= 100) {
            return "The unit has full energy!";
        }

        if (!this.isInRange("shelter")) {
            return "Unit must be in range of a friendly shelter to heal";
        }

        // <<-- /Creer-Merge: invalidate-rest -->>
        return arguments;
    }

    /**
     * Regenerates energy. Must be in range of a friendly shelter to rest.
     * Costs an action. Units cannot move after resting.
     *
     * @param player - The player that called this.
     * @returns True if successfully rested, false otherwise.
     */
    protected async rest(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: rest -->>

        if (!this.owner || !this.tile) {
            throw new Error(`${this} trying to rest when dead!`);
        }

        // Get all shelters this unit is in range of
        const nearbyShelters = this.owner.getAllStructures().filter((structure) => {
            // Make sure this structure isn't destroyed
            if (!structure.tile) {
                return false;
            }

            // Make sure this structure is a shelter
            if (structure.type !== "shelter") {
                return false;
            }

            // Make sure this shelter is in range of this unit
            const radius = structure.effectRadius;

            return this.tile
                && Math.abs(this.tile.x - structure.tile.x) <= radius
                && Math.abs(this.tile.y - structure.tile.y) <= radius;
        });

        // Get a nearby shelter with a cat in range of it, or undefined if none
        const catShelter = nearbyShelters.find((shelter) => {
            // Make sure the cat is in range of this shelter
            const cat = this.owner && this.owner.cat;
            const radius = shelter.effectRadius;

            return Boolean(cat && cat.tile && shelter && shelter.tile
                && Math.abs(cat.tile.x - shelter.tile.x) <= radius
                && Math.abs(cat.tile.y - shelter.tile.y) <= radius,
            );
        });

        // Calculate the energy multiplier
        let mult = 1;
        if (this.starving) {
            mult *= this.game.starvingEnergyMult;
        }
        if (catShelter) {
            mult *= this.game.catEnergyMult;
        }

        // Add energy to this unit
        this.energy += mult * this.job.regenRate;
        if (this.energy > 100) {
            this.energy = 100;
        }

        // Make sure they can't do anything else this turn
        this.acted = true;
        this.moves = 0;

        return true;

        // <<-- /Creer-Merge: rest -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Tries to invalidate args for an action function
     *
     * @param player - the player commanding this Unit
     * @param checkAction - true to check if this Unit has an action
     * @param checkEnergy - true to check if this Unit has enough energy
     * @returns The reason this is invalid, undefined if looks valid so far.
     */
    private invalidate(
        player: Player,
        checkAction: boolean = false,
        checkEnergy: boolean = false,
    ): string | undefined {
        if (this.owner !== player) {
            return `${this} isn't owned by you.`;
        }

        if (checkAction && this.acted) {
            return `${this} cannot perform another action this turn.`;
        }

        const mult = this.isInRange("monument") ? this.game.monumentCostMult : 1;
        if (checkEnergy && this.energy < this.job.actionCost * mult) {
            return `${this} doesn't have enough energy.`;
        }
    }

    /**
     * Checks if this unit is in range of a structure of the given type.
     *
     * @param type - The type of structure to search for
     * @returns The structure this unit is in range of, or undefined if none exist
     */
    private isInRange(type: StructureType): boolean {
        return Boolean(this.game.structures.concat(
            this.game.newStructures).find((structure) => {
                if (!this.tile || !structure.tile || structure.owner !== this.owner || structure.type !== type) {
                    return false;
                }

                const radius = structure.effectRadius;

                return Math.abs(this.tile.x - structure.tile.x) <= radius
                    && Math.abs(this.tile.y - structure.tile.y) <= radius;
            }, this),
        );
    }

    /**
     * Returns how much stuff this unit can pickup or be given before hitting
     * the carry limit.
     *
     * @returns How much this can still carry
     */
    private getCarryLeft(): number {
        return this.job.carryLimit - this.materials - this.food;
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

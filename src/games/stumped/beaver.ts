import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBeaverProperties } from "./";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Spawner } from "./spawner";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
import { removeElements } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.Beaver have different args.
 */
export interface IBeaverConstructorArgs
extends IGameObjectConstructorArgs, IBeaverProperties {
    // <<-- Creer-Merge: constructor-args -->>
    job: Job;
    owner: Player;
    tile: Tile;
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A beaver in the game.
 */
export class Beaver extends GameObject {
    /**
     * The number of actions remaining for the Beaver this turn.
     */
    public actions!: number;

    /**
     * The amount of branches this Beaver is holding.
     */
    public branches!: number;

    /**
     * The amount of food this Beaver is holding.
     */
    public food!: number;

    /**
     * How much health this Beaver has left.
     */
    public health!: number;

    /**
     * The Job this Beaver was recruited to do.
     */
    public readonly job: Job;

    /**
     * How many moves this Beaver has left this turn.
     */
    public moves!: number;

    /**
     * The Player that owns and can control this Beaver.
     */
    public owner: Player;

    /**
     * True if the Beaver has finished being recruited and can do things, False
     * otherwise.
     */
    public recruited!: boolean;

    /**
     * The Tile this Beaver is on.
     */
    public tile?: Tile;

    /**
     * Number of turns this Beaver is distracted for (0 means not distracted).
     */
    public turnsDistracted!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Beaver is created.
     *
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IBeaverConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>

        this.owner = data.owner;
        this.job = data.job;
        this.tile = data.tile;

        this.health = this.job.health;
        this.actions = this.job.actions;
        this.moves = this.job.moves;
        this.tile.beaver = this;

        this.game.newBeavers.push(this);

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
     * @param beaver - The Beaver to attack. Must be on an adjacent Tile.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateAttack(
        player: Player,
        beaver: Beaver,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-attack -->>

        const invalid = this.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!beaver) {
            return `${beaver} is not a valid beaver for ${this} to attack.`;
        }

        if (!beaver.recruited) {
            return `${beaver} has not finished being recruited yet, and cannot be attacked yet.`;
        }

        if (!this.tile!.hasNeighbor(beaver.tile)) {
            return `${beaver} is not adjacent to ${this} beaver to be attacked.`;
        }

        // <<-- /Creer-Merge: invalidate-attack -->>
        return arguments;
    }

    /**
     * Attacks another adjacent beaver.
     *
     * @param player - The player that called this.
     * @param beaver - The Beaver to attack. Must be on an adjacent Tile.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, beaver: Beaver): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        beaver.health = Math.max(0, beaver.health - this.job.damage);

        // If the beaver is already distracted, keep that value, otherwise they
        // get distracted by this attack
        beaver.turnsDistracted = beaver.turnsDistracted || this.job.distractionPower;
        this.actions--;

        // Check if the enemy beaver died.
        if (beaver.health <= 0) {
            // Drop it's resources on the ground.
            beaver.tile!.branches += beaver.branches;
            beaver.tile!.food += beaver.food;

            // And set its values to invalid numbers to signify it is dead.
            beaver.branches = -1;
            beaver.food = -1;
            beaver.actions = -1;
            beaver.moves = -1;
            beaver.turnsDistracted = -1;

            // Remove him from the map of tiles.
            beaver.tile!.beaver = undefined;
            beaver.tile = undefined;
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for buildLodge. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateBuildLodge(player: Player): string | IArguments {
        // <<-- Creer-Merge: invalidate-buildLodge -->>

        const invalid = this.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if ((this.branches + this.tile!.branches) < player.branchesToBuildLodge) {
            return `${this} does not have enough branches to build the lodge.`;
        }

        if (this.tile!.lodgeOwner) {
            return `${this.tile} already has a lodge owned by ${this.tile!.lodgeOwner}.`;
        }

        if (this.tile!.spawner) {
            return `${this.tile} has a spawner which cannot be built over.`;
        }

        // <<-- /Creer-Merge: invalidate-buildLodge -->>
        return arguments;
    }

    /**
     * Builds a lodge on the Beavers current Tile.
     *
     * @param player - The player that called this.
     * @returns True if successfully built a lodge, false otherwise.
     */
    protected async buildLodge(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: buildLodge -->>

        // Overcharge tile's branches
        this.tile!.branches -= player.branchesToBuildLodge;
        if (this.tile!.branches < 0) {
            // Make up difference with this Beaver's branches
            // NOTE Tile has a debt, ie a negative value being added
            this.branches += this.tile!.branches;
            this.tile!.branches = 0;
        }

        // All the branches are now on this tile to makeup the lodge
        this.tile!.branches = player.branchesToBuildLodge;
        this.tile!.lodgeOwner = player;
        this.owner.lodges.push(this.tile!);
        this.actions--;

        player.calculateBranchesToBuildLodge();

        return true;

        // <<-- /Creer-Merge: buildLodge -->>
    }

    /**
     * Invalidation function for drop. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to drop branches/food on. Must be the same Tile
     * that the Beaver is on, or an adjacent one.
     * @param resource - The type of resource to drop ('branches' or 'food').
     * @param amount - The amount of the resource to drop, numbers <= 0 will
     * drop all the resource type.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateDrop(
        player: Player,
        tile: Tile,
        resource: "branches" | "food",
        amount: number = 0,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-drop -->>

        const invalid = this.invalidate(player);
        if (invalid) {
            return invalid;
        }

        // transform the amount if they passed in a number =< 0
        if (amount <= 0) {
            amount = this[resource];
        }

        if (amount <= 0) {
            return `${this} cannot drop ${amount} of ${resource}`;
        }

        if (amount > this[resource]) {
            return `${this} does not have ${amount} ${resource} to drop.`;
        }

        if (!tile) {
            return `${tile} is not a valid tile to drop resources on.`;
        }

        if (this.tile !== tile && !this.tile!.hasNeighbor(tile)) {
            return `${tile} is not the adjacent to or equal to the tile ${this} is on (${this.tile})`;
        }

        if (tile.spawner) {
            return `${tile} has ${tile.spawner} on it, and cannot have resourced dropped onto it.`;
        }

        // Looks valid!
        // Note:  the variables `amount` and `resource` have been
        // modified and will be sent to the drop() function below via the magic
        // arguments variable.

        // <<-- /Creer-Merge: invalidate-drop -->>
        return arguments;
    }

    /**
     * Drops some of the given resource on the beaver's Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to drop branches/food on. Must be the same Tile
     * that the Beaver is on, or an adjacent one.
     * @param resource - The type of resource to drop ('branches' or 'food').
     * @param amount - The amount of the resource to drop, numbers <= 0 will
     * drop all the resource type.
     * @returns True if successfully dropped the resource, false otherwise.
     */
    protected async drop(
        player: Player,
        tile: Tile,
        resource: "branches" | "food",
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: drop -->>

        // We know it must be this from the above function.
        const res = resource;

        this[res] -= amount;
        tile[res] += amount;
        this.actions--;

        return true;

        // <<-- /Creer-Merge: drop -->>
    }

    /**
     * Invalidation function for harvest. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param spawner - The Spawner you want to harvest. Must be on an adjacent
     * Tile.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateHarvest(
        player: Player,
        spawner: Spawner,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-harvest -->>

        const invalid = this.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!spawner) {
            return `${spawner} is not a valid Spawner`;
        }

        if (!this.tile!.hasNeighbor(spawner.tile)) {
            return `${this} on tile ${this.tile} is not adjacent to ${spawner.tile}`;
        }

        const load = this.food + this.branches;
        if (load >= this.job.carryLimit) {
            return `Beaver cannot carry any more resources. Limit: (${load}/${this.job.carryLimit})`;
        }

        // <<-- /Creer-Merge: invalidate-harvest -->>
        return arguments;
    }

    /**
     * Harvests the branches or food from a Spawner on an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param spawner - The Spawner you want to harvest. Must be on an adjacent
     * Tile.
     * @returns True if successfully harvested, false otherwise.
     */
    protected async harvest(
        player: Player,
        spawner: Spawner,
    ): Promise<boolean> {
        // <<-- Creer-Merge: harvest -->>

        // Add logic here for harvest.

        const load = this.food + this.branches;
        const spaceAvailable = this.job.carryLimit - load;
        const skillScalar = spawner.type === "branches"
            ? this.job.chopping
            : this.job.munching;

        const maxCanHarvest = (
            this.game.spawnerHarvestConstant *
            spawner.health *
            skillScalar
        );

        this[spawner.type] += Math.min(
            spaceAvailable,
            maxCanHarvest,
        );
        this.actions--;

        // damage the spawner because we harvested from it
        if (spawner.health > 0) {
            spawner.health--;
        }

        spawner.hasBeenHarvested = true;
        spawner.harvestCooldown = 2;

        return true;

        // <<-- /Creer-Merge: harvest -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Beaver should move to.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateMove(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-move -->>

        const invalid = this.invalidate(player, true);
        if (invalid) {
            return invalid;
        }

        if (this.moves <= 0) {
            return `${this} is out of moves.`;
        }

        if (!tile) {
            return `${tile} is not a valid tile to move to.`;
        }

        if (tile.beaver) {
            return `${tile} is already occupied by ${tile.beaver}.`;
        }

        if (tile.lodgeOwner) {
            return `${tile} contains a lodge.`;
        }

        if (tile.spawner) {
            return `${tile} contains ${tile.spawner}.`;
        }

        const movementCost = this.tile!.getMovementCost(tile);
        if (isNaN(movementCost)) {
            return `${tile} is not adjacent to ${this.tile}`;
        }

        if (this.moves < movementCost) {
            return `${tile} costs ${movementCost} to reach, and ${this} only has ${this.moves} moves.`;
        }

        // <<-- /Creer-Merge: invalidate-move -->>
        return arguments;
    }

    /**
     * Moves this Beaver from its current Tile to an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile this Beaver should move to.
     * @returns True if the move worked, false otherwise.
     */
    protected async move(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        // calculate movement cost before moving
        const cost = this.tile!.getMovementCost(tile);

        // update target tile's beaver to this beaver
        tile.beaver = this;

        // remove me from the time I was on
        this.tile!.beaver = undefined;

        // update this beaver's tile to target tile
        this.tile = tile;

        // finally decrement this beaver's moves count by the move cost
        this.moves -= cost;

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for pickup. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to pickup branches/food from. Must be the same
     * Tile that the Beaver is on, or an adjacent one.
     * @param resource - The type of resource to pickup ('branches' or 'food').
     * @param amount - The amount of the resource to drop, numbers <= 0 will
     * pickup all of the resource type.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidatePickup(
        player: Player,
        tile: Tile,
        resource: "branches" | "food",
        amount: number = 0,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-pickup -->>

        const invalid = this.invalidate(player);
        if (invalid) {
            return invalid;
        }

        if (!tile) {
            return `${tile} is not a valid tile to pick up resources from.`;
        }

        if (this.tile !== tile && !this.tile!.hasNeighbor(tile)) {
            return `${tile} is not the adjacent to or equal to the tile ${this} is on (${this.tile})`;
        }

        if (tile.spawner) {
            return `${tile} has ${tile.spawner} on it, and cannot have resources picked up from it.`;
        }

        // transform the resource into the first, lower cased, character.
        // We only need to know 'f' vs 'b' to tell what resource type.
        const char = resource[0].toLowerCase();

        if (char !== "f" && char !== "b") {
            return `${resource} is not a valid resource to pick up.`;
        }

        // now clean the actual resource
        const res = char === "f"
            ? "food"
            : "branches";
        resource = res;

        // Calculate max resources the beaver can carry.
        const spaceAvailable = this.job.carryLimit - this.branches - this.food;

        // Transform the amount if they passed in a number =< 0
        if (amount <= 0) {
            amount = Math.min(tile[res], spaceAvailable);
        }

        if (amount <= 0) {
            return `${this} cannot pick up ${amount} of ${resource}`;
        }

        if (amount > tile[res]) {
            return `${tile} does not have ${amount} ${resource} to pick up.`;
        }

        if (amount > spaceAvailable) {
            return (
                `${this} cannot carry ${amount} of ${resource} because it `
                + `only can carry ${spaceAvailable} more resources`
            );
        }

        // <<-- /Creer-Merge: invalidate-pickup -->>
        return arguments;
    }

    /**
     * Picks up some branches or food on the beaver's tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to pickup branches/food from. Must be the same
     * Tile that the Beaver is on, or an adjacent one.
     * @param resource - The type of resource to pickup ('branches' or 'food').
     * @param amount - The amount of the resource to drop, numbers <= 0 will
     * pickup all of the resource type.
     * @returns True if successfully picked up a resource, false otherwise.
     */
    protected async pickup(
        player: Player,
        tile: Tile,
        resource: "branches" | "food",
        amount: number = 0,
    ): Promise<boolean> {
        // <<-- Creer-Merge: pickup -->>

        tile[resource] -= amount;
        this[resource] += amount;
        this.actions--;

        // if the tile is a lodge, and it has reached 0 branches, it is no longer a lodge
        if (tile.lodgeOwner && tile.branches === 0) {
            const lodgeOwner = tile.lodgeOwner;
            removeElements(lodgeOwner.lodges, tile);
            tile.lodgeOwner = undefined;
            lodgeOwner.calculateBranchesToBuildLodge();
        }

        return true;

        // <<-- /Creer-Merge: pickup -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Tries to invalidate args for an action function
     *
     * @param player - the player commanding this Beaver
     * @param dontCheckActions - pass true to not check if the beaver has enough actions
     * @returns The reason this is invalid, undefined if looks valid so far
     */
    private invalidate(
        player: Player,
        dontCheckActions?: true,
    ): string | undefined {
        if (!player || player !== this.game.currentPlayer) {
            return `${player} it is not your turn.`;
        }

        if (this.owner !== player) {
            return `${this} is not owned by you.`;
        }

        if (this.health <= 0) {
            return `${this} is dead.`;
        }

        if (this.turnsDistracted > 0) {
            return `${this} is distracted for ${this.turnsDistracted} more turns.`;
        }

        if (!this.recruited) {
            return `${this} is still being recruited and cannot be ordered yet.`;
        }

        if (!dontCheckActions && this.actions <= 0) {
            return `${this} does not have any actions left.`;
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

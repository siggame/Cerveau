import { IBaseGameObjectRequiredData } from "~/core/game";
import { IUnitAttackArgs, IUnitMineArgs, IUnitMoveArgs, IUnitOpenArgs,
         IUnitProperties, IUnitShootDownArgs, IUnitTransferArgs } from "./";
import { Body } from "./body";
import { GameObject } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Projectile } from "./projectile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A unit in the game. May be a corvette, missleboat, martyr, transport, miner.
 */
export class Unit extends GameObject {
    /**
     * Whether or not this Unit has performed its action this turn.
     */
    public acted!: boolean;

    /**
     * The x value this unit is dashing to.
     */
    public dashX!: number;

    /**
     * The y value this unit is dashing to.
     */
    public dashY!: number;

    /**
     * The remaining health of a unit.
     */
    public energy!: number;

    /**
     * The amount of Generium ore carried by this unit. (0 to job carry
     * capacity - other carried items).
     */
    public genarium!: number;

    /**
     * Tracks wheither or not the ship is dashing.
     */
    public isDashing!: boolean;

    /**
     * The Job this Unit has.
     */
    public readonly job: Job;

    /**
     * The amount of Legendarium ore carried by this unit. (0 to job carry
     * capacity - other carried items).
     */
    public legendarium!: number;

    /**
     * The distance this unit can still move.
     */
    public moves!: number;

    /**
     * The amount of Mythicite carried by this unit. (0 to job carry capacity -
     * other carried items).
     */
    public mythicite!: number;

    /**
     * The Player that owns and can control this Unit.
     */
    public owner?: Player;

    /**
     * The martyr ship that is currently shielding this ship if any.
     */
    public protector?: Unit;

    /**
     * The radius of the circle this unit occupies.
     */
    public radius!: number;

    /**
     * The amount of Rarium carried by this unit. (0 to job carry capacity -
     * other carried items).
     */
    public rarium!: number;

    /**
     * The x value this unit is on.
     */
    public x!: number;

    /**
     * The y value this unit is on.
     */
    public y!: number;

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
        this.radius = 10;
        this.acted = true;
        // setup any thing you need here
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
     * @param enemy - The Unit being attacked.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateAttack(
        player: Player,
        enemy: Unit,
    ): void | string | IUnitAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // make sure the the unit is attacking a unit.
        if (!enemy) {
            return `${this} is attacking unit that doesn't exist.`;
        }
        // Handle possible coordinate invalidations here:
        if ((enemy.x < 0) || (enemy.y < 0) || enemy.x > this.game.sizeX || enemy.y > this.game.sizeY) {
            return `${this} is trying to attack a location that doesn't exist`;
        }
        // make sure the target is in range.
        if ((this.job.range + enemy.radius) <= Math.sqrt(((this.x - enemy.x) ** 2) + ((this.y - enemy.y) ** 2))) {
            return `${this} is trying to attack a location which is too far away.`;
        }
        // make sure you aren't attacking a friend.
        if (enemy.owner === player) {
            return `${this} is trying to attack the ally: ${enemy.job.title} at ${enemy.x}, ${enemy.y}`;
        }
        // Handle possible unit invalidations here:
        if (enemy.owner === undefined) {
            return `${this} is attacking a unit that has no owner. Report this to the game Devs. This is 100% a bug`;
        }
        // make sure the unit has a job.
        if (this.job === undefined) {
            return `${this} doesn't have a job. That shouldn't be possible.`;
        }

        // make sure the unit is a attacking job
        if (this.job.title !== "corvette" && this.job.title !== "missleboat") {
            return `${this} is not a unit that can attack.`;
        }

        // Check all the arguments for attack here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-attack -->>
    }

    /**
     * Attacks the specified unit.
     *
     * @param player - The player that called this.
     * @param enemy - The Unit being attacked.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, enemy: Unit): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>

        // Do different attack based on the job of the unit.
        if (this.job.title === "corvette") {
            let attackDamage = this.job.damage;

            // if enemy is protected by a martyr
            if (enemy.protector) {
                if (enemy.protector.energy > attackDamage) {
                    enemy.protector.energy -= attackDamage;
                }
                else if (enemy.protector.energy <= attackDamage) {
                    attackDamage -= enemy.protector.energy;
                    enemy.protector.energy = 0;
                    enemy.energy -= attackDamage;
                }
            }
            // if no martyr in ranges
            else {
                enemy.energy -= attackDamage;
            }

            if (enemy.energy <= 0) {
                // set unit's location to out of bounds
                enemy.x = -1;
                enemy.y = -1;
                enemy.energy = 0; // set unit's health to zero.
            }
        }
        else {
            this.manager.create.projectile({
                fuel: this.game.projectileSpeed * 3,
                owner: this.owner,
                target: enemy,
                x: this.x,
                y: this.y,
            });
        }

        // flag that the unit has acted.
        this.acted = true;

        // return that the action was successful.
        return true;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for mine. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param body - The object to be mined.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMine(
        player: Player,
        body: Body,
    ): void | string | IUnitMineArgs {
        // <<-- Creer-Merge: invalidate-mine -->>
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // make sure a body was given.
        if (!body) {
            return `Body doesn't exist`;
        }

        // make sure it is an asteroid.
        if (body.bodyType !== "asteroid") {
            return `${body} must be an asteroid!`;
        }

        // make sure the ship is a miner.
        if (this.job.title !== "miner") {
            return `${this} must be a miner ship.`;
        }

        // make sure it has some material to mine.
        if ((body.materialType === "none") || (body.amount <= 0)) {
            return `${body} does not have any materials to mine!`;
        }

        // make sure the asteroid is in range.
        if (this.job.range < Math.sqrt(this.x ** 2 + this.y ** 2)) {
            return `${this} is too far away from ${body} to mine!`;
        }

        // make sure the unit can hold things.
        if (this.job.carryLimit <= 0) {
            return `${this} cannot hold materials!`;
        }

        // make sure the unit can carry more materials.
        const currentLoad = this.genarium + this.rarium + this.legendarium +
                          this.mythicite;
        if (this.job.carryLimit <= currentLoad) {
            return `${this} cannot hold any more materials!`;
        }

        // Check all the arguments for mine here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-mine -->>
    }

    /**
     * allows a miner to mine a asteroid
     *
     * @param player - The player that called this.
     * @param body - The object to be mined.
     * @returns True if successfully acted, false otherwise.
     */
    protected async mine(player: Player, body: Body): Promise<boolean> {
        // <<-- Creer-Merge: mine -->
<<<<<<< HEAD

        // This will set the asteroids owner to the player controlling the
        // mining ship, and then will add up to the mining rate number of ore
        // to the miner.

        // Set astroid owner to player
        body.owner = player;

        // Add ore to miners
        let actualAmount = Math.min(body.amount, this.game.miningSpeed);
        const currentLoad = this.genarium + this.legendarium + this.mythicite +
                            this.rarium;

        // Makes sure amount added does not go over the carry limit
        if (this.job.carryLimit < actualAmount + currentLoad) {
            actualAmount = this.job.carryLimit - currentLoad;
        }

        // adds the corrected amount to the necessary material.
        if (body.materialType === "genarium") {
            this.genarium += actualAmount;
        }
        else if (body.materialType === "legendarium") {
            this.legendarium += actualAmount;
        }
        else if (body.materialType === "mythicite") {
            this.mythicite += actualAmount;
        }
        else if (body.materialType === "rarium") {
            this.rarium += actualAmount;
        }

        // mark the unit has acted.
        this.acted = true;

        // return the action was successful.
        return true;
=======
        
        // **********************************************************************
        // ---------------------------------------------------------- H E R E ---
        // **********************************************************************
        
        // This will set the asteroids owner to the player controlling the
        // mining ship, and then will add up to the mining rate number of ore
        // to the miner.
        
        // Set astroid owener to player
        
        Body.owner = Player
        
        // Add ore to miner
        
        // this.acted
        // this.genarium
        // this.legendarium
        // this.mythicite
        // this.rarium
        // miningSpeed
        // body.materialType
        // body.amount
        
        return false;
>>>>>>> Added comments to mine Unit.mine

        // <<-- /Creer-Merge: mine -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param x - The x value of the destination's coordinates.
     * @param y - The y value of the destination's coordinates.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMove(
        player: Player,
        x: number,
        y: number,
    ): void | string | IUnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        if ((((this.x - x) ** 2 + (this.y - y) ** 2) ** .5) > this.moves) {
            return `${this} can only move ${this.moves} distance!`;
        }

        if (x < 0 || y < 0 || x > this.game.sizeX || y > this.game.sizeY) {
            return `${this} is dead and cannot move.`;
        }

        // Check all the arguments for move here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-move -->>
    }

    /**
     * Moves this Unit from its current location to the new location specified.
     *
     * @param player - The player that called this.
     * @param x - The x value of the destination's coordinates.
     * @param y - The y value of the destination's coordinates.
     * @returns True if it moved, false otherwise.
     */
    protected async move(
        player: Player,
        x: number,
        y: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        // Add logic here for move.
        this.moves -= ((x - this.x) ** 2) + ((y - this.y) ** 2) ** .5;
        this.x = x;
        this.y = y;

        // detect collisions and flag ship, or resolve.

        // magic code that updates the units grid position.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for open. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param x - The x position of the location you wish to check.
     * @param y - The y position of the location you wish to check.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateOpen(
        player: Player,
        x: number,
        y: number,
    ): void | string | IUnitOpenArgs {
        // <<-- Creer-Merge: invalidate-open -->>
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // Check all the arguments for open here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-open -->>
    }

    /**
     * tells you if your ship can dash to that location.
     *
     * @param player - The player that called this.
     * @param x - The x position of the location you wish to check.
     * @param y - The y position of the location you wish to check.
     * @returns True if pathable by this unit, false otherwise.
     */
    protected async open(
        player: Player,
        x: number,
        y: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: open -->>

        // Add logic here for open.

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: open -->>
    }

    /**
     * Invalidation function for shootDown. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param missile - The projectile being shot down.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateShootDown(
        player: Player,
        missile: Projectile,
    ): void | string | IUnitShootDownArgs {
        // <<-- Creer-Merge: invalidate-shootDown -->>
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // if the projectile does not exist
        if (!missile) {
            return `${this} cannot shoot down a missile that does not exist.`;
        }

        // if the projectile is out of bounds of the map
        if (missile.x < 0 || missile.x > 3200 || missile.y < 0 || missile.y > 1800) {
            return `${this} cannot shoot down ${missile} which is out of bounds. Let it go.`;
        }

        // if the projectile belongs to the player trying to shoot it down
        if (missile.owner === player) {
            return `${this} is trying to shoot down ${missile} which is an ally.`;
        }

        // if this unit does not have an owner
        if (this.owner === undefined || this.owner !== player) {
            return `${this} either does not belong to you or is undefined.`;
        }

        // if this unit has already acted, it may not act again
        if (this.acted) {
            return `${this} has already acted.`;
        }

        // if this unit is NOT a corvette
        if (this.job.title !== "corvette") {
            return `${this} is not a corvette. It cannot shoot down missiles.`;
        }

        // if the projectile is out of the range of the corvette
        if (Math.sqrt((missile.x - this.x) ** 2) + ((missile.y - this.y) ** 2) > this.job.range) {
            return `${this} is too far away from the target.`;
        }

        // Check all the arguments for shootDown here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-shootDown -->>
    }

    /**
     * Attacks the specified projectile.
     *
     * @param player - The player that called this.
     * @param missile - The projectile being shot down.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async shootDown(
        player: Player,
        missile: Projectile,
    ): Promise<boolean> {
        // <<-- Creer-Merge: shootDown -->>

        // Add logic here for shootDown.

        // take the missile and push it somewhere else!
        // after doing this, the system will take care of the rest,
        // such as removing it from the projectile list.
        // thanks system!
        missile.x = -1;
        missile.y = -1;
        missile.fuel = 0;

        // the corvette has now acted
        this.acted = true;

        // logic has been added
        return true;

        // <<-- /Creer-Merge: shootDown -->>
    }

    /**
     * Invalidation function for transfer. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param unit - The unit you are grabbing the resources from.
     * @param amount - The amount of materials to you with to grab. Amounts <=
     * 0 will pick up all the materials that the unit can.
     * @param material - The material the unit will pick up. 'resource1',
     * 'resource2', or 'resource3'.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateTransfer(
        player: Player,
        unit: Unit,
        amount: number,
        material: "genarium" | "rarium" | "legendarium" | "mythicite",
    ): void | string | IUnitTransferArgs {
        // <<-- Creer-Merge: invalidate-transfer -->>

        // Check all the arguments for transfer here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // Check common invalidates
        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // Check that target ship exists
        if (!unit) {
            return `${this} can't create minerals out of thin space! The target ship doesn't exist.`;
        }

        // Check that target ship is in range
        const xDist = this.x - unit.x;
        const yDist = this.y - unit.y;
        if (Math.sqrt(xDist ** 2 + yDist ** 2) > this.job.range) {
            return `${this} is too far away to transfer materials with the target ship!`;
        }

        // Check that the ship can hold car
        if (this.job.carryLimit <= 0) {
            return `${this} cannot hold cargo!`;
        }

        // Check that the ship has space
        const currentLoad = this.genarium + this.rarium + this.legendarium + this.mythicite;
        if (currentLoad === this.job.carryLimit) {
            return `${this} already has a full cargo hold!`;
        }

        // Check that the target ship has the material
        if (unit[material] <= 0) {
            return `${unit} does not have any ${material} for ${this} to take!`;
        }

        // <<-- /Creer-Merge: invalidate-transfer -->>
    }

    /**
     * Grab materials from a friendly unit. Doesn't use a action.
     *
     * @param player - The player that called this.
     * @param unit - The unit you are grabbing the resources from.
     * @param amount - The amount of materials to you with to grab. Amounts <=
     * 0 will pick up all the materials that the unit can.
     * @param material - The material the unit will pick up. 'resource1',
     * 'resource2', or 'resource3'.
     * @returns True if successfully taken, false otherwise.
     */
    protected async transfer(
        player: Player,
        unit: Unit,
        amount: number,
        material: "genarium" | "rarium" | "legendarium" | "mythicite",
    ): Promise<boolean> {
        // <<-- Creer-Merge: transfer -->>

        // grab the resources on the ship.
        const totalResourceOnShip = unit[material];
        // grab the current materials on the ship.
        const currentLoad = this.genarium + this.rarium + this.legendarium + this.mythicite;

        // correct the acutal amount to account for a negative argument.
        let actualAmount = amount <= 0
            ? totalResourceOnShip
            : Math.min(totalResourceOnShip, amount);

        // account for carry limit.
        actualAmount = Math.min(actualAmount, this.job.carryLimit - currentLoad);

        // shift the amounts for transfer.
        unit[material] -= actualAmount;
        this[material] += actualAmount;

        // return it was successful.
        return true;

        // <<-- /Creer-Merge: transfer -->>
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

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }
        // Make sure the unit hasn't acted.
        if (checkAction && this.acted) {
            return `${this} has already acted this turn. Or not enough coffee`;
        }
        // Make sure the unit is alive.
        if (this.energy <= 0) {
            return `${this} is dead, and cannot do anything.`;
        }
    }

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

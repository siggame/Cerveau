import { BaseGameObjectRequiredData } from "~/core/game";
import {
    UnitAttackArgs,
    UnitDashArgs,
    UnitMineArgs,
    UnitMoveArgs,
    UnitProperties,
    UnitSafeArgs,
    UnitShootdownArgs,
    UnitTransferArgs,
} from "./";
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
     * The remaining health of the unit.
     */
    public energy!: number;

    /**
     * The amount of Genarium ore carried by this unit. (0 to job carry
     * capacity - other carried items).
     */
    public genarium!: number;

    /**
     * Tracks wheither or not the ship is dashing or Mining. If true, it cannot
     * do anything else.
     */
    public isBusy!: boolean;

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
     * The amount of Rarium carried by this unit. (0 to job carry capacity -
     * other carried items).
     */
    public rarium!: number;

    /**
     * The sheild that a martyr ship has.
     */
    public shield!: number;

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
        args: Readonly<
            UnitProperties & {
                // <<-- Creer-Merge: constructor-args -->>
                /** The Job to set this Unit to. */
                job: Job;
                // You can add more constructor args in here
                // <<-- /Creer-Merge: constructor-args -->>
            }
        >,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.job = args.job;
        this.acted = false;
        this.legendarium = 0;
        this.mythicite = 0;
        this.rarium = 0;
        this.genarium = 0;
        this.isBusy = false;
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
    ): void | string | UnitAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>

        // check widely consistent things.
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
        if (
            enemy.x < 0 ||
            enemy.y < 0 ||
            enemy.x > this.game.sizeX ||
            enemy.y > this.game.sizeY
        ) {
            return `${this} is trying to attack a location that doesn't exist`;
        }

        // make sure the target is in range.
        if (
            this.job.range + this.game.shipRadius <
            this.distance(this.x, this.y, enemy.x, enemy.y)
        ) {
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
        if (
            this.job.title !== "corvette" &&
            this.job.title !== "missileboat"
        ) {
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
                // damage the shield if it will absorb it all.
                if (enemy.protector.shield >= attackDamage) {
                    enemy.protector.shield -= attackDamage;
                    // if it emptied the martyr sheild, grab a new martyr.
                    enemy.protector = undefined;
                    this.game.updateProtector(enemy);
                }
                // otherwise, grab a new martyr and deal the damage to the new shield.
                // Note, there is no reasons why this should ever run.
                else if (enemy.protector.shield < attackDamage) {
                    // deal the damage and update the shield.
                    attackDamage -= enemy.protector.shield;
                    enemy.protector.shield = 0;
                    // keep cycling through protectors until the damage is gone or there is no protector.
                    while (enemy.protector !== undefined && attackDamage > 0) {
                        // if it emptied the martyr sheild, grab a new martyr.
                        this.game.updateProtector(enemy);
                        // handle shield damage
                        if (enemy.protector) {
                            // if the shield is stronger, damage the shield.
                            if (enemy.protector.shield >= attackDamage) {
                                enemy.protector.shield -= attackDamage;
                                attackDamage = 0;
                            }
                            // kill the shield and update the damage.
                            else {
                                // deal the damage and update the shield.
                                attackDamage -= enemy.protector.shield;
                                enemy.protector.shield = 0;
                            }
                        }
                    }
                    // if there is left over damage, deal it.
                    if (attackDamage > 0) {
                        enemy.energy -= attackDamage;
                    }
                }
            }
            // if no martyr in ranges
            else {
                enemy.energy -= attackDamage;
            }

            if (enemy.energy < 0) {
                // set unit's location to out of bounds
                enemy.x = -1;
                enemy.y = -1;
            }
        } else {
            // creates the missile to be fired.
            const missile: Projectile = this.manager.create.projectile({
                fuel: (this.game.projectileSpeed * this.job.range) / 100,
                owner: this.owner,
                target: enemy,
                x: this.x,
                y: this.y,
                energy: this.game.jobs[0].damage * 1,
            });

            // adds the projectiles.
            this.game.projectiles.push(missile);
            player.projectiles.push(missile);
        }

        // flag that the unit has acted.
        this.acted = true;

        // return that the action was successful.
        return true;

        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for dash. Try to find a reason why the passed in
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
    protected invalidateDash(
        player: Player,
        x: number,
        y: number,
    ): void | string | UnitDashArgs {
        // <<-- Creer-Merge: invalidate-dash -->>

        // check widely consistent things.
        const reason = this.invalidate(player, false);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // variables for ease of reference.
        const trav = this.distance(this.x, this.y, x, y);
        const cost =
            Math.ceil(trav / this.game.dashDistance) * this.game.dashCost;
        // make sure the unit can move to that locaiton.
        if (this.energy < cost) {
            return `${this} needs at least ${cost} energy to move ${trav} and it has ${this.energy}.`;
        }

        // make sure the unit is in bounds.
        if (
            x < 0 ||
            y < 0 ||
            x > this.game.sizeX ||
            y > this.game.sizeY ||
            this.energy < 0
        ) {
            return `${this} is dead and cannot move.`;
        }

        // make sure it isn't dashing through the sun zone
        if (this.collide(x, y, this.x, this.y)) {
            return `${this} cannot dash to those coordinates due to magnetic interference from the sun.`;
        }

        // Check all the arguments for dash here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-dash -->>
    }

    /**
     * Causes the unit to dash towards the designated destination.
     *
     * @param player - The player that called this.
     * @param x - The x value of the destination's coordinates.
     * @param y - The y value of the destination's coordinates.
     * @returns True if it moved, false otherwise.
     */
    protected async dash(
        player: Player,
        x: number,
        y: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: dash -->>

        // calculate  dash distance
        const dist = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);

        // Add logic here for dash.
        this.dashX = x;
        this.dashY = y;
        this.isBusy = true;
        this.acted = true;
        this.moves = 0;
        this.energy -= Math.ceil(
            this.game.dashCost * (dist / this.game.dashDistance),
        );

        // return the action was successful.
        return true;

        // <<-- /Creer-Merge: dash -->>
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
    ): void | string | UnitMineArgs {
        // <<-- Creer-Merge: invalidate-mine -->>

        // check widely consistent things.
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
        if (body.bodyType !== "asteroid" || body.amount <= 0) {
            return `${body} does not have any materials to mine!`;
        }

        // make sure the asteroid is in range.
        if (
            this.job.range + body.radius <
            this.distance(this.x, this.y, body.x, body.y)
        ) {
            return `${this} is too far away from ${body} to mine!`;
        }

        // make sure the unit can hold things.
        if (this.job.carryLimit <= 0) {
            return `${this} cannot hold materials!`;
        }

        // make sure mining of the mythicite is legal.
        if (
            this.game.currentTurn < this.game.orbitsProtected &&
            body.materialType === "mythicite"
        ) {
            return `${this} cannot mine the mythicite yet. It is protected for the first 12 turns.`;
        }

        // make sure mining of your opponent doesn't own the asteroid.
        if (body.owner !== undefined && body.owner !== player) {
            return `${this} cannot mine the asteroid as it is owned by your opponent.`;
        }

        // make sure the unit can carry more materials.
        const currentLoad =
            this.genarium + this.rarium + this.legendarium + this.mythicite;
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
        // <<-- Creer-Merge: mine -->>

        // Set the asteroids owner to the ships owner.
        body.owner = player;

        // Add ore to miner based on the mining rate vs what is in the body.
        let actualAmount = Math.min(body.amount, this.game.miningSpeed);
        const currentLoad =
            this.genarium + this.legendarium + this.mythicite + this.rarium;

        // Makes sure amount added does not go over the carry limit
        if (this.job.carryLimit < actualAmount + currentLoad) {
            actualAmount = this.job.carryLimit - currentLoad;
        }

        // adds the corrected amount to the necessary material.
        if (body.materialType === "genarium") {
            this.genarium += actualAmount;
        } else if (body.materialType === "legendarium") {
            this.legendarium += actualAmount;
        } else if (body.materialType === "mythicite") {
            this.mythicite += actualAmount;
        } else if (body.materialType === "rarium") {
            this.rarium += actualAmount;
        }

        // mark the unit has acted.
        this.acted = true;

        // make sure it can't do anything else this turn
        this.isBusy = true;
        this.dashX = this.x;
        this.dashY = this.y;
        this.moves = 0;

        // remove the mined ore from the asteroid
        body.amount -= actualAmount;

        // return the action was successful.
        return true;

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
    ): void | string | UnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>

        // check widely consistent things.
        const reason = this.invalidate(player, false);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // make sure the unit can move to that locaiton.
        if (this.distance(this.x, this.y, x, y) > this.moves) {
            return `${this} can only move ${this.moves} distance!`;
        }

        // make sure the unit is in bounds.
        if (
            this.x < 0 ||
            this.y < 0 ||
            this.x > this.game.sizeX ||
            this.y > this.game.sizeY
        ) {
            return `${this} is dead and cannot move.`;
        }

        // make sure the unit is in bounds.
        if (x < 0 || y < 0 || x > this.game.sizeX || y > this.game.sizeY) {
            return `${this} cannot move off the map.`;
        }

        // grab the sun
        const sun = this.game.bodies[2];

        // make sure it isn't moving into the sun zone
        if (
            this.distance(x, y, sun.x, sun.y) <
            sun.radius + this.game.shipRadius
        ) {
            return `${this} cannot move to those coordinates due to landing in the sun.`;
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
        this.moves -= this.distance(this.x, this.y, x, y);
        this.x = x;
        this.y = y;

        // if it is a missile boat, it can no longer fire
        if (this.job.title === "missileboat") {
            this.acted = true;
        }

        // magic code that updates the units grid position.

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for safe. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param x - The x position of the location you wish to arrive.
     * @param y - The y position of the location you wish to arrive.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSafe(
        player: Player,
        x: number,
        y: number,
    ): void | string | UnitSafeArgs {
        // <<-- Creer-Merge: invalidate-safe -->>

        // make sure the unit is in bounds.
        if (x < 0 || y < 0 || x > this.game.sizeX || y > this.game.sizeY) {
            return `${this} cannot be off of the map.`;
        }

        // make sure the unit is in bounds.
        if (
            this.x < 0 ||
            this.y < 0 ||
            this.x > this.game.sizeX ||
            this.y > this.game.sizeY
        ) {
            return `${this} is dead, why do you bother checking?`;
        }

        // Check all the arguments for safe here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-safe -->>
    }

    /**
     * tells you if your ship can move to that location from were it is without
     * clipping the sun.
     *
     * @param player - The player that called this.
     * @param x - The x position of the location you wish to arrive.
     * @param y - The y position of the location you wish to arrive.
     * @returns True if pathable by this unit, false otherwise.
     */
    protected async safe(
        player: Player,
        x: number,
        y: number,
    ): Promise<boolean> {
        // <<-- Creer-Merge: safe -->>

        // grab the sun
        const sun = this.game.bodies[2];

        // make sure it isn't moving into the sun zone
        if (
            this.distance(x, y, sun.x, sun.y) <
            sun.radius + this.game.shipRadius
        ) {
            return false;
        }

        // return that the move is safe.
        return true;

        // <<-- /Creer-Merge: safe -->>
    }

    /**
     * Invalidation function for shootdown. Try to find a reason why the passed
     * in parameters are invalid, and return a human readable string telling
     * them why it is invalid.
     *
     * @param player - The player that called this.
     * @param missile - The projectile being shot down.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateShootdown(
        player: Player,
        missile: Projectile,
    ): void | string | UnitShootdownArgs {
        // <<-- Creer-Merge: invalidate-shootdown -->>
        // check widely consistent things.
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
        if (
            missile.x < 0 ||
            missile.x > this.game.sizeX ||
            missile.y < 0 ||
            missile.y > this.game.sizeY
        ) {
            return `${this} cannot shoot down ${missile} which is out of bounds. Let it go.`;
        }

        // if the projectile belongs to the player trying to shoot it down
        if (missile.owner === player) {
            return `${this} is trying to shoot down ${missile} which is an ally.`;
        }

        // if this unit has already acted, it may not act again
        if (this.acted) {
            return `${this} has already acted.`;
        }

        // if this unit is NOT a corvette
        if (
            this.job.title !== "corvette" &&
            this.job.title !== "missileboat"
        ) {
            return `${this} is not a corvette or missileboat. It cannot shoot down missiles.`;
        }

        // if the projectile is out of the range of the corvette
        if (
            this.distance(this.x, this.y, missile.x, missile.y) >
            this.game.jobs[0].range
        ) {
            return `${this} is too far away from the target. Must be within attack range for a corvette.`;
        }

        // Check all the arguments for shootDown here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-shootdown -->>
    }

    /**
     * Attacks the specified projectile.
     *
     * @param player - The player that called this.
     * @param missile - The projectile being shot down.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async shootdown(
        player: Player,
        missile: Projectile,
    ): Promise<boolean> {
        // <<-- Creer-Merge: shootdown -->>

        // Add logic here for shootDown.
        // damage the missile.
        if (this.job.title === "corvette") {
            missile.energy -= this.job.damage;
        } else {
            missile.energy = -1;
        }

        // if the missile is dead, kill it. The only thing that dies at 0 energy.
        if (missile.energy < 0) {
            missile.x = -101;
            missile.y = -101;
            missile.fuel = 0;
        }

        // the corvette has now acted
        this.acted = true;

        // logic has been added
        return true;

        // <<-- /Creer-Merge: shootdown -->>
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
     * @param material - The material the unit will pick up. 'genarium',
     * 'rarium', 'legendarium', or 'mythicite'.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateTransfer(
        player: Player,
        unit: Unit,
        amount: number,
        material: "genarium" | "rarium" | "legendarium" | "mythicite",
    ): void | string | UnitTransferArgs {
        // <<-- Creer-Merge: invalidate-transfer -->>

        // Check all the arguments for transfer here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // Check common invalidates
        const reason = this.invalidate(player, false);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // Check that target ship exists
        if (!unit) {
            return `${this} can't create minerals out of thin space! The target ship doesn't exist.`;
        }

        // make sure you own the unit.
        if (unit.owner !== player) {
            return `${this} your opponent won't give you materials.`;
        }

        // Check that target ship is in range
        if (this.distance(this.x, this.y, unit.x, unit.y) > this.job.range) {
            return `${this} is too far away to transfer materials with the target ship!`;
        }

        // Check that the ship can hold car
        if (this.job.carryLimit <= 0) {
            return `${this} cannot hold cargo!`;
        }

        // Check that the ship has space
        const currentLoad =
            this.genarium + this.rarium + this.legendarium + this.mythicite;
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
     * @param material - The material the unit will pick up. 'genarium',
     * 'rarium', 'legendarium', or 'mythicite'.
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
        const currentLoad =
            this.genarium + this.rarium + this.legendarium + this.mythicite;

        // correct the acutal amount to account for a negative argument.
        let actualAmount =
            amount <= 0
                ? totalResourceOnShip
                : Math.min(totalResourceOnShip, amount);

        // account for carry limit.
        actualAmount = Math.min(
            actualAmount,
            this.job.carryLimit - currentLoad,
        );

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
        // make sure there is a player and it is their turn.
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        // make sure the thing is owned by the player.
        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        if (this.isBusy) {
            return `${this} cannot do anything else as it is dashing or mining.`;
        }

        // Make sure the unit hasn't acted.
        if (checkAction && this.acted) {
            return `${this} has already acted this turn.`;
        }

        // Make sure the unit is alive.
        if (this.energy < 0) {
            return `${this} is dead, and cannot do anything.`;
        }
    }

    /**
     * returns the distance between the points
     *
     * @param x1: the start x coordinate.
     * @param y1: the start y coordinate.
     * @param x2: the end x coordinate.
     * @param y2: the end y coordinate.
     *
     * @returns the distance between the points.
     */
    private distance(x1: number, y1: number, x2: number, y2: number): number {
        // grab the differences.
        const xDif = x1 - x2;
        const yDif = y1 - y2;

        // return the distance.
        return Math.sqrt(xDif ** 2 + yDif ** 2);
    }

    /**
     * detects if the given line intersects the sun.
     *
     * @param x1: the start x coordinate.
     * @param y1: the start y coordinate.
     * @param x2: the end x coordinate.
     * @param y2: the end y coordinate.
     *
     * @returns True = collide, false = no collide.
     */
    private collide(x1: number, y1: number, x2: number, y2: number): boolean {
        // grab the sun for reference.
        const sun = this.game.bodies[2];

        // grab line length
        const length = this.distance(x1, y1, x2, y2);

        // grab the length of the ship and sun.
        const minDist = sun.radius + this.game.shipRadius;

        // make sure it isn't dashing through the sun zone
        const a = y1 - y2;
        const b = x2 - x1;
        const c = x1 * y2 - x2 * y1;
        // grab the distance between the line and the circle at it's closest.
        const dist =
            Math.abs(a * sun.x + b * sun.y + c) / Math.sqrt(a ** 2 + b ** 2);
        if (dist <= minDist) {
            // grab the two bool for possible infinite line catches
            const check1 = this.distance(x1, y1, sun.x, sun.y) > length;
            const check2 = this.distance(x2, y2, sun.x, sun.y) > length;
            // if the sun is within collision distance, but further than the other end point.
            if (check1) {
                // if it collides with the other end point.
                if (this.distance(x2, y2, sun.x, sun.y) < minDist) {
                    return true;
                }
            }
            // if the sun is within collision distance, but further than the other end point.
            if (check2) {
                // if it collides with the other end point.
                if (this.distance(x1, y1, sun.x, sun.y) < minDist) {
                    return true;
                }
            }
            // if neither check is true, then it is a normal collision.
            if (!check1 && !check2) {
                return true;
            }
        }

        // return that there is no collision
        return false;
    }

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

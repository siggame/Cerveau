import { IBaseGameObjectRequiredData } from "~/core/game";
import { IUnitAttackArgs, IUnitBuildArgs, IUnitFishArgs, IUnitMineArgs,
         IUnitMoveArgs, IUnitProperties } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A unit in the game. May be a worker, zombie, ghoul, hound, abomination,
 * wraith or horseman.
 */
export class Unit extends GameObject {
    /**
     * Whether or not this Unit has performed its action this turn (attack or
     * build).
     */
    public acted!: boolean;

    /**
     * The remaining health of a unit.
     */
    public health!: number;

    /**
     * The number of moves this unit has left this turn.
     */
    public moves!: number;

    /**
     * The Player that owns and can control this Unit.
     */
    public owner?: Player;

    /**
     * The Tile this Unit is on.
     */
    public tile?: Tile;

    /**
     * The type of unit this is.
     */
    public readonly uJob!: uJob;

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
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
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
        if (this.tile !== tile.tileEast && this.tile !== tile.tileSouth &&
            this.tile !== tile.tileWest && this.tile !== tile.tileNorth) {
            return `${this} is trying to attack ${tile} which is too far away.`;
        }
        // make sure the the unit is attacking a unit.
        if (tile.unit === undefined) {
            return `${this} is attacking ${tile} that doesn't have a unit.`;
        }
        // make sure you aren't attacking a friend.
        if (tile.unit.owner === player) {
            return `${this} is trying to attack the ally: ${tile.unit} on tile ${tile}`;
        }
        // Handle possible unit invalidations here:
        if (this.owner === undefined) {
            return `${this} is attacking a unit that has no owner. Report this to the game Devs. This is 100% a bug`;
        }
        // make sure the unit has a job.
        if (this.job === undefined) {
            return `${this} doesn't have a job. That shouldn't be possible.`;
        }
        // make sure the unit hasn't moved.
        if (tile.unit.acted!) {
            // Have to ask Jake about this
            return `${this} has already moved this turn and cannot attack`;
        }

        // <<-- /Creer-Merge: invalidate-attack -->>
    }

    /**
     * Attacks an enemy tower on an adjacent tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>
        if (tile.unit === undefined) {
            throw new Error("Unit on tile is undefined.");
        }
        tile.tower.health = tile.tower.health - this.uJob.damage;
        // tile.unit.attacked = true;
        if (tile.unit.health <= 0) {
            tile.unit.health = 0; // set unit's health to zero.
            tile.unit.tile = undefined; // unlink dead unit.
            tile.unit = undefined; // Unlink tile.
        }
        this.acted = true; // unit has acted

        return true; // return true by default
        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for build. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit is on/builds on.
     * @param tJob - The type of tower that is being built. 'arrow', 'aoe',
     * 'ballista', or 'cleansing'.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateBuild(
        player: Player,
        tile: Tile,
        tJob: tJob,
    ): void | string | IUnitBuildArgs {
        // <<-- Creer-Merge: invalidate-build -->>

        // Check all the arguments for build here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        if (this.owner !== player) {
            return `${this} isn't your worker.`;
        }

        if (player !== this.game.currentPlayer) {
            return `It isn't your turn.`;
        }

        if (player.gold < this.game.towers.tJob.goldCost && player.mana < this.game.towers.tJob.manaCost) {
            return `You don't have enough gold or mana to build this tower.`;
        }

        if (tile > this.game.uJob.worker.range) {
            return `${this} wroker is not close enough to where you want to build the tower.`;
        }

        if (this.moves === 0) {
            return `${this} worker has alread used all it's moves this turn.`;
        }

        if (tile.isGoldMine) {
            return `You can not build on a gold mine.`;
        }

        if (tile.isIslandGoldMine) {
            return `You can not build on the island.`;
        }

        if (tile.isPath) {
            return `You can not build on the path.`;
        }

        if (tile.isRiver) {
            return `You can not build on the river.`;
        }

        if (tile.isTower) {
            return `You can not build ontop another tower.`;
        }

        if (tile.isWall) {
            return `You can not build on a wall.`;
        }

        // <<-- /Creer-Merge: invalidate-build -->>
    }

    /**
     * Unit, if it is a worker, builds a tower on the tile it is on, only
     * workers can do this.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit is on/builds on.
     * @param tJob - The type of tower that is being built. 'arrow', 'aoe',
     * 'ballista', or 'cleansing'.
     * @returns True if successfully built, false otherwise.
     */
    protected async build(
        player: Player,
        tile: Tile,
        tJob: tJob,
    ): Promise<boolean> {
        // <<-- Creer-Merge: build -->>

        // Add logic here for build.
        if (!tile.tower) {
            tile.tower = this.game.manager.create.tower({tile:tile,});
        }

        tile.tower = this.game.towers.tJob;
        player.gold -= this.game.towers.tJob.goldCost;
        player.mana -= this.game.towers.tJob.manaCost;

        // TODO: replace this with actual logic
        return true;

        // <<-- /Creer-Merge: build -->>
    }

    /**
     * Invalidation function for fish. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit will stand on as it fishes.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateFish(
        player: Player,
        tile: Tile,
    ): void | string | IUnitFishArgs {
        // <<-- Creer-Merge: invalidate-fish -->>

        // Check all the arguments for fish here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        

        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        if (this.acted === false) {
            return `${this} has already acted this turn.`;
        }

        if (tile.isRiver !== true){
            return `${this} unit is trying to fish on land.`;
        }

        if (!tile){
            return `Tile doesn't exist.`;
        }

        if (this.uJob.title !== "worker") {
            return `${this} must be a worker.`;
        }

        // <<-- /Creer-Merge: invalidate-fish -->>
    }

    /**
     * Stops adjacent to a river tile and begins fishing for mana.
     *
     * @param player - The player that called this.
     * @param tile - The tile the unit will stand on as it fishes.
     * @returns True if successfully began fishing for mana, false otherwise.
     */
    protected async fish(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: fish -->>

        // Add logic here for fish.
        let manaGain = 0;

        if (this.tile.isRiver){
            manaGain = this.game.manaIncomePerUnit
        }
        

        // TODO: replace this with actual logic
        return false;

        // <<-- /Creer-Merge: fish -->>
    }

    /**
     * Invalidation function for mine. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The tile the mine is located on.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateMine(
        player: Player,
        tile: Tile,
    ): void | string | IUnitMineArgs {
        // <<-- Creer-Merge: invalidate-mine -->>

        const reason = this.invalidate(player, true);
        // if there is a reason, return it.
        if (reason) {
            return reason;
        }

        // make sure tile exists
        if (!tile) {
            return `Tile does not exist`;
        }

        // make sure tile is goldmine 
        if (!tile.isGoldMine && !tile.isIslandGoldMine) {
            return `${tile} must be a gold mine!`;
        }

        // make sure unit is a worker
        if (this.uJob.title !== "worker") {
            return `${this} must be a worker`;
        }

        // make sure unit is on gold mine
        if (!(this.tile === tile)) {
            return `${this} must be on a gold mine to mine!`;
        }

        // make sure unit has not acted
        if (this.acted) {
            return `${this} has already acted!`;
        }


        // Check all the arguments for mine here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        // <<-- /Creer-Merge: invalidate-mine -->>
    }

    /**
     * Enters an empty mine tile and is put to work gathering resources.
     *
     * @param player - The player that called this.
     * @param tile - The tile the mine is located on.
     * @returns True if successfully entered mine and began mining, false
     * otherwise.
     */
    protected async mine(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: mine -->>

        let goldGain = 0;

        // Assign Gold gain based on mine type
        if (this.tile.isIslandGoldMine) {
            // Is island Gold Mine
            goldGain = this.game.islandIncomePerUnit;
        }
        else {
            // Is Normal Gold Mine
            goldGain = this.game.goldIncomePerUnit;
        }
        // Give gold to player
        this.owner.gold += goldGain;

        // Unit has acted
        this.acted = true;

        return true;

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
    ): void | string | IUnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>

        // Check all the arguments for move here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.

        //check all the reasons
        const reason = this.invalidate(player, true);

        //return the reason if tehr eis owner
        if (reason){
          return reason;
        }

        //make sure the tile is on the map
        if (!tile){
          return '${this}, unit cannot plane shift, tile does not exist in this plane.';
        }

        //make sure there are moves left
        if (this.moves<= 0){
          return '${this} has no more moves and might fall apart!';
        }

        //make sure tile is part of the path
        if (!tile.isPath){
          return '${this}, going off the path is dangerous.';
        }

        //make sure tile is not a river tile
        if (tile.isRiver){
          return '${this} cannot swim.';
        }

        //make sure tile isnt occu[ied by a different unit type
        if (tile.unit != this.unit){
          return '${this} cannot cut in line.';
        }

        //make sure tile isnt a tower
        if (tile.isTower){
          return '${this} cannot hide in the tower.';
        }

        //make sure tile isnt a wall
        if (tile.isWall){
          return '${this} cannot move through, under, over or around walls..we are sorry.'
        }

        /*Still need check for unit count on tile, possibly for goldmine tiles
         not sure how to differentiate jobs just yet, i'm sure i missed something
         else super game breaking */

        return;
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
        /*This is the code from Newtonian, I think it might still work,
        could use help on how to add to unit count if unit moves to tile already
        occupied */
        // <<-- /Creer-Merge: move -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}
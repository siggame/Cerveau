import { BaseGameObjectRequiredData } from "~/core/game";
import {
    UnitAttackArgs,
    UnitBuildArgs,
    UnitFishArgs,
    UnitMineArgs,
    UnitMoveArgs,
    UnitProperties,
} from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { UnitJob } from "./unit-job";

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
     * The type of unit this is.
     */
    public readonly job: UnitJob;

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
                /** The job to assign this new Unit to */
                job: UnitJob;
                // <<-- /Creer-Merge: constructor-args -->>
            }
        >,
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
    ): void | string | UnitAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>

        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (!this) {
            return `This unit does not exist!`;
        }

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        // Make sure the unit hasn't acted.
        if (this.acted) {
            return `${this} has already acted this turn.`;
        }

        // Make sure the unit is alive.
        if (this.health <= 0) {
            return `${this} is dead, for now.`;
        }

        // Make sure the unit is on a tile.
        if (!this.tile) {
            return `${this} is not on a tile.`;
        }

        // Make sure the tile exists.
        if (!tile) {
            return `${this} is trying to attack a tile that doesn't exist`;
        }

        // Make sure the tile is in range.
        if (
            this.tile !== tile.tileEast &&
            this.tile !== tile.tileSouth &&
            this.tile !== tile.tileWest &&
            this.tile !== tile.tileNorth
        ) {
            return `${this} is trying to attack ${tile}, which is too far away.`;
        }

        // Make sure the the unit is attacking a tower.
        if (!tile.tower) {
            return `${this} is attacking ${tile}, which doesn't have a tower.`;
        }

        // Make sure you aren't attacking a friendly tower.
        if (tile.tower.owner === player) {
            return `${this} is trying to attack the allied tower: ${tile.tower} on tile ${tile}`;
        }

        // Handle possible unit invalidations here:
        if (this.owner === undefined) {
            return `${this} is attacking a unit that has no owner. Report this to the game Devs. This is 100% a bug`;
        }

        //  Make sure the unit has a job.
        if (this.job === undefined) {
            return `${this} doesn't have a job. That shouldn't be possible.`;
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
        // TS thinks this could be undefined despite the invalidate for some reason, so we check it again.
        if (!tile.tower) {
            return false;
        }

        tile.tower.health -= this.job.damage;
        if (tile.tower.health <= 0) {
            player.towerKills++;
        }

        this.acted = true;

        return true;
        // <<-- /Creer-Merge: attack -->>
    }

    /**
     * Invalidation function for build. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param title - The tower type to build, as a string.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateBuild(
        player: Player,
        title: string,
    ): void | string | UnitBuildArgs {
        // <<-- Creer-Merge: invalidate-build -->>
        let towerIndex = -1;

        if (title === "arrow") {
            towerIndex = 1;
        } else if (title === "ballista") {
            towerIndex = 2;
        } else if (title === "cleansing") {
            towerIndex = 3;
        } else if (title === "aoe") {
            towerIndex = 4;
        }

        if (towerIndex === -1) {
            return `Invalid tower type!`;
        }

        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (!this) {
            return `This unit does not exist!`;
        }

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        // Make sure the unit hasn't acted.
        if (this.acted) {
            return `${this} has already acted this turn.`;
        }

        // Make sure the unit is alive.
        if (this.health <= 0) {
            return `${this} is dead, for now.`;
        }

        // Make sure the unit is on a tile.
        if (!this.tile) {
            return `${this} is not on a tile.`;
        }

        if (
            player.gold < this.game.towerJobs[towerIndex].goldCost ||
            player.mana < this.game.towerJobs[towerIndex].manaCost
        ) {
            return `You don't have enough gold or mana to build this tower.`;
        }

        if (this.tile !== this.tile) {
            return `${this} must be on the target tile to build!`;
        }

        if (this.tile.isGoldMine) {
            return `You can not build on a gold mine.`;
        }

        if (this.tile.isIslandGoldMine) {
            return `You can not build on the island.`;
        }

        if (this.tile.isPath) {
            return `You can not build on the path.`;
        }

        if (this.tile.isRiver) {
            return `You can not build on the river.`;
        }

        if (this.tile.isTower) {
            return `You can not build on top another tower.`;
        }

        if (this.tile.isWall) {
            return `You can not build on a wall.`;
        }

        // <<-- /Creer-Merge: invalidate-build -->>
    }

    /**
     * Unit, if it is a worker, builds a tower on the tile it is on, only
     * workers can do this.
     *
     * @param player - The player that called this.
     * @param title - The tower type to build, as a string.
     * @returns True if successfully built, false otherwise.
     */
    protected async build(player: Player, title: string): Promise<boolean> {
        // <<-- Creer-Merge: build -->>
        if (!this.tile) {
            return false;
        }

        let towerIndex = -1;

        if (title === "arrow") {
            towerIndex = 1;
        } else if (title === "ballista") {
            towerIndex = 2;
        } else if (title === "cleansing") {
            towerIndex = 3;
        } else if (title === "aoe") {
            towerIndex = 4;
        }

        this.tile.tower = this.game.manager.create.tower({
            owner: player,
            attacked: false,
            health: this.game.towerJobs[towerIndex].health,
            job: this.game.towerJobs[towerIndex],
            tile: this.tile,
            cooldown: 0,
        });

        this.game.towers.push(this.tile.tower);

        player.towers.push(this.tile.tower);

        this.tile.isTower = true;

        player.gold -= this.game.towerJobs[towerIndex].goldCost;
        player.mana -= this.game.towerJobs[towerIndex].manaCost;

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
    ): void | string | UnitFishArgs {
        // <<-- Creer-Merge: invalidate-fish -->>
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        if (this.acted) {
            return `${this} has already acted this turn.`;
        }

        if (!this.tile) {
            return `${this} is not on a tile! Could they be behind you..?`;
        }

        if (
            !(
                (this.tile.tileEast && this.tile.tileEast.isRiver) ||
                (this.tile.tileWest && this.tile.tileWest.isRiver) ||
                (this.tile.tileNorth && this.tile.tileNorth.isRiver) ||
                (this.tile.tileSouth && this.tile.tileSouth.isRiver)
            )
        ) {
            return `${this} is not near any river tiles!`;
        }

        if (!tile.isRiver) {
            return `${this} unit is trying to fish on land.`;
        }

        if (!tile) {
            return `Target tile does not exist.`;
        }

        if (this.job.title !== "worker") {
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
        this.acted = true;

        player.mana += this.game.manaIncomePerUnit;

        return true;
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
    ): void | string | UnitMineArgs {
        // <<-- Creer-Merge: invalidate-mine -->>
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        if (this.acted) {
            return `${this} has already acted this turn.`;
        }

        if (!this.tile) {
            return `${this} is not on a tile! Could they be behind you..?`;
        }

        if (tile !== this.tile) {
            return `${this} must be standing in the gold mine!`;
        }

        if (!tile.isGoldMine && !tile.isIslandGoldMine) {
            return `${tile} must be a gold mine!`;
        }

        if (!tile.unit) {
            return `You are not on the target tile!`;
        }

        if (tile.unit.owner !== player) {
            return `You are trying to mine where another player's unit is!`;
        }

        // Make sure unit is a worker
        if (this.job.title !== "worker") {
            return `${this} must be a worker to mine!`;
        }
        // <<-- /Creer-Merge: invalidate-mine -->>
    }

    /**
     * Enters a mine and is put to work gathering resources.
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
        // tslint:disable-next-line:prefer-conditional-expression
        if (this.tile && this.tile.isIslandGoldMine) {
            // Is island Gold Mine
            goldGain = this.game.islandIncomePerUnit;
        } else {
            // Is Normal Gold Mine
            goldGain = this.game.goldIncomePerUnit;
        }

        // Give gold to player
        player.gold += goldGain;

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
    ): void | string | UnitMoveArgs {
        // <<-- Creer-Merge: invalidate-move -->>
        if (!player || player !== this.game.currentPlayer) {
            return `It isn't your turn, ${player}.`;
        }

        if (this.owner !== player || this.owner === undefined) {
            return `${this} isn't owned by you.`;
        }

        if (this.acted) {
            return `${this} has already acted this turn.`;
        }

        if (!this.tile) {
            return `${this} is not on a tile! Could they be behind you..?`;
        }

        if (
            tile !== this.tile.tileEast &&
            tile !== this.tile.tileWest &&
            tile !== this.tile.tileNorth &&
            tile !== this.tile.tileSouth
        ) {
            return `${this} cannot move to a non-adjacent tile!`;
        }

        // Make sure the tile is on the map
        if (!tile) {
            return `${this}, unit cannot plane shift, tile does not exist in this plane.`;
        }

        // Make sure there are moves left
        if (this.moves <= 0) {
            return `${this} has no more moves and might fall apart!`;
        }

        // Make both players don't own the tile
        if (
            this.job.title === "worker" &&
            tile.owner === this.owner.opponent
        ) {
            return `${this} cannot walk on the enemies side!`;
        }

        // Make sure tile is part of the path
        if (!tile.isPath && this.job.title !== "worker") {
            return `${this}, going off the path is dangerous!`;
        }

        // Or, make sure it isn't for workers
        if (tile.isPath && this.job.title === "worker") {
            return `${this}, workers are not allowed on the path!`;
        }

        // Make sure tile is not a river tile
        if (tile.isRiver) {
            return `${this} cannot swim.`;
        }

        // Make sure tile isnt occupied by a different unit type
        if (tile.unit) {
            if (tile.unit.job !== this.job) {
                return `${this} is not allowed to walk on ${tile.unit}!`;
            } else {
                if (
                    (this.job.title === "zombie" &&
                        tile.numZombies >= this.game.unitJobs[1].perTile) ||
                    (this.job.title === "hound" &&
                        tile.numHounds >= this.game.unitJobs[4].perTile) ||
                    (this.job.title === "ghoul" &&
                        tile.numGhouls >= this.game.unitJobs[2].perTile)
                ) {
                    return `${this} cannot walk on a fully occupied tile!`;
                }
                if (
                    this.job.title === "worker" ||
                    this.job.title === "abomination" ||
                    this.job.title === "horseman" ||
                    this.job.title === "wraith"
                ) {
                    return `${this} cannot walk on an occupied tile!`;
                }
            }
        }

        // Make sure tile isnt a tower
        if (tile.isTower) {
            return `${this} cannot hide in the tower.`;
        }

        // Make sure tile isnt a wall
        if (tile.isWall) {
            return `${this} cannot move through, under, over or around walls..we are sorry.`;
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

        // Add logic here for move.

        if (!this.tile) {
            return false;
        }

        if (this.job.title === "ghoul") {
            tile.numGhouls++;
            this.tile.numGhouls--;
        } else if (this.job.title === "hound") {
            tile.numHounds++;
            this.tile.numHounds--;
        } else if (this.job.title === "zombie") {
            tile.numZombies++;
            this.tile.numZombies--;
        }

        this.tile.unit = player.units.find(
            (unit) => unit !== this && unit.tile === this.tile,
        );
        this.tile = tile;
        tile.unit = this;
        this.moves -= 1;

        return true;
        // <<-- /Creer-Merge: move -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, CoreminerGame, CoreminerGameObjectFactory, Unit } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
import { removeElements } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Coreminer Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class CoreminerGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-25-Coreminer",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: CoreminerGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: CoreminerGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    // any additional public methods you need can be added here

    // <<-- /Creer-Merge: public-methods -->>

    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        await super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>
        // add logic here for before the current player's turn starts
        // <<-- /Creer-Merge: before-turn -->>
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to end-of-turn effects, and clean up arrays.
     */
    protected async afterTurn(): Promise<void> {
        await super.afterTurn();
        // <<-- Creer-Merge: after-turn -->>

        this.updateUnits();

        this.updateGravity();

        this.updateHoppers();

        // clean up dead units
        this.updateArrays();
        // <<-- /Creer-Merge: after-turn -->>
    }

    /**
     * Checks if the game is over in between turns.
     * This is invoked AFTER afterTurn() is called, but BEFORE beforeTurn()
     * is called.
     *
     * @returns True if the game is indeed over, otherwise if the game
     * should continue return false.
     */
    protected primaryWinConditionsCheck(): boolean {
        super.primaryWinConditionsCheck();

        // <<-- Creer-Merge: primary-win-conditions -->>
        const winners = this.game.players.filter((player) => player.value >= this.game.victoryAmount);

        if (winners.length === this.game.players.length) {
            this.secondaryWinConditions("Both players qualified for a promotion!");

            return true;
        }

        if (winners.length === 1) {
            this.declareWinner("Your performance has earned you a promotion!", winners[0]);
            this.declareLoser("Your opponent has earned a promotion.", winners[0].opponent);

            return true;
        }
        // <<-- /Creer-Merge: primary-win-conditions -->>

        return false; // If we get here no one won on this turn.
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryWinConditions(reason: string): void {
        // <<-- Creer-Merge: secondary-win-conditions -->>
        const winners = this.game.players.sort((a, b) => b.value - a.value);

        if (winners[0].value !== winners[1].value) {
            this.declareWinner(`${reason}: You were more valuable to the company.`, winners[0]);
            this.declareLoser(`${reason}: Your opponent was more valuable to the company.`, winners[1]);

            return;
        }
        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    /** Updates all arrays in the game with new/dead game objects */
    private updateArrays(): void {
        // Properly remove all killed units
        const deadUnits = this.game.units.filter((u) => !u.tile || u.health <= 0);

        // remove dead units from all player's units list
        for (const player of this.game.players) {
            removeElements(player.units, ...deadUnits);
        }
        // and remove them from the game
        removeElements(this.game.units, ...deadUnits);
         // mark them dead
        for (const unit of deadUnits) {
            if (unit.tile) {
                removeElements(unit.tile.units, unit);
                unit.tile = undefined;
            }
        }
    }

    /** Updates all units */
    private updateUnits(): void {
        const bombsToUpdate = [];
        for (const unit of this.game.units) {
            if (!unit.tile) {
                continue;
            }

            if (unit.job.title === this.game.jobs[0].title) {
                // Handle miners
                if (unit.owner === this.game.currentPlayer) {
                    unit.miningPower = unit.maxMiningPower;
                    unit.moves = unit.maxMoves;
                }

                if (unit.tile && unit.tile.owner === unit.owner) {
                    unit.health = unit.maxHealth;
                }
            }
            else if (unit.job.title === this.game.jobs[1].title) {
                if (unit.owner === this.game.currentPlayer.opponent) {
                    bombsToUpdate.push(unit);
                }
            }
        }

        // Update any bombs
        if (bombsToUpdate.length > 0) {
            this.updateBombs(bombsToUpdate);
        }
    }

    /** Explodes bombs
     * @param bombs The bombs to blow up.
     */
    private updateBombs(bombs: Unit[]): void {
        const bombsToUpdate: Unit[] = [];

        // Bombs can kill units without health upgrades
        const dmg = this.game.jobs[0].health[0];

        for (const bomb of bombs) {
            // Destroy bomb
            bomb.health = 0;

            if (!bomb.tile) {
                return;
            }

            // Destroy current tile
            bomb.tile.dirt = 0;
            bomb.tile.ore = 0;

            // Shockwave on bombed tile does double damage
            for (const bystander of bomb.tile.units) {
                if (bystander.job.title === this.game.jobs[0].title) {
                    bystander.health = Math.max(0, bystander.health - (dmg * 2));
                }
                else if (bystander !== bomb && bystander.job.title === this.game.jobs[1].title) {
                    // Chain reaction explosion
                    if (bombs.indexOf(bystander) >= 0 && bombsToUpdate.indexOf(bystander) >= 0) {
                        bombsToUpdate.push(bystander);
                    }
                }
            }

            // Destroy neighboring tiles and send out shockwave
            for (const tile of bomb.tile.getNeighbors()) {
                tile.dirt = 0;
                tile.ore = 0;

                // Shockwave in a direction
                if (tile === bomb.tile.tileNorth) {
                    let shockTile = tile;
                    while (shockTile.dirt + shockTile.ore <= 0) {
                        for (const bystander of shockTile.units) {
                            if (bystander.job.title === this.game.jobs[0].title) {
                                bystander.health = Math.max(0, bystander.health - (dmg * 2));
                            }
                            else if (bystander !== bomb && bystander.job.title === this.game.jobs[1].title) {
                                // Chain reaction explosion
                                if (bombs.indexOf(bystander) >= 0 && bombsToUpdate.indexOf(bystander) >= 0) {
                                    bombsToUpdate.push(bystander);
                                }
                            }
                        }
                        if (shockTile.tileNorth) {
                            shockTile = shockTile.tileNorth;
                        }
                        else {
                            break;
                        }
                    }
                }
                else if (tile === bomb.tile.tileEast) {
                    let shockTile = tile;
                    while (shockTile.dirt + shockTile.ore <= 0) {
                        for (const bystander of shockTile.units) {
                            if (bystander.job.title === this.game.jobs[0].title) {
                                bystander.health = Math.max(0, bystander.health - (dmg * 2));
                            }
                            else if (bystander !== bomb && bystander.job.title === this.game.jobs[1].title) {
                                // Chain reaction explosion
                                if (bombs.indexOf(bystander) >= 0 && bombsToUpdate.indexOf(bystander) >= 0) {
                                    bombsToUpdate.push(bystander);
                                }
                            }
                        }
                        if (shockTile.tileEast) {
                            shockTile = shockTile.tileEast;
                        }
                        else {
                            break;
                        }
                    }
                }
                else if (tile === bomb.tile.tileSouth) {
                    let shockTile = tile;
                    while (shockTile.dirt + shockTile.ore <= 0) {
                        for (const bystander of shockTile.units) {
                            if (bystander.job.title === this.game.jobs[0].title) {
                                bystander.health = Math.max(0, bystander.health - (dmg * 2));
                            }
                            else if (bystander !== bomb && bystander.job.title === this.game.jobs[1].title) {
                                // Chain reaction explosion
                                if (bombs.indexOf(bystander) >= 0 && bombsToUpdate.indexOf(bystander) >= 0) {
                                    bombsToUpdate.push(bystander);
                                }
                            }
                        }
                        if (shockTile.tileSouth) {
                            shockTile = shockTile.tileSouth;
                        }
                        else {
                            break;
                        }
                    }
                }
                else if (tile === bomb.tile.tileWest) {
                    let shockTile = tile;
                    while (shockTile.dirt + shockTile.ore <= 0) {
                        for (const bystander of shockTile.units) {
                            if (bystander.job.title === this.game.jobs[0].title) {
                                bystander.health = Math.max(0, bystander.health - (dmg * 2));
                            }
                            else if (bystander !== bomb && bystander.job.title === this.game.jobs[1].title) {
                                // Chain reaction explosion
                                if (bombs.indexOf(bystander) >= 0 && bombsToUpdate.indexOf(bystander) >= 0) {
                                    bombsToUpdate.push(bystander);
                                }
                            }
                        }
                        if (shockTile.tileWest) {
                            shockTile = shockTile.tileWest;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }

        // Update any triggered bombs that aren't blown up already
        bombsToUpdate.filter((bomb) => bomb.health > 0);
        if (bombsToUpdate.length > 0) {
            this.updateBombs(bombsToUpdate);
        }
    }

    /** Updates all falling tiles */
    private updateGravity(): void {
        while (this.game.fallingTiles.length > 0) {
            const tile = this.game.fallingTiles[this.game.fallingTiles.length - 1];
            if (tile.tileSouth) {
                let willFall = true;
                // Supports prevent falling
                if (tile.tileSouth.isSupport) {
                    willFall = false;
                }
                else if (tile.tileSouth.tileEast && tile.tileSouth.tileEast.isSupport) {
                    willFall = false;
                }
                else if (tile.tileSouth.tileWest && tile.tileSouth.tileWest.isSupport) {
                    willFall = false;
                }

                if (willFall) {
                    // Fall logic
                    let curTile = tile;
                    while (curTile.tileSouth && !curTile.tileSouth.isSupport &&
                        curTile.tileSouth.dirt + curTile.tileSouth.ore <= 0) {
                        curTile.tileSouth.ore = curTile.ore;
                        curTile.tileSouth.dirt = curTile.dirt;
                        curTile.ore = 0;
                        curTile.dirt = 0;
                        curTile.isFalling = false;
                        curTile = curTile.tileSouth;
                    }
                }
            }
            this.game.fallingTiles.pop();
        }
    }

    /** Updates all hopper extensions */
    private updateHoppers(): void {
        const currPlayer = this.game.currentPlayer;
        if (currPlayer.hopperTiles.length === 0) {
            // no hoppers, check from base tile
            const nextHopperPos = this.game.currentPlayer.baseTile.tileSouth;
            if (nextHopperPos === undefined) {
                // there is no space for hoppers in this map
                return;
            }
            if (nextHopperPos.dirt === 0 && nextHopperPos.ore === 0) {
                nextHopperPos.isHopper = true;
                currPlayer.hopperTiles.push(nextHopperPos);
            }
        }

        if (currPlayer.hopperTiles.length > 0) {
            // try to extend hoppers
            let nextHopperPos = currPlayer.hopperTiles[currPlayer.hopperTiles.length - 1].tileSouth;
            while (nextHopperPos !== undefined) {
                if (nextHopperPos.ore === 0 && nextHopperPos.dirt === 0) {
                    nextHopperPos.isHopper = true;
                    nextHopperPos = nextHopperPos.tileSouth;
                }
                else {
                    return;
                }
            }
        }
    }
    // <<-- /Creer-Merge: protected-private-methods -->>
}

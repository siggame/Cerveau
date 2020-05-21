// This file is where you should put logic to control the game and everything
// around it.
import {
    BaseClasses,
    CatastropheGame,
    CatastropheGameObjectFactory,
} from "./";

// <<-- Creer-Merge: imports -->>
import { removeElements } from "~/utils";
import { Player } from "./player";
import { Tile } from "./tile";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Catastrophe Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class CatastropheGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-20-Catastrophe",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: CatastropheGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: CatastropheGameObjectFactory;

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
        this.updateArrays();
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
        this.updateArrays();
        this.updateUnits();
        this.updateResources();
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

        const players = this.game.players.slice();

        // Primary win conditions: defeat enemy cat or defeat all enemy humans

        // 1. enemy cats defeated
        players.sort((a, b) => b.cat.energy - a.cat.energy);
        if (players[0].cat.energy <= 0) {
            this.secondaryWinConditions(
                "Both players' cats defeated at the same time.",
            );

            return true;
        } else if (players[1].cat.energy <= 0) {
            const winner = players.shift() as Player;
            this.declareWinner("Defeated opponent's cat!", winner);
            this.declareLosers("Cat died", ...players);

            return true;
        }

        // 2. All humans died.
        players.sort((a, b) => b.units.length - a.units.length);
        if (players[0].units.length === 1) {
            this.secondaryWinConditions("All units died for both players.");

            return true;
        } else if (players[1].units.length === 1) {
            const winner = players.shift() as Player;
            this.declareWinner("Defeated all enemy humans!", winner);
            this.declareLosers("Humans died", ...players);

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

        const players = this.game.players.slice();

        // 1. Most units
        players.sort((a, b) => b.units.length - a.units.length);
        if (players[0].units.length > players[1].units.length) {
            const winner = players.shift() as Player;
            this.declareWinner(`${reason}: Had the most units`, winner);
            this.declareLosers(`${reason}: Had the least units`, ...players);

            return;
        }

        // 2. Most food
        players.sort((a, b) => b.food - a.food);
        if (players[0].food > players[1].food) {
            const winner = players.shift() as Player;
            this.declareWinner(`${reason}: Had the most food`, winner);
            this.declareLosers(`${reason}: Had the least food`, ...players);

            return;
        }

        // 3. Most structures
        players.sort((a, b) => b.structures.length - a.structures.length);
        if (players[0].structures.length > players[1].structures.length) {
            const winner = players.shift() as Player;
            this.declareWinner(`${reason}: Had the most structures`, winner);
            this.declareLosers(
                `${reason}: Had the least structures`,
                ...players,
            );

            return;
        }

        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    /** Updates all arrays in the game with new/dead game objects */
    private updateArrays(): void {
        // Add new structures
        for (const structure of this.game.newStructures) {
            this.game.structures.push(structure);
            if (structure.owner) {
                structure.owner.structures.push(structure);
            }
        }
        this.game.newStructures.length = 0;

        // Properly remove all destroyed structures
        for (let i = 0; i < this.game.structures.length; i++) {
            const structure = this.game.structures[i];
            if (!structure.tile) {
                if (structure.owner) {
                    // Remove this structure from the player's structures array
                    removeElements(structure.owner.structures, structure);
                }

                // Remove this structure from the game's structures array
                this.game.structures.splice(i, 1);
                i--; // Make sure we don't skip an element
            }
        }

        // Properly remove all killed units
        for (let i = 0; i < this.game.units.length; i++) {
            const unit = this.game.units[i];
            if (!unit.tile || unit.turnsToDie === 0) {
                if (unit.tile) {
                    unit.tile.unit = undefined;
                    unit.tile = undefined;
                }

                if (unit.owner) {
                    // Remove this unit from the player's units array
                    removeElements(unit.owner.units, unit);
                }

                // Remove this unit from the game's units array
                this.game.units.splice(i, 1);
                i--; // Make sure we don't skip an element
            }
        }
    }

    /** Updates all the units in the game */
    private updateUnits(): void {
        // Reset all upkeeps
        for (const player of this.game.players) {
            player.upkeep = 0;

            // Remove all defeated units from their units list
            removeElements(player.units, ...player.defeatedUnits);
            player.defeatedUnits.length = 0;

            // Add all new units to their units list
            player.units.push(...player.newUnits);
            player.newUnits.length = 0;
        }

        // Iterate through all units
        for (const unit of this.game.units) {
            if (!unit.owner || unit.owner === this.game.currentPlayer) {
                unit.acted = false;
                unit.moves = unit.job.moves;
                unit.starving = false;
            }

            if (unit.owner) {
                // Add this unit's upkeep to the player's total upkeep
                unit.owner.upkeep += unit.job.upkeep;
            } else {
                // Neutral fresh humans
                if (unit.turnsToDie > 0) {
                    unit.turnsToDie--;
                }

                const target = unit.movementTarget;
                if (target && unit.tile) {
                    // Move neutral fresh humans on the road
                    const nextTile = this.game.getTile(
                        unit.tile.x + Math.sign(target.x - unit.tile.x),
                        unit.tile.y,
                    );
                    if (nextTile && !nextTile.unit) {
                        unit.tile.unit = undefined;
                        nextTile.unit = unit;
                        unit.tile = nextTile;
                    }
                }
            }
        }

        // Check if new fresh humans should walk across the road
        if (this.game.currentTurn % this.game.turnsToCreateHuman === 0) {
            // Spawn two new fresh humans
            let tile: Tile | undefined;

            // Search for a valid spawning tile
            for (let x = 0; x < this.game.mapWidth; x++) {
                tile = this.game.getTile(x, this.game.mapHeight / 2 - 1);
                if (tile && !tile.unit) {
                    break;
                }
            }

            if (!tile) {
                // this should never happen
                throw new Error("No tile could be found for unit to spawn.");
            }

            // If one was found (as in, not a map-wide line of units), spawn a new fresh human
            if (!tile.unit) {
                const unit = this.create.unit({
                    job: this.game.jobs[0],
                    owner: undefined,
                    tile,
                    turnsToDie: this.game.mapWidth - tile.x,
                    movementTarget: this.game.getTile(
                        this.game.mapWidth - 1,
                        this.game.mapHeight / 2 - 1,
                    ),
                });
                unit.tile.unit = unit;
            }
        } else if (
            this.game.currentTurn % this.game.turnsToCreateHuman ===
            1
        ) {
            let tile;

            // Search for a valid spawning tile
            for (let x = this.game.mapWidth - 1; x >= 0; x--) {
                tile = this.game.getTile(x, this.game.mapHeight / 2);
                if (tile && !tile.unit) {
                    break;
                }
            }

            if (!tile) {
                // this should never happen
                throw new Error("No tile could be found for unit to spawn.");
            }

            // If one was found (as in, not a map-wide line of units), spawn a new fresh human
            if (!tile.unit) {
                const unit = this.create.unit({
                    job: this.game.jobs[0],
                    owner: undefined,
                    tile,
                    turnsToDie: tile.x + 1,
                    movementTarget: this.game.getTile(
                        0,
                        this.game.mapHeight / 2,
                    ),
                });
                unit.tile.unit = unit;
            }
        }

        // Check if units are starving and update food
        if (this.game.currentPlayer.food >= this.game.currentPlayer.upkeep) {
            this.game.currentPlayer.food -= this.game.currentPlayer.upkeep;
        } else {
            for (const unit of this.game.currentPlayer.units) {
                unit.starving = true;
            }
        }
    }

    /** Updates the resources in between turns */
    private updateResources(): void {
        const lowerHarvests =
            this.game.currentTurn % this.game.turnsToLowerHarvest === 0;

        // Iterate through every tile
        for (const tile of this.game.tiles) {
            if (tile.turnsToHarvest > 0) {
                tile.turnsToHarvest--;
            }

            if (lowerHarvests && tile.harvestRate > 0) {
                tile.harvestRate -= this.game.lowerHarvestAmount;
                if (tile.harvestRate < 0) {
                    tile.harvestRate = 0;
                }
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

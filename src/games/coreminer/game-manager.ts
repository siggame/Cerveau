// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, CoreminerGame, CoreminerGameObjectFactory } from "./";

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
        // clean up dead units
        this.updateArrays();

        // update units
        this.updateUnits();

        // gravity
        this.updateGravity();

        // hoppers
        this.updateHoppers();
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
        for (const unit of this.game.units) {
            if (!unit.owner || unit.owner === this.game.currentPlayer) {
                unit.miningPower = unit.maxMiningPower;
                unit.moves = unit.maxMoves;
            }

            if (unit.tile && unit.tile.owner === unit.owner) {
                unit.health = unit.maxHealth;
            }
        }
    }

    /** Updates all falling tiles */
    private updateGravity(): void {
        for (const tile of this.game.fallingTiles) {
            if (tile.tileSouth) {
                let support = 0;
                if (tile.tileSouth.isSupport) {
                    if (tile.tileSouth.tileSouth) {
                        support += tile.tileSouth.tileSouth.dirt;
                        support += tile.tileSouth.tileSouth.ore;
                    }
                    if (tile.tileSouth.tileEast) {
                        support += tile.tileSouth.tileEast.dirt;
                        support += tile.tileSouth.tileEast.ore;
                    }
                    if (tile.tileSouth.tileWest) {
                        support += tile.tileSouth.tileWest.dirt;
                        support += tile.tileSouth.tileWest.ore;
                    }
                }

                if (support < tile.ore + tile.dirt) {
                    // fall
                    tile.tileSouth.dirt += tile.dirt;
                    tile.tileSouth.ore += tile.ore;
                    tile.dirt = 0;
                    tile.ore = 0;
                }
            }
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

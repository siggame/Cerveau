// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, NecrowarGame, NecrowarGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
import { removeElements } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Necrowar Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class NecrowarGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-##-Necrowar",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: NecrowarGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: NecrowarGameObjectFactory;

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
        for (const unit of this.game.units) {
            if (unit.tile && unit.tile.owner === unit.owner) {
                if (unit.health > unit.job.health) {
                    unit.health = unit.job.health;
                }
            }
        }

        // Code for the river phases, clearing out workers in the island gold mine
        // Every 15 turns
        if (this.game.currentTurn % this.game.riverPhase === 0) {
            for (const unit of this.game.units) {
                if (unit.tile) {
                    if (unit.tile.isIslandGoldMine) {
                        unit.tile.unit = undefined;
                        unit.tile = undefined;
                        unit.health = 0;
                    }
                }
            }
        }

        this.updateUnits();
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
        // add logic here after the current player's turn ends
        this.updateUnits();
        this.updateTowers();
        for (const unit of this.game.currentPlayer.units) {
            if (!unit.owner || unit.owner === this.game.currentPlayer) {
                unit.acted = false;
                unit.moves = unit.job.moves;
            }
            if (unit.health > unit.job.health) {
                unit.health = unit.job.health;
            }
        }

        for (const tower of this.game.currentPlayer.towers) {
            if (tower.cooldown > 0) {
                tower.cooldown--;
            }
        }
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
        // Add logic here checking for the primary win condition(s)
        let castleStandingOne = false;
        let castleStandingTwo = false;

        for (const player of this.game.players) {
            if (player.towers.length > 0) {
                if (player.towers[0].job.title === "castle") {
                    if (player === this.game.players[0]) {
                        castleStandingOne = true;
                    }
                    else if (player === this.game.players[1]) {
                        castleStandingTwo = true;
                    }
                }
            }
        }

        if (!castleStandingOne) {
            if (!castleStandingTwo) {
                this.secondaryWinConditions("Both castles fell at the same time.");
            }
            else {
                this.declareWinner("You defeated the enemy Necromancer!", this.game.players[1]);
                this.declareLosers("The enemy Necromancer has bested you!", this.game.players[1].opponent);
                return true;
            }
        }
        else {
            if (!castleStandingTwo) {
                this.declareWinner("You defeated the enemy Necromancer!", this.game.players[0]);
                this.declareLosers("The enemy Necromancer has bested you!", this.game.players[0].opponent);
                return true;
            }
            else {
                return false;
            }
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
        // Add logic here for the secondary win conditions

        if (this.game.players[0].towers[0].health > this.game.players[1].towers[0].health) {
            this.declareWinner(`${reason}: You had higher castle health!`, this.game.players[0]);
            this.declareLoser(`${reason}: Your opponent's castle had higher health!`, this.game.players[1]);
        }
        else if (this.game.players[1].towers[0].health > this.game.players[0].towers[0].health) {
            this.declareWinner(`${reason}: You had higher castle health!`, this.game.players[1]);
            this.declareLoser(`${reason}: Your opponent's castle had higher health!`, this.game.players[0]);
        }

        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here
    /**
     * Updates units.
     */
    private updateUnits(): void {
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
                if (unit.job.title !== "zombie") {
                    unit.tile.corpses++;
                }
                if (unit.job.title === "zombie") {
                    unit.tile.numZombies--;
                }
                if (unit.job.title === "ghoul") {
                    unit.tile.numGhouls--;
                }
                if (unit.job.title === "hound") {
                    unit.tile.numHounds--;
                }
                unit.tile.unit = undefined;
                unit.tile = undefined;
            }
        }
    }

    /**
     * Updates towers.
     */
    private updateTowers(): void {
        // Properly remove all killed towers
        const deadTowers = this.game.towers.filter((t) => !t.tile || t.health <= 0);

        // remove dead towers from all player's towers list
        for (const player of this.game.players) {
            removeElements(player.towers, ...deadTowers);
        }
        // and remove them from the game
        removeElements(this.game.towers, ...deadTowers);
         // mark them dead
        for (const tower of deadTowers) {
            if (tower.tile) {
                tower.tile.tower = undefined;
            }
        }
    }
    // <<-- /Creer-Merge: protected-private-methods -->>
}

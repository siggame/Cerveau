// This file is where you should put logic to control the game and everything
// around it.
import { removeElements } from "~/utils";
import { BaseClasses, NecrowarGame, NecrowarGameObjectFactory } from "./";
import { normalizeUnits } from 'moment';
import { Unit, } from './unit';

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
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

        //Code for the river phases, clearing out workers in the island gold mine
        //Every 25 turns
        if(this.game.currentTurn % 25 === 0) {
            for(let x = 0; x <= Unit.length; x++) {
                if(this.game.units[x].tile) {
                    if(this.game.units[x].tile.isIslandGoldMine) {
                        this.game.units[x].tile = undefined;
                        this.game.tiles[x].unit = undefined;
                        this.game.units.splice(x, 1);
                    }
                }
            }
        }

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
        // add logic here after the current player's turn starts
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
                unit.tile.unit = undefined;
                unit.tile = undefined;
            }
        }

        for (const unit of this.game.units) {
            if (!unit.owner || unit.owner === this.game.currentPlayer) {
                unit.acted = false;
                unit.moves = unit.job.moves;
            }

            if (unit.tile && unit.tile.owner === unit.owner) {
                if (unit.health > unit.job.health) {
                    unit.health = unit.job.health;
                }
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

        for(let x = 0; x < this.game.towers.length; x++) {
            if (this.game.players[0].towers[x].job.title === "castle") {
                castleStandingOne = true;
            } else if (this.game.players[1].towers[x].job.title === "castle") {
                castleStandingTwo = true;
            }
        }

        if(castleStandingOne) {
            return true;
        } else if (castleStandingTwo) {
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
        // Add logic here for the secondary win conditions

        let castleOne = null;
        let castleTwo = null;

        for(let x = 0; x < this.game.towers.length; x++) {
            if (this.game.players[0].towers[x].job.title === "castle") {
                castleOne = this.game.players[0].towers[x];
            } else if (this.game.players[1].towers[x].job.title === "castle") {
                castleTwo = this.game.players[1].towers[x];
            }
        }

        if(castleOne.health > castleTwo.health) {
            this.declareWinner(`${reason}: You had higher castle health!`, this.game.players[0])
            this.declareLoser(`${reason}: Your opponent's castle had higher health!`, this.game.players[1])
        } else if (castleTwo.health > castleOne.health) {
            this.declareWinner(`${reason}: You had higher castle health!`, this.game.players[1])
            this.declareLoser(`${reason}: Your opponent's castle had higher health!`, this.game.players[0])
        }
        
        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

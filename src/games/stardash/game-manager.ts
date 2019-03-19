// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, StardashGame, StardashGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
import { removeElements } from "~/utils";
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Stardash Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class StardashGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-##-StarDash",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: StardashGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: StardashGameObjectFactory;

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

        // TODO: HANDLE COLLISION ID FOR UNITS. MAKE A DICTIONARY CONNECTED TO HANDLE COLLISION DAMAGE

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
        // handle dashes
        this.updateUnits();
        // handle collisions.
        // this.collide();
        // kill units.
        this.updateArrays();
        // recharge the players homeworlds.
        this.game.players[0].homeBase.amount += this.game.regenerateRate;
        this.game.players[1].homeBase.amount += this.game.regenerateRate;
        // updates ships.
        this.manageShip();
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
        if (this.game.players[0].victoryPoints === (this.game.mythiciteAmount - this.game.lostMythicite) / 2 &&
            this.game.players[1].victoryPoints === (this.game.mythiciteAmount - this.game.lostMythicite) / 2) {
            // check secondary conditions.
            this.secondaryWinConditions("Both players have half of the mythicite.");

            // return that a win result was found.
            return true;
        }
        else if (this.game.players[0].victoryPoints > (this.game.mythiciteAmount - this.game.lostMythicite) / 2) {
            // declare the winner!
            this.declareWinner("You got the most mythicite!", this.game.players[0]);
            this.declareLosers("Your opponent got the most mythicite.", this.game.players[1]);

            // return that a win result was found.
            return true;
        }
        else if (this.game.players[1].victoryPoints > (this.game.mythiciteAmount - this.game.lostMythicite) / 2) {
            // declare the winner!
            this.declareWinner("You got the most mythicite!", this.game.players[1]);
            this.declareLosers("Your opponent got the most mythicite.", this.game.players[0]);

            // return that a win result was found.
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
        // set up trackers for each players value.
        let player0Value = 0;
        let player0Mat = 0;
        let player1Value = 0;
        let player1Mat = 0;
        // add up the value of player 0.
        for (const unit of this.game.players[0].units) {
            player0Value += unit.job.unitCost;
            player0Mat += unit.genarium * this.game.genariumValue +
                          unit.rarium * this.game.rariumValue +
                          unit.legendarium * this.game.legendariumValue;
        }
        // add up the value of player 1.
        for (const unit of this.game.players[1].units) {
            player1Value += unit.job.unitCost;
            player1Mat += unit.genarium * this.game.genariumValue +
                          unit.rarium * this.game.rariumValue +
                          unit.legendarium * this.game.legendariumValue;
        }
        if (player0Value > player1Value) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[0]);
            this.declareLosers(`${reason}: Your opponent is closer to achieving fusion`, this.game.players[1]);

            // exit the secondary win condition handler.
            return;
        }
        else if (player0Value < player1Value) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[1]);
            this.declareLosers(`${reason}: Your opponent is closer to achieving fusion`, this.game.players[0]);

            // exit the secondary win condition handler.
            return;
        }
        else if (player0Mat > player1Mat) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[0]);
            this.declareLosers(`${reason}: Your opponent is closer to achieving fusion`, this.game.players[1]);

            // exit the secondary win condition handler.
            return;
        }
        else if (player0Mat < player1Mat) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[1]);
            this.declareLosers(`${reason}: Your opponent is closer to achieving fusion`, this.game.players[0]);

            // exit the secondary win condition handler.
            return;
        }
        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    /**
     * Game-Manager update units.
     * This goes into the after turn function.
     * Makes the ships of the next player conclude their dashing, and resets
     * their information.
     */
    private updateUnits(): void {
        // only move the next player's units.
        if (this.game.currentPlayer === this.game.players[0]) {
            // iterate over each unit to check the dashing status.
            for (const unit of this.game.players[0].units) {
                // check if the unit is dashing.
                if (unit.isDashing) {
                    // update it's location and conditions.
                    unit.x = unit.dashX;
                    unit.dashX = -1;
                    unit.y = unit.dashY;
                    unit.dashY = -1;
                    unit.isDashing = false;
                    unit.acted = true;
                }
                else {
                    // if it didn't dash, it gets to act.
                    unit.acted = false;
                }

                // resets the units moves.
                unit.moves = unit.job.moves;
            }
        }
        else {
            // iterate over each unit to check the dashing status.
            for (const unit of this.game.players[1].units) {
                // check if the unit is dashing.
                if (unit.isDashing) {
                    // update it's location and conditions.
                    unit.x = unit.dashX;
                    unit.dashX = -1;
                    unit.y = unit.dashY;
                    unit.dashY = -1;
                    unit.isDashing = false;
                    unit.acted = true;
                }
                else {
                    // if it didn't dash, it gets to act.
                    unit.acted = false;
                }

                // resets the units moves.
                unit.moves = unit.job.moves;
            }
        }

        // safety return.
        return;
    }

    /**
     * Game-Manager Materials
     * This goes into the after turn function
     * Make planets pull materials off of ships and convert them into cash and
     * VP points. Regardless of owner if it is in range.
     */
    private manageShip(): void {
        // grab bases for easy reference.
        const baseA = this.game.players[0].homeBase;
        const baseB = this.game.players[1].homeBase;
        // iterate over every unit.
        for (const unit of this.game.units) {
            // if they are in the range of the player0 planet.
            if (Math.sqrt(((unit.x - baseA.x) ** 2) + ((unit.y - baseA.y) ** 2)) <= baseA.radius) {
                // grab all valued materials and convert them to cash. Not Josh.
                this.game.players[0].money += unit.genarium * this.game.genariumValue
                    + unit.rarium * this.game.rariumValue +
                    unit.legendarium * this.game.legendariumValue;
                // grab all vp materials.
                this.game.players[0].victoryPoints += unit.mythicite;
                // erase all materials on the unit.
                unit.genarium = 0;
                unit.rarium = 0;
                unit.legendarium = 0;
                unit.mythicite = 0;
                // if it is a friendly ship, recharge it.
                if (unit.owner === baseA.owner) {
                    const dif = unit.job.energy - unit.energy;
                    unit.energy = unit.job.energy;
                    baseA.amount -= dif;
                }
            }
            // if they are in the range of the player1 planet.
            if (Math.sqrt(((unit.x - baseB.x) ** 2) + ((unit.y - baseB.y) ** 2)) <= baseB.radius) {
                // grab all valued materials and convert them to cash. Not Josh.
                this.game.players[1].money += unit.genarium * this.game.genariumValue
                    + unit.rarium * this.game.rariumValue +
                    unit.legendarium * this.game.legendariumValue;
                // grab all vp materials.
                this.game.players[1].victoryPoints += unit.mythicite;
                // erase all materials on the unit.
                unit.genarium = 0;
                unit.rarium = 0;
                unit.legendarium = 0;
                unit.mythicite = 0;
                // if it is a friendly ship, recharge it.
                if (unit.owner === baseA.owner) {
                    const dif = unit.job.energy - unit.energy;
                    unit.energy = unit.job.energy;
                    baseA.amount -= dif;
                }
            }
        }

        // safety return.
        return;
    }

    /** Updates all arrays in the game with new/dead game objects */
    private updateArrays(): void {
        // Properly remove all killed units
        const deadUnits = this.game.units.filter((u) => u.x < 0 || u.y < 0 || u.energy < 0);

        // remove dead units from all player's units list
        for (const player of this.game.players) {
            removeElements(player.units, ...deadUnits);
        }
        // and remove them from the game
        removeElements(this.game.units, ...deadUnits);
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

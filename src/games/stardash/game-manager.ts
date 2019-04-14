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
            "MegaMinerAI-23-StarDash",
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
        // kill units. (handle collisions.)
        this.updateArrays();
        // handle dashes
        this.updateUnits();
        // make asteroids orbit
        this.updateOrbit();
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
        else if (this.game.players[0].money < 75 && this.game.players[0].units.length === 0) {
            // declare the winner!
            this.declareWinner("You bankrupted your opponent.", this.game.players[1]);
            this.declareLosers("You have no cash and no assets.", this.game.players[0]);

            // return that a win result was found.
            return true;
        }
        else if (this.game.players[1].money < 75 && this.game.players[1].units.length === 0) {
            // declare the winner!
            this.declareWinner("You bankrupted your opponent.", this.game.players[0]);
            this.declareLosers("You have no cash and no assets.", this.game.players[1]);

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
        if (this.game.players[0].victoryPoints > (this.game.mythiciteAmount - this.game.lostMythicite) / 2) {
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
            this.declareLosers(`${reason}: You were worth less than your opponent.`, this.game.players[1]);

            // exit the secondary win condition handler.
            return;
        }
        else if (player0Value < player1Value) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[1]);
            this.declareLosers(`${reason}: You were worth less than your opponent`, this.game.players[0]);

            // exit the secondary win condition handler.
            return;
        }
        else if (player0Mat > player1Mat) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[0]);
            this.declareLosers(`${reason}: You were worth less than your opponent`, this.game.players[1]);

            // exit the secondary win condition handler.
            return;
        }
        else if (player0Mat < player1Mat) {
            // declare the winners!
            this.declareWinner(`${reason}: You were worth more than your opponent. `, this.game.players[1]);
            this.declareLosers(`${reason}: You were worth less than your opponent`, this.game.players[0]);

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
     * their information. Update martyr protections.
     */
    private updateUnits(): void {
        // only move the next player's units.
        if (this.game.currentPlayer === this.game.players[0]) {
            // iterate over each unit to check the dashing status.
            for (const unit of this.game.players[0].units) {
                // set the protector to undefined as units have moved.
                unit.protector = undefined;
                // make it so the unit can act again
                unit.acted = false;
                // check if the unit is dashing.
                if (unit.isBusy) {
                    // update it's location and conditions.
                    unit.x = unit.dashX;
                    unit.dashX = -1000;
                    unit.y = unit.dashY;
                    unit.dashY = -1000;
                    unit.isBusy = false;
                }

                // resets the units moves.
                unit.moves = unit.job.moves;
            }
        }
        else {
            // iterate over each unit to check the dashing status.
            for (const unit of this.game.players[1].units) {
                // set the protector to undefined as units have moved.
                unit.protector = undefined;
                // make it so the unit can act again
                unit.acted = false;
                // check if the unit is dashing.
                if (unit.isBusy) {
                    // update it's location and conditions.
                    unit.x = unit.dashX;
                    unit.dashX = -1000;
                    unit.y = unit.dashY;
                    unit.dashY = -1000;
                    unit.isBusy = false;
                }

                // resets the units moves.
                unit.moves = unit.job.moves;
            }
        }

        // recharges player 0's home base.
        this.game.players[0].homeBase.amount += this.game.planetRechargeRate;
        // makes sure it stays below the energy cap.
        if (this.game.players[0].homeBase.amount > this.game.planetEnergyCap) {
            this.game.players[0].homeBase.amount = this.game.planetEnergyCap;
        }
        // recharges player 1's home base.
        this.game.players[1].homeBase.amount += this.game.planetRechargeRate;
        // makes sure it stays below the energy cap.
        if (this.game.players[1].homeBase.amount > this.game.planetEnergyCap) {
            this.game.players[1].homeBase.amount = this.game.planetEnergyCap;
        }

        // for each player, update martyr protection.
        this.updateMartyr(0);
        this.updateMartyr(1);

        // safety return.
        return;
    }

    /**
     * Update martyr protections.
     * This will take in the player to update protections for and update the
     * martyr protections for all of their units.
     * @param player: the player to be updated.
     */
    private updateMartyr(player: number): void {
        // all martyr ships owned by the player that can protect.
        const martyrs = this.game.players[player].units.filter((u) =>
                      u.job.title === "martyr");
        // all units owned by the player that need to be guarded.
        const units = this.game.players[player].units.filter((u) =>
                      u.protector === undefined && u.shield <= 0);
        // iterate over martyr that can protect.
        for (const martyr of martyrs) {
            // regen martyr shields.
            martyr.shield += this.game.jobs[1].damage;
            // keep it under the cap.
            if (martyr.job.shield < martyr.shield) {
                martyr.shield = martyr.job.shield;
            }
            // iterate over every unprotected unit.
            for (const unit of units) {
                // if the unit isn't protected and is in range.
                if (Math.sqrt(((unit.x - martyr.x) ** 2) +
                    ((unit.y - martyr.y) ** 2)) < martyr.job.range) {
                    // protected.
                    unit.protector = martyr;
                }
            }

            // make the martyr protect it's self
            martyr.protector = martyr;
        }

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
                // thank them if they are the enemy
                if (unit.owner !== baseA.owner) {
                    // tslint:disable-next-line: no-console
                    console.log("Thank you for the donation.");
                }
                // if it is a friendly ship, recharge it.
                if (unit.owner === baseA.owner) {
                    const dif = unit.job.energy - unit.energy;
                    if (dif < baseA.amount) {
                        unit.energy = unit.job.energy;
                        baseA.amount -= dif;
                    }
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
                if (unit.owner === baseB.owner) {
                    const dif = unit.job.energy - unit.energy + unit.job.shield - unit.shield;
                    if (dif < baseB.amount) {
                        unit.energy = unit.job.energy;
                        unit.shield = unit.job.shield;
                        baseB.amount -= dif;
                    }
                }
            }
        }

        // safety return.
        return;
    }

    /** Updates all arrays in the game with new/dead game objects */
    private updateArrays(): void {
        // the sun
        const sun = this.game.bodies[2];

        // iterate over all projectiles in the game.
        for (const mis of this.game.projectiles) {
            // make sure we are only updating the last players missiles
            if (mis.owner !== this.game.currentPlayer) {
                continue;
            }

            if (mis.target === null || mis.target === undefined || mis.target.x < 0 || mis.target.y < 0) {
                mis.x = -100;
                mis.y = -100;
                continue;
            }

            // grab the distance between the projectile and it's target
            const distance = Math.sqrt(((mis.x - mis.target.x) ** 2) + ((mis.y - mis.target.y) ** 2));
            // grab the x difference between the projectile and it's target.
            const difX = Math.abs(mis.x - mis.target.x);
            // as long as the projectile isn't ontop of the target.
            if (distance !== 0) {
                // grab the angle difference between the target and the missile.
                const angle = Math.acos(difX / distance);
                // set the travel distance
                const trav = Math.min(this.game.projectileSpeed, distance);
                // grab the change in x and y it can achieve.
                const moveX = Math.abs(trav * Math.cos(angle));
                const moveY = Math.abs(trav * Math.sin(angle));
                // if the target is to the left, move left.
                if (mis.x > mis.target.x) {
                    mis.x -= moveX;
                }
                // otherwise move right.
                else {
                    mis.x += moveX;
                }
                // if the target is below, move down.
                if (mis.y > mis.target.y) {
                    mis.y -= moveY;
                }
                // otherwise move up.
                else {
                    mis.y += moveY;
                }
                // decrease the missiles fuel appropriately.
                mis.fuel -= Math.sqrt(((moveX) ** 2) + ((moveY) ** 2));
            }

            // if it is colliding with the target.
            if (Math.sqrt(((mis.x - mis.target.x) ** 2) + ((mis.y - mis.target.y) ** 2)) <
                            (this.game.projectileRadius + this.game.shipRadius)) {
                // kill the missile and the target.
                mis.x = -1;
                mis.y = -1;
                mis.fuel = -1;
                mis.target.x = -1;
                mis.target.y = -1;
                mis.target.energy = -1;
            }
        }

        // Properly remove all killed units and ones that collide with the sun.
        const deadUnits = this.game.units.filter((u) => u.x < 0 || u.y < 0 || u.energy < 0 ||
                    Math.sqrt(((sun.x - u.x) ** 2) + ((sun.y - u.y) ** 2)) < sun.radius + this.game.shipRadius);

        // Properly remove all killed units and ones that collide with the sun.
        const deadProj = this.game.projectiles.filter((u) => u.x < 0 || u.y < 0 || u.fuel < 0 || u.target.x < 0 ||
                    Math.sqrt(((sun.x - u.x) ** 2) + ((sun.y - u.y) ** 2)) < sun.radius + this.game.projectileRadius);

        // remove dead units from all player's units list
        for (const player of this.game.players) {
            removeElements(player.units, ...deadUnits);
        }
        // and remove them from the game
        removeElements(this.game.units, ...deadUnits);

        // remove dead projectiles from all player's units list
        for (const player of this.game.players) {
            removeElements(player.projectiles, ...deadProj);
        }
        // and remove them from the game
        removeElements(this.game.projectiles, ...deadProj);
    }

    /** Updates asteroids orbiting the sun. */
    private updateOrbit(): void {
        // iterate over all bodies.
        for (const ast of this.game.bodies) {
            // skip them if they aren't a asteroid.
            if (ast.bodyType !== "asteroid") {
                continue;
            }

            // resets a asteroid's owner so other can mine it. Gives the old owner
            // a chance to continue to claim it.
            if (ast.owner !== this.game.currentPlayer) {
                ast.owner = undefined;
            }

            // if a angle exists.
            if (ast.angle >= 0) {
                // move the asteroid.
                ast.angle -= 360 / this.game.turnsToOrbit;
                if (ast.angle < 0) {
                    ast.angle += 360;
                }
                ast.x = ast.getX();
                ast.y = ast.getY();
            }

            // kill the asteroid if it is depleted.
            if (ast.amount <= 0 && this.game.regenerateRate === 0) {
                ast.x = -1;
                ast.y = -1;
            }
            else if (this.game.regenerateRate > 0) {
                ast.amount += this.game.regenerateRate;
            }
        }

        // Properly remove all killed asteroids.
        const deadBodies = this.game.bodies.filter((u) => (u.x < 0 || u.y < 0)
                                                && u.bodyType === "asteroid");

        // and remove them from the game
        removeElements(this.game.bodies, ...deadBodies);
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

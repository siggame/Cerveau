// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, SpidersGame, SpidersGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
import { arrayHasElements } from "~/utils";
import { Spiderling } from "./spiderling";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Spiders Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class SpidersGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-17-Spiders",
            "MegaMiner-AI-17-Spiders",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: SpidersGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: SpidersGameObjectFactory;

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

        const player = this.game.currentPlayer;
        player.broodMother.eggs = Math.ceil(
            (player.maxSpiderlings - player.spiders.length - 1) * this.game.eggsScalar,
        ); // -1 for the BroodMother in player.spiders that is not a Spiderling

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

        const movers = [] as Spiderling[];
        for (const spider of this.game.currentPlayer.spiders) {
            if (!(spider instanceof Spiderling)) {
                continue;
            }

            if (spider.workRemaining > 0) {
                spider.workRemaining -= Math.sqrt(spider.coworkers.size + 1); // + 1 for the spiderling itself

                if (spider.workRemaining <= 0) { // then they are done
                    if (spider.busy === "Moving") {
                        movers.push(spider); // they will finish moving AFTER other actions (e.g. cut)
                    }
                    else { // they finish now
                        for (const coworker of spider.coworkers) { // all the co-workers are done too
                            coworker.finish(true); // force finish them
                        }

                        spider.finish();
                    }
                }
            }
        }

        for (const mover of movers) {
            if (!mover.isDead) { // they may have died because of an action above (e.g. cut)
                mover.finish(); // now the spiderling moving can finish, because his Web may have been snapped above
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

        const losers = this.game.players.filter((p) => p.broodMother.isDead);

        if (losers.length > 0) { // someone lost
            if (losers.length === this.game.players.length) {
                this.secondaryWinConditions("All BroodMothers died on same turn");
            }
            else {
                this.declareLosers("BroodMother died", ...losers);

                const notLosers = this.game.players.filter((p) => !p.broodMother.isDead);
                if (notLosers.length === 1) {
                    // they win!
                    this.declareWinner("Eliminated enemy BroodMother!", notLosers[0]);
                }
            }

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

        if (!arrayHasElements(players)) {
            throw new Error("No players to win game!");
        }

        players.sort((a, b) => b.broodMother.health - a.broodMother.health);

        // check if one player has more health in his BroodMother than the rest
        if (players[0].broodMother.health !== players[1].broodMother.health) {
            const winner = players.shift();
            if (!winner) {
                throw new Error("No winners for Spiders game!");
            }

            this.declareWinner(
                `${reason} - BroodMother has the most remaining health (${winner.broodMother.health}).`,
                winner,
            );

            this.declareLosers(
                `${reason} - BroodMother has less health remaining than winner.`,
                ...players,
            );

            return;
        }

        players.sort((a, b) => b.numberOfNestsControlled - a.numberOfNestsControlled);
        if (players[0].numberOfNestsControlled !== players[1].numberOfNestsControlled) {
            const winner = players.shift();
            if (!winner) {
                throw new Error("No winners for Spiders game!");
            }

            this.declareWinner(
                `${reason} - Has the most controlled Nests (${winner.numberOfNestsControlled}).`,
                winner,
            );

            this.declareLosers(
                `${reason} - Has less controlled Nests.`,
                ...players,
            );

            return;
        }

        // else check if one player has more spiders than the other
        players.sort((a, b) => b.spiders.length - a.spiders.length);
        if (players[0].spiders.length !== players[1].spiders.length) {
            const winner = players.shift();
            if (!winner) {
                throw new Error("No winners for Spiders game!");
            }

            this.declareWinner(
                `${reason} - Player has the most Spiders (${winner.spiders.length}).`,
                winner,
            );
            this.declareLosers(
                `${reason} - Player has less Spiders alive than winner.`,
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

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

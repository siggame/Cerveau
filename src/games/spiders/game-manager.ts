// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, SpidersGame, SpidersGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
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
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The number of players that must connect to play this game */
    public static get requiredNumberOfPlayers(): number {
        // <<-- Creer-Merge: required-number-of-players -->>
        // override this if you want to set a different number of players
        return super.requiredNumberOfPlayers;
        // <<-- /Creer-Merge: required-number-of-players -->>
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
        super.beforeTurn();

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
     * This is a good place to check if they won the game during their turn,
     * and do end-of-turn effects.
     */
    protected async nextTurn(): Promise<void> {
        // <<-- Creer-Merge: next-turn -->>

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

        this.checkPrimaryWin();

        // <<-- /Creer-Merge: next-turn -->>

        super.nextTurn(); // this actually makes their turn end
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryGameOver(reason: string): void {
        // <<-- Creer-Merge: secondary-game-over -->>
        const players = this.game.players.slice();
        players.sort((a, b) => b.broodMother.health - a.broodMother.health);

        // check if one player has more health in his BroodMother than the rest
        if (players[0].broodMother.health !== players[1].broodMother.health) {
            const winner = players.shift()!;
            this.declareWinner(
                `${reason} - BroodMother has the most remaining health (${winner.broodMother.health}).`,
                winner,
            );

            this.declareLosers(
                `${reason} - BroodMother has less health remaining than winner.`,
                ...players,
            );

            return true;
        }

        // check if one player "controls" more Nests than the other player
        // A Nest is controlled if one player owns more Spiderlings than the other player on it
        var areasOwned = [0, 0];
        for(var i = 0; i < this.nests.length; i++) {
            var counts = [0, 0];
            for(var j = 0; j < this.nests[i].spiders.length; j++) {
                counts[this.nests[i].spiders[j].owner.id]++;
            }

            if(counts[0] > counts[1]) {
                areasOwned[0]++;
            }
            else if(counts[0] < counts[1]) {
                areasOwned[1]++;
            }
        }

        players.sort((a, b) => b.nestsControlled - a.nestsControlled);
        if (players[0].nestsControlled !== players[1].nestsControlled) {
            const winner = players.shift()!;
            this.declareWinner(
                `${reason} - Has the most controlled Nests (${winner.nestsControlled}).`,
                winner,
            );

            this.declareLosers(
                `${reason} - Has less controlled Nests.`,
                ...players,
            );

            return true;
        }

        // else check if one player has more spiders than the other
        players.sort(function(a, b) {
            return b.spiders.length - a.spiders.length;
        });

        if(players[0].spiders.length !== players[1].spiders.length) {
            winner = players.shift();
            this.declareWinner(winner, "{} - Player has the most Spiders ({}).".format(secondaryReason, winner.spiders.length));
            this.declareLosers(players, "{} - Player has less Spiders alive than winner.".format(secondaryReason));
            return;
        }

        this._endGameViaCoinFlip();
        // <<-- /Creer-Merge: secondary-game-over -->>

        this.makePlayerWinViaCoinFlip("Identical AIs played the game.");
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    /**
     * Checks if the game is over because the primary win condition was reached
     * (BroodMother died), and declares winners/losers as such
     *
     * @returns True if the game is over, false otherwise.
     */
    private checkPrimaryWin(): boolean {
        const losers = this.game.players.filter((p) => p.broodMother.isDead);

        if (losers.length > 0) { // someone lost
            if (losers.length === this.game.players.length) {
                this.secondaryGameOver("All BroodMothers died on same turn");
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

        return false;
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

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
    /** Other strings (case insensitive) that can be used as an ID. */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-25-Coreminer",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing. */
    public readonly game!: CoreminerGame;

    /** The factory that must be used to initialize new game objects. */
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
        this.updateArrays(); // clean up dead units
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
        this.updateBombsAndMiners(); // update miner values and explode bombs

        this.updateGravity(); // apply gravity to falling tiles

        this.updateHoppers(); // extend hoppers
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
        const winners = this.game.players.filter(
            (player) => player.value >= this.game.victoryAmount,
        );

        if (winners.length === this.game.players.length) {
            this.secondaryWinConditions(
                "Both players qualified for a promotion!",
            );

            return true;
        }

        if (winners.length === 1) {
            this.declareWinner(
                "Your performance has earned you a promotion!",
                winners[0],
            );
            this.declareLoser(
                "Your opponent has earned a promotion.",
                winners[0].opponent,
            );

            return true;
        }

        if (this.game.remainingOre === 0) {
            this.secondaryWinConditions("No more ore is available!");
        }
        // <<-- /Creer-Merge: primary-win-conditions -->>

        return false; // If we get here no one won on this turn.
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     *
     * @param reason - The reason why a secondary victory condition is
     * happening.
     */
    protected secondaryWinConditions(reason: string): void {
        // <<-- Creer-Merge: secondary-win-conditions -->>
        const winners = this.game.players.sort((a, b) => b.value - a.value);

        if (winners[0].value !== winners[1].value) {
            this.declareWinner(
                `${reason}: You were more valuable to the company.`,
                winners[0],
            );
            this.declareLoser(
                `${reason}: Your opponent was more valuable to the company.`,
                winners[1],
            );

            return;
        } else {
            const moneyWinners = this.game.players.sort(
                (a, b) => b.money - a.money,
            );

            if (moneyWinners[0].money !== moneyWinners[1].money) {
                this.declareWinner(
                    `${reason}: You were a more thrifty spender.`,
                    moneyWinners[0],
                );
                this.declareLoser(
                    `${reason}: Your opponent wasted fewer company funds.`,
                    moneyWinners[1],
                );

                return;
            }
        }
        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    /** Updates all arrays in the game with new/dead game objects. */
    private updateArrays(): void {
        // Properly remove all killed miners
        const deadMiners = this.game.miners.filter(
            (m) => !m.tile || m.health <= 0,
        );

        // remove dead miners from all player's miners list
        for (const player of this.game.players) {
            removeElements(player.miners, ...deadMiners);
        }

        // and remove them from the game
        removeElements(this.game.miners, ...deadMiners);

        // mark them dead
        for (const miner of deadMiners) {
            if (miner.tile) {
                removeElements(miner.tile.miners, miner);
                miner.tile.ore += miner.ore;
                miner.tile.dirt += miner.dirt;

                for (let i = 0; i < miner.bombs; i++) {
                    const bomb = this.game.manager.create.bomb({
                        timer: 1,
                        tile: miner.tile,
                    });

                    miner.tile.bombs.push(bomb);
                    this.game.bombs.push(bomb);
                    this.game.currentPlayer.bombs.push(bomb);
                }

                miner.tile = undefined;
            }
        }

        // Properly remove all killed bombs
        const deadBombs = this.game.bombs.filter(
            (m) => m.exploded || !m.tile || m.timer < 0,
        );

        // remove dead bombs from all player's bombs list
        for (const player of this.game.players) {
            removeElements(player.bombs, ...deadBombs);
        }

        // and remove them from the game
        removeElements(this.game.bombs, ...deadBombs);

        // mark them dead
        for (const bomb of deadBombs) {
            if (bomb.tile) {
                removeElements(bomb.tile.bombs, bomb);
                removeElements(this.game.bombs, bomb);
                bomb.tile = undefined;
            }
        }
    }

    /** Updates all bombs and miners. */
    private updateBombsAndMiners(): void {
        for (const miner of this.game.miners) {
            // Ignore dead miners
            if (miner.health <= 0 || !miner.tile) {
                continue;
            }

            // Refresh player miners
            if (miner.owner === this.game.currentPlayer) {
                miner.miningPower = miner.currentUpgrade.miningPower;
                miner.moves = miner.currentUpgrade.moves;
            }

            // Heal miners at base
            if (
                miner.tile &&
                miner.tile.owner === miner.owner &&
                miner.tile.isBase
            ) {
                miner.health = miner.currentUpgrade.health;
            }

            // Apply suffocation damage
            const currentTileAmount = miner.tile.ore + miner.tile.dirt;
            if (currentTileAmount > 0) {
                const dmg =
                    this.game.suffocationDamage +
                    Number(currentTileAmount >= this.game.largeMaterialSize) *
                        this.game.suffocationWeightDamage;
                miner.health = Math.max(0, miner.health - dmg);
            }
        }

        for (const bomb of this.game.bombs) {
            if (bomb.timer <= 1) {
                bomb.explode();
            } else {
                bomb.timer--;
            }
        }
    }

    /** Updates all falling tiles. */
    private updateGravity(): void {
        const fallingTiles = this.game.tiles.filter((t) => t.isFalling);
        while (fallingTiles.length > 0) {
            const tile = fallingTiles.pop();
            if (!tile) {
                return;
            }

            if (tile.tileSouth) {
                let willFall = true;
                // Supports prevent falling
                if (tile.tileSouth.isSupport) {
                    willFall = false;
                } else if (
                    tile.tileSouth.tileEast &&
                    tile.tileSouth.tileEast.isSupport
                ) {
                    willFall = false;
                } else if (
                    tile.tileSouth.tileWest &&
                    tile.tileSouth.tileWest.isSupport
                ) {
                    willFall = false;
                }

                if (willFall) {
                    // Fall logic
                    tile.applyGravity();
                }
            }
        }
    }

    /** Updates all hopper extensions. */
    private updateHoppers(): void {
        this.game.players.forEach((p) => {
            let nextHopper;
            if (p.hopperTiles.length > 0)
                nextHopper = p.hopperTiles[p.hopperTiles.length - 1].tileSouth;
            else nextHopper = p.baseTile.tileSouth;

            while (nextHopper) {
                if (nextHopper.dirt + nextHopper.ore > 0) break;
                if (nextHopper.isSupport || nextHopper.isLadder) break;

                nextHopper.isHopper = true;
                nextHopper.owner = p;
                p.hopperTiles.push(nextHopper);
                nextHopper = nextHopper.tileSouth;
            }
        });
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

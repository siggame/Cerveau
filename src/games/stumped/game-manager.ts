// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, StumpedGame, StumpedGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
import { removeElements } from "~/utils";
import { Player } from "./player";
import { Tile } from "./tile";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Stumped Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class StumpedGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-19-Stumped",
            "MegaMiner-AI-19-Stumped",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: StumpedGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: StumpedGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    /**
     * Cleans up the beavers arrays removing dead ones and adding new ones
     * to their appropriate Beaver arrays.
     */
    public cleanupArrays(): void {
        // add all the new beavers to this.beavers
        for (const newBeaver of this.game.newBeavers) {
            this.game.beavers.push(newBeaver);
            newBeaver.owner.beavers.push(newBeaver);
        }

        // and empty out the `this.newBeavers` array as they are no longer new and have been added above
        this.game.newBeavers.length = 0;

         // Clone of array so we can remove them from the actual array and not
         // fuck up loop iteration
        const allBeavers = this.game.beavers.slice();
        // remove all beavers from the game that died
        for (const beaver of allBeavers) {
            if (beaver.health <= 0) {
                // poor beaver died, remove it from arrays
                removeElements(beaver.owner.beavers, beaver);
                removeElements(this.game.beavers, beaver);
            }
            else if (beaver.tile) {
                beaver.tile.beaver = beaver;
            }
        }
    }

    // <<-- /Creer-Merge: public-methods -->>

    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        await super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>

        this.cleanupArrays();

        // finish recruiting any new beavers
        for (const beaver of this.game.currentPlayer.beavers) {
            beaver.recruited = true;
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

        this.cleanupArrays();
        this.updateBeavers();
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

        // Check if a player has created 10 lodges (they are built instantly)
        // Check if this.maxTurns turns have passed, and if so, in this order:
        // - Player has been made extinct (all beavers & lodges destroyed)
        // - Player with most lodges wins
        // - Player with most branches wins
        // - Player with most food wins
        // - Random player wins

        const players = this.game.players.slice();
        const extinctPlayers = players.filter(
            (p) => (p.beavers.length === 0 && p.lodges.length === 0),
        );

        if (extinctPlayers.length > 0) {
            // Someone lost via extermination, so the game is over.
            if (extinctPlayers.length === this.game.players.length) {
                // they both somehow killed everything, so the board is empty. Win via coin flip
                this.secondaryWinConditions(
                    "Both Players exterminated on the same turn",
                );
            }
            else {
                // all exterminated players lost
                const loser = extinctPlayers[0];
                this.declareWinner("Drove opponent to extinction", loser.opponent);
                this.declareLoser("Extinct - All Beavers and lodges destroyed", loser);
                this.endGame();
            }

            return true;
        }

        players.sort((a, b) => b.lodges.length - a.lodges.length);

        if (this.game.currentTurn % 2 === 1) {
            // round end, check for primary win condition

            if (players[0].lodges.length >= this.game.lodgesToWin) {
                if (players[0].lodges.length === players[1].lodges.length) {
                    // Then both players completed the same number of lodges by
                    // the end of this round, do secondary win conditions.
                    this.secondaryWinConditions(
                        "Lodges complete on the same round",
                    );
                }
                else {
                    // someone won
                    const winner = players[0];
                    const loser = players[1];
                    this.declareWinner(`Reached ${winner.lodges.length}/${this.game.lodgesToWin} lodges!`, winner);
                    this.declareLoser("Less lodges than winner who reached completed all lodges", loser);
                    this.endGame();
                }

                return true;
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

        const players = this.game.players.slice().sort(
            (p1, p2) => p2.lodges.length - p1.lodges.length,
        );

        // check if someone won by having more lodges
        if (players[0].lodges.length !== players[1].lodges.length) {
            const winner = players[0];
            const loser = players[1];
            this.declareWinner(`${reason} - Has the most lodges (${winner.lodges.length})`, winner);
            this.declareLoser(`${reason} - Less lodges than opponent`, loser);

            this.endGame();
            return;
        }

        // check if someone won by having more branches or food
        for (const resource of ["branches", "food"]) {
            /**
             * counts the number of resources a player has
             *
             * @param p - player to count for
             * @returns the count f resource
             */
            const count = (p: Player) => (p.lodges
                .map((m) => m[resource as "branches" | "food"])
                .reduce((acc, val) => acc + val, 0)
            );

            const player0Count = count(players[0]);
            const player1Count = count(players[1]);

            if (player0Count !== player1Count) {
                const winner = players[player0Count > player1Count ? 0 : 1];
                const winnerCount = Math.max(player0Count, player1Count);
                const looserCount = Math.min(player0Count, player1Count);
                this.declareWinner(`${reason} - Has more ${resource} than opponent (${winnerCount})`, winner);
                this.declareLoser(
                    `${reason} - Less ${resource} than winner (${looserCount})`,
                    winner.opponent,
                );

                this.endGame();
                return;
            }
        }

        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    /**
     * Updates the beavers variables. Must be called after their array is
     * cleaned up.
     */
    private updateBeavers(): void {
        for (const beaver of this.game.beavers) {
            // If they are distracted
            if (beaver.turnsDistracted > 0) {
                beaver.turnsDistracted--; // decrement the turns count
            }

            // reset their actions/moves for next turn
            beaver.actions = beaver.job.actions;
            beaver.moves = beaver.job.moves;
        }
    }

    /**
     * Updates the resources by moving them down water and such
     */
    private updateResources(): void {
        const newResources = new Map<Tile, {
            branches: number;
            food: number;
        }>();

        for (const tile of this.game.tiles) {
            // Keep resources here
            if (!newResources.has(tile)) {
                newResources.set(tile, {
                    branches: 0,
                    food: 0,
                });
            }

            let resources = newResources.get(tile)!;

            if (!tile.lodgeOwner && tile.type === "water" && tile.flowDirection) {
                const nextTile = tile.getNeighbor(tile.flowDirection);

                if (!nextTile) {
                    continue;
                }

                if (!newResources.has(nextTile)) {
                    newResources.set(nextTile, {
                        branches: 0,
                        food: 0,
                    });
                }
                resources = newResources.get(nextTile)!;
            }
            // Else, keep resources here

            resources.branches += tile.branches;
            resources.food += tile.food;

            // Spawn new resources
            if (tile.spawner) {
                if (tile.spawner.hasBeenHarvested) {
                    tile.spawner.harvestCooldown--;

                    if (tile.spawner.harvestCooldown === 0) {
                        tile.spawner.hasBeenHarvested = false;
                    }
                }
                else if (tile.spawner.health < this.game.settings.maxSpawnerHealth) {
                    tile.spawner.health++;
                }
            }
        }

        // Move resources
        for (const tile of this.game.tiles) {
            const resources = newResources.get(tile);
            if (resources) {
                tile.branches = resources.branches;
                tile.food = resources.food;
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

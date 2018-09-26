// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, NewtonianGame, NewtonianGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Newtonian Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class NewtonianGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-##-Newtonian",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: NewtonianGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: NewtonianGameObjectFactory;

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
        // add logic here after the current player's turn starts
        // code spawning below this:

        // Number of units For the target player.
        const units: number[] = [0, 0, 0];
        // The player who to spawn for.
        const player: Player = game.currentPlayer;
        // The unit type to try and spawn.
        const spawnType: number = -1;

        // Iterate through all the player's units to find how many of each type there are.
        for (const u of player.units) {
            units[(u.job === game.units[0] ? 0 : u.job === game.units[1] ? 1 : 3)]++;
        }

        // If Intern Cap has not been met then try to spawn an Intern.
        if (game.internCap > units[0] && player.internSpawn === 0) {
            if (spawnUnit(player, game.jobs[0]) {
                player.internSpawn = game.spawnTime;
            }
        }

        // If Physicist Cap has not been met then try to spawn an Physicist.
        else if (game.physicistCap > units[1] && player.physicistSpawn === 0) {
            if (game.internCap > units[0] && player.internSpawn === 0) {
                if (spawnUnit(player, game.jobs[0]) {
                    player.internSpawn = game.spawnTime;
                }
            }
        }

        // If Manager Cap has not been met then try to spawn an Manager.
        else if (game.managerCap > units[2] && player.managerSpawn === 0) {
            if (game.internCap > units[0] && player.internSpawn === 0) {
                if (spawnUnit(player, game.jobs[0]) {
                    player.internSpawn = game.spawnTime;
                }
            }
        }

        // Manager Incrementing spawner Timers

        player.internSpawn = (gunits[0] === game.internCap)
          ? game.spawnTime : player.internSpawn - 1;
        player.physicistSpawn = (gunits[1] === game.physicistCap)
          ? game.spawnTime : player.physicistSpawn - 1;
        player.managerSpawn = (gunits[2] === game.managerCap)
        ? game.spawnTime : player.managerSpawn - 1;

        // code the generator below this:
        //
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
        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    /**
     * Attempts to spawn in a unit for a given player.
     *
     * @param player - The player that will own the unit.
     * @param job - The job of the unit.
     * @returns True if unit is spawned, otherwise returns false.
     */
    protected spawnUnit(player: Player, job: Job): boolean {
        // X coord for spawning.
        let spawnX: number = 1;

        // Y coord for spawning.
        let spawnY: number = 1;

        // The playerIndex for the game.players array.
        // Used for knowing which direction to move along the X axis.
        const playerIndex = (player === game.players[0] ? 0 : 1);

        // Check to make sure the tile we are starting on is the right player Tile.
        if (player !== game.tiles[spawnX + spawnY * game.mapWidth].owner) {
            // If wrong tile, try the other side to see if that is the right spawn area.
            spawnX = game.mapWidth - spawnX;
            // Double check that we now have the right tile. If this fails, need to
            // Revaluate how to find spawn.
            if (player !== game.tiles[spawnX + spawnY * game.mapWidth].owner) {
                // Something is wrong and did not find the right tile.
                // console.log("error in spawning");
            }
        }

        // Loop to keep looking for an open tile to spawn the Unit.
        // TODO: optimize so that it doesn't iterate over every column before terminating.
        while (spawnX < game.mapWidth && spawnX > 0) {
            // Tile that we are trying to spawn on.
            const tile: Tile = game.tiles[spawnX + spawnY * game.mapWidth];
            // Check to see if the tile is still from the spawn area.
            // If not increment the column and reset to row 1. Continue on to the next iteration.
            if (tile.owner !== player) {
                spawnX += playerIndex * -1;
                spawnY = 1;
                continue;
            }

            // Check to see if there is a Unit on the tile.
            // If there is move down a row.
            if (tile.unit) {
                spawnY++;
                continue;
            }
            // Else spawn in Unit and return success to spawning.
            else {
                tile.unit = this.create.unit({
                    acted: false,
                    health: job.healthr,
                    job,
                    owner: player,
                    tile,
                };

                return true;
            }

            // Check to make sure spawnY stays in bounds.
            // TODO: optimize so that it doesn't iterate over every row before moving columns.
            if (spawnY >= game.mapHeight) {
                spawnY = 1;
                spawnX += playerIndex * -1;
            }

            // Return failure. We finished looking over all the spawn for Unit spawning.
            return false;
        }
    }
    // <<-- /Creer-Merge: protected-private-methods -->>
}

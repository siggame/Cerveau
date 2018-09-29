// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, NewtonianGame, NewtonianGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
import { Job } from "./job";
import { Player } from "./player";
import { Tile } from "./tile";
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
        this.manageMaterials();
        // code spawning below this:
        // Number of units For the target player.
        const units: number[] = [0, 0, 0];
        // The player who to spawn for.
        const player: Player = this.game.currentPlayer.opponent;

        // Iterate through all the player's units to find how many of each type there are.
        for (const u of player.units) {
            units[(
                u.job.title === this.game.jobs[0].title
                ? 0 : u.job.title === this.game.jobs[1].title ? 1 : 2
            )]++;
        }

        // If Intern Cap has not been met then try to spawn an Intern.
        if (this.game.internCap > units[0] && player.internSpawn <= 0) {
            if (this.spawnUnit(player, this.game.jobs[0])) {
                player.internSpawn = this.game.spawnTime;
            }
        }

        // If Physicist Cap has not been met then try to spawn an Physicist.
        else if (this.game.physicistCap > units[1] && player.physicistSpawn <= 0) {
            if (this.spawnUnit(player, this.game.jobs[1])) {
                player.physicistSpawn = this.game.spawnTime;
            }
        }

        // If Manager Cap has not been met then try to spawn an Manager.
        else if (this.game.managerCap > units[2] && player.managerSpawn <= 0) {
            if (this.spawnUnit(player, this.game.jobs[2])) {
                player.managerSpawn = this.game.spawnTime;
            }
        }

        // Manager Incrementing spawner Timers

        player.internSpawn = (units[0] >= this.game.internCap)
          ? this.game.spawnTime : player.internSpawn - 1;
        player.physicistSpawn = (units[1] >= this.game.physicistCap)
          ? this.game.spawnTime : player.physicistSpawn - 1;
        player.managerSpawn = (units[2] >= this.game.managerCap)
         ? this.game.spawnTime : player.managerSpawn - 1;

        // code the generator below this:
        // iterate through each tile on the map
        for (const tile of this.game.tiles) {
            // focus specifically on generator tiles owned by the current player
            if (tile.type === "generator" && tile.owner === this.game.currentPlayer) {
                // if the tile has redium or blueium, heat and pressure are increased accordingly
                // the redium and blueium is then removed from the map
                if (tile.redium > 0) {
                    this.game.currentPlayer.pressure += (tile.redium * this.game.refinedValue);
                }
                tile.redium = 0;
                if (tile.blueium > 0) {
                    this.game.currentPlayer.heat += (tile.blueium * this.game.refinedValue);
                }
                tile.blueium = 0;
                // if there's a unit on a generator tile...
                if (tile.unit !== undefined) {
                    // scores the refined materials on the unit before removing them
                    if (tile.unit.redium > 0) {
                        this.game.currentPlayer.heat += (tile.unit.redium * this.game.refinedValue);
                    }
                    tile.unit.redium = 0;
                    if (tile.unit.blueium > 0) {
                        this.game.currentPlayer.pressure += (tile.unit.blueium * this.game.refinedValue);
                    }
                    tile.unit.blueium = 0;
                    // if there's an enemy intern in your generator...
                    if (tile.unit.job.title === "intern" && tile.unit.owner !== this.game.currentPlayer) {
                        // the intern dies
                        tile.unit.health = 0;
                        // the player gains internium (+resources to both scores)
                        this.game.currentPlayer.pressure += (tile.unit.blueium * this.game.refinedValue);
                        this.game.currentPlayer.heat += (tile.unit.redium * this.game.refinedValue);
                    }
                    // RIP intern
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

    /**
     * Attempts to spawn in a unit for a given player.
     * @param player - The player that will own the unit.
     * @param job - The job of the unit.
     * @returns True if unit is spawned, otherwise returns false.
     */
    protected spawnUnit(player: Player, job: Job): boolean {
        // Iterate through each player's spawn tiles to find a spot to spawn unit.
        for (const tile of player.spawnTiles) {
            // Check to see if there is a Unit on the tile.
            // If there is move on to the next tile.
            if (tile.unit) {
                continue;
            }
            // Else spawn in Unit and return success to spawning.
            else {
                tile.unit = this.create.unit({
                    acted: false,
                    health: job.health,
                    job,
                    owner: player,
                    tile,
                });
                player.units.push(tile.unit);
                this.game.units.push(tile.unit);

                return true;
            }
        }

        // Return failure. We finished looking over all the spawn for Unit spawning.
        return false;
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    /* conveyMaterials
     *
     * This function moves materials and units on conveyor
     */
    private conveyMaterials(x: number, y: number): void { // Entirely untested

        const start: Tile | undefined = this.game.tiles[x + y * this.game.mapWidth];
        let end: Tile | undefined = start ? start : undefined;

        if (!start) {
            return;
        }

        if (start.type === "conveyor" && start.direction !== "blank") {
            if (start.direction === "north") {
                end = start.tileNorth;
            }
            if (start.direction === "east") {
                end = start.tileEast;
            }
            if (start.direction === "south") {
                end = start.tileSouth;
            }
            if (start.direction === "west") {
                end = start.tileWest;
            }
            if (!end) {
                return;
            }

            // Transfers materials
            end.rediumOre += start.rediumOre;
            start.rediumOre = 0;
            end.redium += start.redium;
            start.redium = 0;
            end.blueiumOre += start.blueiumOre;
            start.blueiumOre = 0;
            end.blueium += start.blueium;
            start.blueium = 0;

            // Moves units if they exist and the destination is unoccupied
            if (!end.unit && start.unit) {
                start.unit.tile = end;
                end.unit = start.unit;
                start.unit = undefined;
            }
        }

        return;
    }

    /* Game-Manager Materials
     *
     * This goes into the after turn function
     * Select the player who's turns it currently isn't, and spawn materials
     * on their side of the base.
     * Makes sure all conveyers move units and materials ontop of them.
     */
    private manageMaterials(): void { // Entirely untested

        let loc: Tile | undefined;

        // Order matters
        // Moves materials and units on the left side
        this.conveyMaterials(2, 17);
        this.conveyMaterials(3, 17);
        this.conveyMaterials(4, 17);
        this.conveyMaterials(4, 18);
        this.conveyMaterials(4, 19);
        this.conveyMaterials(4, 20);
        this.conveyMaterials(3, 20);
        this.conveyMaterials(2, 20);
        this.conveyMaterials(1, 20);

        // Order matters
        // Moves materials and units on the right side
        this.conveyMaterials(this.game.mapWidth - 2, 17);
        this.conveyMaterials(this.game.mapWidth - 3, 17);
        this.conveyMaterials(this.game.mapWidth - 4, 17);
        this.conveyMaterials(this.game.mapWidth - 4, 18);
        this.conveyMaterials(this.game.mapWidth - 4, 19);
        this.conveyMaterials(this.game.mapWidth - 4, 20);
        this.conveyMaterials(this.game.mapWidth - 3, 20);
        this.conveyMaterials(this.game.mapWidth - 2, 20);
        this.conveyMaterials(this.game.mapWidth - 1, 20);

        // players[0] is on x = 0 side
        // Right is Redium

        // Amount of ore spawned
        const spawnAmount = 1;

        // Spawns the appropriate ore at the start of the conveyor
        // on the side of the the player who's turns it currently isn't
        if (this.game.players[0] === this.game.currentPlayer) {
            loc = this.game.getTile(1, 20);
            if (loc) {
                loc.blueiumOre += spawnAmount;
            }
        }
        else {
            loc = this.game.getTile(this.game.mapWidth - 1, 20);
            if (loc) {
                loc.rediumOre += spawnAmount;
            }
        }

        return;
    }
    // <<-- /Creer-Merge: protected-private-methods -->>
}

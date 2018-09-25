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
        this.manageMaterials();
        // code spawning below this:
        // Spawning location to start with.
        let spawnX:number = 1;
        let spawnY:number = 1;
        // Number of units For the target player.
        let units:number[] = [0,0,0];
        // The player who to spawn for.
        let player:Player = game.currentPlayer.opponent;
        // The unit type to try and spawn.
        let spawnType:number = -1;

        // Checking to make sure if my tile is the right tile.
        if(game.currentPlayer === game.tiles[spawnX + spawnY * game.mapWidth].owner) {
          spawnX = game.mapWidth - spawnX;
          if(game.currentPlayer === game.tiles[spawnX + spawnY * game.mapWidth].owner) {
            console.log("error in spawning");
          }
        }
        // Iterate through all the player's units to find how many of each type there are. 
        for(let u in player.units) {
          units[(u.job === game.units[0] ? 0 : u.job === game.units[1] ? 1 : 3)]++;
        }
         
        if(game.internCap > units[0] && player.internSpawn === 0) {
          // TODO: Insert spawning function HERE for Intern
        }

        else if(game.physicistCap > units[1] && player.physicistSpawn === 0) { 
          // TODO: Insert spawning function HERE for Physicist 
        }
        
        else if(game.managerCap > units[2] && player.managerSpawn === 0) {
          // TODO: Insert spawning function HERE for Managers 
        }

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

    /* convayMaterials
     *
     * This function moves materials and units on conveyor
     */
    private conveyMaterials(x: number, y: number): void { // Entirely untested

        let start: Tile;
        let end: Tile;

        start = this.game.tiles[x + y * this.game.mapWidth];
        end = start;

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

        let loc: Tile;

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
            loc.blueiumOre += spawnAmount;
        }
        else {
            loc = this.game.getTile(this.game.mapWidth - 1, 20);
            loc.rediumOre += spawnAmount;
        }

        return;
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

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
        // Number of units For the target player.
        let units:number[] = [0,0,0];
        // The player who to spawn for.
        let player:Player = game.currentPlayer;
        // The unit type to try and spawn.
        let spawnType:number = -1;

        // Iterate through all the player's units to find how many of each type there are. 
        for(let u in player.units) {
          units[(u.job === game.units[0] ? 0 : u.job === game.units[1] ? 1 : 3)]++;
        }
         
        // If Intern Cap has not been met then try to spawn an Intern.
        if(game.internCap > units[0] && player.internSpawn === 0) {
          if(spawnUnit(player, game.jobs[0]) {
            player.internSpawn = game.spawnTime;
          }
        }

        // If Physicist Cap has not been met then try to spawn an Physicist.
        else if(game.physicistCap > units[1] && player.physicistSpawn === 0) { 
          if(game.internCap > units[0] && player.internSpawn === 0) {
            if(spawnUnit(player, game.jobs[0]) {
              player.internSpawn = game.spawnTime;
            }
          }
        }
        
        // If Manager Cap has not been met then try to spawn an Manager.
        else if(game.managerCap > units[2] && player.managerSpawn === 0) {
          if(game.internCap > units[0] && player.internSpawn === 0) {
            if(spawnUnit(player, game.jobs[0]) {
              player.internSpawn = game.spawnTime;
            }
          }
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
      let playerIndex = (player === game.players[0]? 0 : 1);

      // Check to make sure the tile we are starting on is the right player Tile.
      if(player !== game.tiles[spawnX + spawnY * game.mapWidth].owner) {
        // If wrong tile, try the other side to see if that is the right spawn area.
        spawnX = game.mapWidth - spawnX;
        // Double check that we now have the right tile. If this fails, need to
        // Revaluate how to find spawn.
        if(player !== game.tiles[spawnX + spawnY * game.mapWidth].owner) {
          // Something is wrong and did not find the right tile.
          console.log("error in spawning");
        }
      }
     
      // Loop to keep looking for an open tile to spawn the Unit.
      // TODO: optimize so that it doesn't iterate over every column before terminating.
      while(spawnX < game.mapWidth && spawnX > 0) {
        // Tile that we are trying to spawn on.
        let tile: Tile = game.tiles[spawnX + spawnY * game.mapWidth];
        // Check to see if the tile is still from the spawn area.
        // If not increment the column and reset to row 1. Continue on to the next iteration.
        if(tile.owner !== player) {
          spawnX += playerIndex * -1;
          spawnY = 1;
          continue;
        }
        
        // Check to see if there is a Unit on the tile.
        // If there is move down a row.
        if(tile.unit) {
          spawnY++;
          continue;
        }
        // Else spawn in Unit and return success to spawning.
        else {
          tile.unit = this.create.unit({
            acted: false;
            health: job.health;
            job: job;
            owner: player;
            tile: tile;
        }
        return true;
      }

      // Check to make sure spawnY stays in bounds.
      // TODO: optimize so that it doesn't iterate over every row before moving columns.
      if(spawnY >= game.mapHeight) {
        spawnY = 1;
        spawnX += playerIndex * -1;
      }

      // Return failure. We finished looking over all the spawn for Unit spawning.
      return false;
    }
    // <<-- /Creer-Merge: protected-private-methods -->>
}

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
		 
        this.manageMaterials();
		 
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
        //
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
	
	/* Game-Manager Materials
	 *
	 * This goes into the before turn function
	 * Select the player who's turns it currently isn't, and spawn materials
	 * on their side of the base.
	 * Makes sure all conveyers move units and materials ontop of them.
	 */
	
    private convayMaterials(x: number, y: number): void {
        
        start = getMutableTile(x, y);
        if (start.type == "conveyor"){
            if (start.direction == "north") {
                end = start.tileNorth;
            }
        if (start.direction == "east") {
                end = tileEast;
            }
        }
        if (start.direction == "south") {
                end = tileSouth;
            }
        }
        if (start.direction == "west") {
                end = tileWest;
            }
        }
        
        end.rediumOre += start.rediumOre;
        start.rediumOre = 0;
        end.redium += start.redium;
        start.redium = 0;
        end.blueiumOre += start.blueiumOre;
        start.blueiumOre = 0;
        end.blueium += start.blueium;
        start.blueium = 0;
        
        if (!end.unit && start.unit) {
            start.unit.tile = end
            end.unit = start.unit
            start.unit = undefined;
        }
        
        return;
    }

	
    private manageMaterials(): void {
		
		// players[0] is on x = 0 side
		// Right is Redium
        
		const spawnAmount = 1;
		
		convayMaterials(2, 17)
		convayMaterials(3, 17)
		convayMaterials(4, 17)
		convayMaterials(4, 18)
		convayMaterials(4, 19)
		convayMaterials(4, 20)
		convayMaterials(3, 20)
		convayMaterials(2, 20)
		convayMaterials(1, 20)
		
        convayMaterials(this.mapWidth - 2, 17)
		convayMaterials(this.mapWidth - 3, 17)
		convayMaterials(this.mapWidth - 4, 17)
		convayMaterials(this.mapWidth - 4, 18)
		convayMaterials(this.mapWidth - 4, 19)
		convayMaterials(this.mapWidth - 4, 20)
		convayMaterials(this.mapWidth - 3, 20)
		convayMaterials(this.mapWidth - 2, 20)
		convayMaterials(this.mapWidth - 1, 20)
		
		x: number;
        y: number;
		if (!this.players[0].currentPlayer) {
		    x = 1;
			y = 20;
			loc = getMutableTile(x, y);
			loc.blueiumOre += spawnAmount;
		}
		else {
			x = this.mapWidth - 1;
			y = 20;
			loc = getMutableTile(x, y);
			loc.rediumOre += spawnAmount;
		}
        
        return;
    }
	
    // <<-- /Creer-Merge: protected-private-methods -->>
}

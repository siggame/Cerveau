import { IBaseGameObjectRequiredData } from "~/core/game";
import { ITowerAttackArgs, ITowerProperties } from "./";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A tower in the game. Used to combat enemy waves.
 */
export class Tower extends GameObject {
    /**
     * Whether this tower has attacked this turn or not.
     */
    public attacked!: boolean;
    
    /**
     * How much remaining health this tower has.
     */
    public health!: number;
    
    /**
     * The player that built / owns this tower.
     */
    public owner?: Player;
    
    /**
     * The Tile this Tower is on.
     */
    public readonly tile: Tile;
    
    /**
     * What type of tower this is (it's job).
     */
    public readonly type!: tJob;
    
    // <<-- Creer-Merge: attributes -->>
    
    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.
    
    // <<-- /Creer-Merge: attributes -->>
    
    /**
     * Called when a Tower is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: Readonly<ITowerProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);
        
        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }
    
    // <<-- Creer-Merge: public-functions -->>
    
    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.
    
    // <<-- /Creer-Merge: public-functions -->>
    
    /**
     * Invalidation function for attack. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateAttack(
        player: Player,
        tile: Tile,
    ): void | string | ITowerAttackArgs {
        // <<-- Creer-Merge: invalidate-attack -->>

        // Check all the arguments for attack here and try to
        // return a string explaining why the input is wrong.
        // If you need to change an argument for the real function, then
        // changing its value in this scope is enough.
        
        
            return reason;
        }
        
        // Check if tower already attacked
        if (this.attacked) {
            return
                `${this}, cannot attack becuase has already attacked this turn`;
        }
        
        /// Check if tile exists
        if (!tile) {
            return `${this}, cannot attack a tile that doesn't exist`;
        }
        
        // Check if tile has no units
        if (tile.units.length <= 0) {
            return `${this}, cannot attack a tile with no units`;
        }
        
        // Check if tower has zero health
        if (this.health <= 0)
        {
            return `${this}, cannot attack because it has zero health`;
        }
        
        /*
         * Shape of the Tower range:
         *         _ x x x _ 
         *         x x x x x
         *         x x T x x
         *         x x x x x
         *         _ x x x _
         */
        
        // Check if tile is in range
        if (range < this.distance(this.tile.x, this.tile.y, tile.x , tile.y)) {
            return `${this}, cannot attack because target tile is out of range`;
        }
        
        // Check if any unit belongs to the player
        for (let i: number = 0; i < tile.units.length; i++)
        {
            if (tile.units[i].owner === player)
            {
                return `${this}, cannot attack units on their own side`;
            }
        }
        
        // Check if type is valid
        if (!this.type) {
            return `${this}, has an unknown type`;
        }
        else
        {
            if (!this.type.title) {
                return `${this}, has an unknown type name`;
            }
        }
        
        // Check if damage is valid
        if (!this.damage) {
            return `${this}, has unknown damage`;
        }
        
        // Check if any unit on tile has health
        let found: boolean = false;
        for (let i: number = 0; i < tile.units.length; i++) {
            if (0 < tile.units[0].health)
            {
                found = true;
                break; // Exit for-loop
            }
        }
        if (!found)
        {
            return `${this}, targets have zero health`;
        }
        
        if (this.attcked) {
            return `${this}, has already attacked this turn`;
        }
        
        // <<-- /Creer-Merge: invalidate-attack -->>
    }
    
    /**
     * Attacks an enemy unit on an tile within it's range.
     *
     * @param player - The player that called this.
     * @param tile - The Tile to attack.
     * @returns True if successfully attacked, false otherwise.
     */
    protected async attack(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: attack -->>
        
        /*
         * Damage That Towers Do To Units
         * Castle | Arrow | Ballista | Cleansing | AOE
         * -------+-------+----------+-----------+-----
         *    5   |   5   |    20    |     5     |  3
         */
        
        if (this.type.title === "aoe")
        {
            // Attack logic for AOE tower
            for (let i: number = 0; i < tile.units.length; i++)
            {
                if (0 < tile.units[i].health) {
                    /*
                     * The Math.max function with 0 as an argument will ensure
                     * the health of a unit is always equal or greater than 0
                     */
                    tile.units[i].health = Math.max(0, tile.units[i].health -
                                                    this.damage);
                }
            }
        }
        else
        {
            // Attack logic for other towers
            for (let i: number  = 0; i < tile.units.length; i++)
            {
                if (0 < tile.units[i].health) {
                    /*
                     * The Math.max function with 0 as an argument will ensure
                     * the health of a unit is always equal or greater than 0
                     */
                    tile.units[i].health = Math.max(0, tile.units[i].health -
                                                    this.damage);
                }
                break; // Exit for-loop
            }
        }
        
        // Remove units on tile with zero health and add corpses
        for (let i: number = 0; i < tile.units.length; i++) {
            if (tile.units[i].health <= 0)
            {
                tile.corpses++; // Add corpse to tile
                tile.units.splice(i, 1); // Remove unit from array
            }
        }
        
        // Remove units in game with zero health
        for (let i: number = 0; i < game.units.length; i++) {
            if (game.units[i].health <= 0)
            {
                game.units.splice(i, 1); // Remove unit from array
            }
        }
        
        return true;
        
        // <<-- /Creer-Merge: attack -->>
    }
    
    // <<-- Creer-Merge: protected-private-functions -->>
    
    /*
     * Returns the distance between the points
     *
     * @param x1: the first x coordinate.
     * @param y1: the first y coordinate.
     * @param x2: the second x coordinate.
     * @param y2: the second y coordinate.
     *
     * @returns the distance between the points.
     */
    private distance(x1: number, y1: number, x2: number, y2: number): number {
        // Calculate differences
        const xDif: number = (x1 - x2);
        const yDif: number = (y1 - y2);
        return Math.sqrt((xDif ** 2) + (yDif ** 2));
    }
    
    // <<-- /Creer-Merge: protected-private-functions -->>
}

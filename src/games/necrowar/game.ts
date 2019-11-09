import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { NecrowarGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { NecrowarGameSettingsManager } from "./game-settings";
import { Player } from "./player";
import { tJob } from "./t-job"
import { Tile } from "./tile";
import { Tower } from "./tower";
import { uJob } from "./u-job"
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
import { Mutable } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Send hordes of the undead at your opponent while defending yourself against
 * theirs to win.
 */
export class NecrowarGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: NecrowarGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     */
    public currentPlayer!: Player;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     */
    public currentTurn!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The amount of gold income per turn per unit in a mine.
     */
    public readonly goldIncomePerUnit!: number;

    /**
     * The amount of gold income per turn per unit in the island mine.
     */
    public readonly islandIncomePerUnit!: number;

    /**
     * The Amount of gold income per turn per unit fishing on the river side.
     */
    public readonly manaIncomePerUnit!: number;

    /**
     * The number of Tiles in the map along the y (vertical) axis.
     */
    public readonly mapHeight!: number;

    /**
     * The number of Tiles in the map along the x (horizontal) axis.
     */
    public readonly mapWidth!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * The amount of turns it takes between the river changing phases.
     */
    public readonly riverPhase!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * A list of every tower type / job.
     */
    public tJobs!: tJob[];

    /**
     * All the tiles in the map, stored in Row-major order. Use `x + y *
     * mapWidth` to access the correct index.
     */
    public tiles!: Tile[];

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

    /**
     * Every Tower in the game.
     */
    public towers!: Tower[];

    /**
     * A list of every unit type / job.
     */
    public uJobs!: uJob[];

    /**
     * Every Unit in the game.
     */
    public units!: Unit[];

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: NecrowarGameSettingsManager,
        required: Readonly<IBaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        
        this.createUJobs();
        
        this.createTJobs();
        
        this.createMap();
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Gets the tile at (x, y), or undefined if the co-ordinates are off-map.
     *
     * @param x - The x position of the desired tile.
     * @param y - The y position of the desired tile.
     * @returns The Tile at (x, y) if valid, undefined otherwise.
     */
    public getTile(x: number, y: number): Tile | undefined {
        // tslint:disable-next-line:no-unsafe-any
        return super.getTile(x, y) as Tile | undefined;
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.
    /** Creates all unit types in the game */
    private createUJobs(): void {
        // pushes all unit types
        this.uJobs.push(
            this.manager.create.uJob({
                title: "worker",
                goldCost: 10,
                manaCost: 0,
                damage: 0,
                health: 1,
                moves: 10,
                range: 1,
                perTile: 1,
            }),

            this.manager.create.uJob({
                title: "zombie",
                goldCost: 0,
                manaCost: 2,
                damage: 1,
                health: 5,
                moves: 10,
                range: 1,
                perTile: 10,
            }),

            this.manager.create.uJob({
                title: "ghoul",
                goldCost: 20,
                manaCost: 5,
                damage: 5,
                health: 15,
                moves: 10,
                range: 1,
                perTile: 2,
            }),

            this.manager.create.uJob({
                title: "abomination",
                goldCost: 25,
                manaCost: 10,
                damage: 10,
                health: 60,
                moves: 10,
                range: 1,
                perTile: 1,
            }),

            this.manager.create.uJob({
                title: "hound",
                goldCost: 15,
                manaCost: 4,
                damage: 5,
                health: 5,
                moves: 10,
                range: 1,
                perTile: 3,
            }),

            this.manager.create.uJob({
                title: "wraith",
                goldCost: 40,
                manaCost: 20,
                damage: 10,
                health: 10,
                moves: 10,
                range: 1,
                perTile: 1,
            }),

            this.manager.create.uJob({
                title: "horseman",
                goldCost: 150,
                manaCost: 50,
                damage: 15,
                health: 75,
                moves: 10,
                range: 1,
                perTile: 1,
            }),

        );
    }
    
    private createTJobs(): void {
        // pushes all tower types
        this.tJobs.push(
            this.manager.create.tJob({
                title: "arrow",
                goldCost: 50,
                manaCost: 0,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 1,
                allUnits: false,
                damage: 5,
            }),

            this.manager.create.tJob({
                title: "ballista",
                goldCost: 75,
                manaCost: 0,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 3,
                allUnits: false,
                damage: 20,
            }),

            this.manager.create.tJob({
                title: "cleansing",
                goldCost: 30,
                manaCost: 30,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 1,
                allUnits: false,
                damage: 5,
            }),

            this.manager.create.tJob({
                title: "aoe",
                goldCost: 40,
                manaCost: 15,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 1,
                allUnits: true,
                damage: 3,
            }),
        );
    }

    /**
     * Generates the map
     */
    private createMap(): void {
        /**
         * Utility function to get a mutable tile at a given (x, y).
         *
         * NOTE: This is a closure function. It is a function we create while
         * running createMap(), and it wraps the current scope, so that `this`
         * refers to the Game running `createMap()`, even though the game was
         * not passed.
         * @param x - The x coordinate. If off map throws an Error.
         * @param y - The y coordinate. If off map throws an Error.
         * @returns A Tile that is mutable JUST for this function scope.
         */
        const getMutableTile = (x: number, y: number): Mutable<Tile> => {
            const tile = this.getTile(x, y);
            if (!tile) {
                throw new Error(`Cannot get a tile for map generation at (${x}, ${y})`);
            }

            return tile;
        };

        //Cover a whole side in grass tiles
        for (let x = 0; x < (this.mapWidth / 2 - 3); x++) {
            for (let y = 0; y < this.mapHeight; y++) {        
                getMutableTile(x, y).isGrass = true;
            }
        }

        //Cover the middle stripe in river tiles
        for (let x = (this.mapWidth / 2 - 1); x < (this.mapWidth / 2 + 1); x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                getMutableTile(x, y).isRiver = true;
            }
        }

        //Create the paths going around the map
        for (let x = 0; x < (this.mapWidth / 2); x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                if (
                //Top Part
                ((y === (this.mapHeight - 5)) && (x > 5)) ||
                ((y === (this.mapHeight - 6)) && (x > 5)) ||
                //Bottom Part
                ((y === 5) && (x > 10)) ||
                ((y === 6) && (x > 10)) ||
                //Left Side Part
                ((y > 5) && (y < (this.mapHeight - 5)) && (x === 5)) ||
                ((y > 5) && (y < (this.mapHeight - 5)) && (x === 6))
                ){
                    getMutableTile(x, y).isPath = true;
                }
            }
        }
        
        //Create the extra paths surrounding the castle location
        getMutableTile(7, 7).isPath = true;
        getMutableTile(7, 6).isPath = true;
        getMutableTile(7, 5).isPath = true;

        //Place castle
        getMutableTile(6, 6).isCastle = true;

        //Place gold mine tiles
        for (let x = 10; x <= 11; x++) {
            for (let y = (this.mapHeight - 10); y <= (this.mapHeight - 11); y++) {
                getMutableTile(x, y).isGoldMine = true;
            }
        }

        //Set Worker Spawn
        getMutableTile(8, 9).isWorkerSpawn = true;
        //Set Unit Spawn
        getMutableTile(11, 6).isUnitSpawn = true;

        //Mirror the generated map for the other side, both mirroring x and y so it flips diagnolly
        for(let x = 0; x < this.mapWidth / 2; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                //Grass
                if(getMutableTile(x, y).isGrass = true) {
                    getMutableTile((this.mapWidth - x), (this.mapHeight - y)).isGrass = true
                }
                //Paths
                if(getMutableTile(x, y).isPath = true) {
                    getMutableTile((this.mapWidth - x), (this.mapHeight - y)).isPath = true
                }
                //Gold Mines
                if(getMutableTile(x, y).isGoldMine = true) {
                    getMutableTile((this.mapWidth - x), (this.mapHeight - y)).isGoldMine = true
                }
                //Castle
                if(getMutableTile(x, y).isCastle = true) {
                    getMutableTile((this.mapWidth - x), (this.mapHeight - y)).isCastle = true
                }
                //Worker Spawn
                if(getMutableTile(x, y).isWorkerSpawn = true) {
                    getMutableTile((this.mapWidth - x), (this.mapHeight - y)).isWorkerSpawn = true
                }
                //Unit Spawn
                if(getMutableTile(x, y).isUnitSpawn = true) {
                    getMutableTile((this.mapWidth - x), (this.mapHeight - y)).isUnitSpawn = true
                }
            }
        }

        //Generate Island
        //Make a Square of river in the center of the map, the "lake"
        for (let x = (this.mapWidth / 2 - 2); x <= (this.mapWidth / 2 + 2); x++) {
            for (let y = (this.mapHeight / 2 - 2); y < (this.mapHeight / 2 + 2); y++) {
                getMutableTile(x, y).isRiver = true;
            }
        }
        //Make a smaller square of grass within the "lake"
        for (let x = (this.mapWidth / 2 - 1); x <= (this.mapWidth / 2 + 1); x++) {
            for (let y = (this.mapHeight / 2 - 1); y < (this.mapHeight / 1 + 2); y++) {
                getMutableTile(x, y).isGrass = true;
            }
        }
        //Make island mine tiles on the middle three tiles
        for (let x = (this.mapWidth / 2); x <= (this.mapWidth / 2); x++) {
            for (let y = (this.mapHeight / 2 - 1); y < (this.mapHeight / 1 + 2); y++) {
                getMutableTile(x, y).isIslandGoldMine = true;
            }
        }

    }
    
    // <<-- /Creer-Merge: protected-private-functions -->>
}

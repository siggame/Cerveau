import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { NecrowarGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { NecrowarGameSettingsManager } from "./game-settings";
import { Player } from "./player";
import { Tile } from "./tile";
import { Tower } from "./tower";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
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
     * The maximum number of workers that can occupy the mine on the island at
     * a given time.
     */
    public readonly islandUnitCap!: number;

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
     * The maximum number of workers that can occupy a mine at a given time.
     */
    public readonly mineUnitCap!: number;

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
                damage 5,
            }),

            this.manager.create.tJob({
                title: "ballista",
                goldCost: 75,
                manaCost: 0,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 3,
                allUnits: false,
                damage 20,
            }),

            this.manager.create.tJob({
                title: "cleansing",
                goldCost: 30,
                manaCost: 30,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 1,
                allUnits: false,
                damage 5,
            }),

            this.manager.create.tJob({
                title: "aoe",
                goldCost: 40,
                manaCost: 15,
                health: 30,
                range: 3,
                turnsBetweenAttacks: 1,
                allUnits: true,
                damage 3,
            }),
        );
    }

    private createMap(): void {
        
    }
    
    // <<-- /Creer-Merge: protected-private-functions -->>
}

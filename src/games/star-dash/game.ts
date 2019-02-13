import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Body } from "./body";
import { StarDashGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { StarDashGameSettingsManager } from "./game-settings";
import { Job } from "./job";
import { Player } from "./player";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Collect of the most of the rarest mineral orbiting aroung the sun and
 * outcompete your competetor.
 */
export class StarDashGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: StarDashGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * All the celestial bodies in the game.
     */
    public bodies!: Body[];

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
     * The distance traveled each turn by dashing.
     */
    public readonly dashDistance!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * A list of all jobs. first item is corvette, second is missleboat, third
     * is martyr, fourth is transport, and fifth is miner.
     */
    public jobs!: Job[];

    /**
     * The highest amount of material, barring rarity, that can be in a
     * asteroid.
     */
    public readonly maxAsteroid!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The smallest amount of material, barring rarity, that can be in a
     * asteroid.
     */
    public readonly minAsteroid!: number;

    /**
     * The rarity modifier of the most common ore. This controls how much
     * spawns.
     */
    public readonly oreRarity1!: number;

    /**
     * The rarity modifier of the second rarest ore. This controls how much
     * spawns.
     */
    public readonly oreRarity2!: number;

    /**
     * The rarity modifier of the rarest ore. This controls how much spawns.
     */
    public readonly oreRarity3!: number;

    /**
     * The amount of energy the planets restore each round.
     */
    public readonly planetRechargeRate!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * The regeneration rate of asteroids.
     */
    public readonly regenerateRate!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The size of the map in the X direction.
     */
    public readonly sizeX!: number;

    /**
     * The size of the map in the Y direction.
     */
    public readonly sizeY!: number;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

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
        protected settingsManager: StarDashGameSettingsManager,
        required: Readonly<IBaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.createJobs();

        this.createMap();
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    /** Creates all the Jobs in the game */
    private createJobs(): void {
        // push all three jobs.
        this.jobs.push(
            this.manager.create.job({
                title: "corvette",
                carryLimit: 0,
                damage: 10,
                health: 100,
                moves: 10,
            }),

            this.manager.create.job({
                title: "missleboat",
                carryLimit: 0,
                damage: 100,
                health: 100,
                moves: 10,
            }),

            this.manager.create.job({
                title: "martyr",
                carryLimit: 0,
                damage: 0,
                health: 100,
                moves: 10,
            }),

            this.manager.create.job({
                title: "transport",
                carryLimit: 20,
                damage: 0,
                health: 100,
                moves: 10,
            }),

            this.manager.create.job({
                title: "miner",
                carryLimit: 10,
                damage: 0,
                health: 100,
                moves: 10,
            }),
        );
    }

    /** Generates the map for testing */
    private createMap(): void {
        // push all the bodies that are made in the generator.
        this.bodies.push(
            this.manager.create.body({
                bodyType: "planet",
                materialType: "none",
                radius: 150,
                x: 200,
                y: 900,
            }),

            this.manager.create.body({
                bodyType: "planet",
                materialType: "none",
                radius: 150,
                x: 3000,
                y: 900,
            }),

            this.manager.create.body({
                bodyType: "sun",
                materialType: "none",
                radius: 350,
                x: 1600,
                y: 900,
            }),

            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "genarium",
                radius: 50,
                x: 1600,
                y: 400,
            }),

            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "genarium",
                radius: 50,
                x: 1600,
                y: 1400,
            }),

            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "rarium",
                radius: 50,
                x: 2033,
                y: 1150,
            }),

            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "rarium",
                radius: 50,
                x: 2033,
                y: 650,
            }),

            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "legendarium",
                radius: 50,
                x: 1167,
                y: 1150,
            }),

            this.manager.create.body({
                bodyType: "asteroid",
                materialType: "Mythicite",
                radius: 90,
                x: 1167,
                y: 650,
            }),
        );
    }
    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

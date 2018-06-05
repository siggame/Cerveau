import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Building } from "./building";
import { Forecast } from "./forecast";
import { AnarchyGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { AnarchyGameSettingsManager } from "./game-settings";
import { Player } from "./player";

// <<-- Creer-Merge: imports -->>
import { ArrayUtils, IPoint } from "~/utils";

const DIRECTIONAL_OFFSETS = {
    North: { x: 0, y: -1 },
    East: { x: 1, y: 0 },
    South: { x: 0, y: 1 },
    West: { x: -1, y: 0 },
};

function pointToKey(pt: IPoint): string {
    return `${pt.x},${pt.y}`;
}

function keyToPoint(str: string): IPoint {
    const split = str.split(",");
    return {
        x: Number(split[0]),
        y: Number(split[1]),
    };
}

// <<-- /Creer-Merge: imports -->>

/**
 * Two player grid based game where each player tries to burn down the other
 * player's buildings. Let it burn.
 */
export class AnarchyGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: AnarchyGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * How many bribes players get at the beginning of their turn, not counting
     * their burned down Buildings.
     */
    public readonly baseBribesPerTurn!: number;

    /**
     * All the buildings in the game.
     */
    public buildings!: Building[];

    /**
     * The current Forecast, which will be applied at the end of the turn.
     */
    public currentForecast: Forecast;

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
     * All the forecasts in the game, indexed by turn number.
     */
    public forecasts!: Forecast[];

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The width of the entire map along the vertical (y) axis.
     */
    public readonly mapHeight!: number;

    /**
     * The width of the entire map along the horizontal (x) axis.
     */
    public readonly mapWidth!: number;

    /**
     * The maximum amount of fire value for any Building.
     */
    public readonly maxFire!: number;

    /**
     * The maximum amount of intensity value for any Forecast.
     */
    public readonly maxForecastIntensity!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The next Forecast, which will be applied at the end of your opponent's
     * turn. This is also the Forecast WeatherStations can control this turn.
     */
    public nextForecast?: Forecast;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    public readonly timeAddedPerTurn!: number;

    // <<-- Creer-Merge: attributes -->>

    /** A handy 2D grid of all the buildings. */
    public readonly buildingsGrid = ArrayUtils.make2D<Building>(this.mapWidth, this.mapHeight);

    /** The valid cardinal directions buildings can be in. */
    public readonly directions: ["North", "East", "South", "West"] = ["North", "East", "South", "West"];

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: AnarchyGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        const MIN_NUM_POINTS = 8;
        const MAX_NUM_POINTS = 15;
        const NUM_POINTS = this.manager.random.int(MAX_NUM_POINTS, MIN_NUM_POINTS);

        const MIN_EDGE_POINTS = 1;
        const MAX_EDGE_POINTS = 5;
        const EDGE_POINTS = this.manager.random.int(MAX_EDGE_POINTS, MIN_EDGE_POINTS);
        const pointsSet = new Set<string>();

        // add random points (regular and edge points)
        for (let i = 0; i < NUM_POINTS + EDGE_POINTS; i++) {
            const x = i < NUM_POINTS
                ? this.manager.random.int(this.mapWidth / 2 - 1, 0)
                : this.mapWidth / 2 - 1;
            const y = this.manager.random.int(this.mapHeight - 1, 0);

            pointsSet.add(pointToKey({x, y}));
        }

        // now connect the points, after shuffling them
        const points = Array.from(pointsSet);
        this.manager.random.shuffle(points);

        const startingLength = points.length;
        for (let i = 0; i < startingLength; i++) {
            let from: IPoint = keyToPoint(points[i]);
            const to: IPoint = keyToPoint(points[i + 1]);

            while (true) {
                const changes: IPoint[] = [];
                // Is there a better way to do this?
                if (from.x < to.x) {
                    changes.push({ x: 1, y: 0 });
                }
                else if (from.x > to.x) {
                    changes.push({ x: -1, y: 0 });
                }
                if (from.y < to.y) {
                    changes.push({ x: 0, y: 1 });
                }
                else if (from.y > to.y) {
                    changes.push({ x: 0, y: -1 });
                }
                // this means that the point has already been reached
                // so break from the loop
                if (changes.length === 0) {
                    break;
                }
                // otherwise choose a random direction and add it to the
                // points
                const change = this.manager.random.element(changes)!;
                const connectedPoint = {
                    x: from.x + change.x,
                    y: from.y + change.y,
                };

                from = connectedPoint;
                points.push(pointToKey(connectedPoint));
            }
        }
        this.manager.random.shuffle(points);

        const buildingTypes = ["Warehouse", "FireDepartment", "PoliceDepartment", "WeatherStation"];
        const buildingsByWeight = new Map<string, number>();
        buildingsByWeight.set("Warehouse", 0.40);
        buildingsByWeight.set("FireDepartment", 0.30);
        buildingsByWeight.set("PoliceDepartment", 0.20);
        buildingsByWeight.set("WeatherStation", 0.10);

        const minimumBuildingsPerType = 2;
        const originalBuildings = [];

        let madeHQ = false;
        for (let i = 0; i < points.length; i++) {
            let buildingType = buildingTypes[i % buildingTypes.length];
            if (i >= minimumBuildingsPerType * buildingTypes.length) {
                // then we have the minimum number of buildings we want, so now
                // introduce some random-ness

                buildingType = this.manager.random.fromWeights(buildingsByWeight);
            }

            let isHeadquarters = false;
            if (!madeHQ && buildingType === "Warehouse") {
                isHeadquarters = true;
                madeHQ = true;
            }

            const { x, y } = keyToPoint(points[i]);
            originalBuildings.push(this.manager.createBuilding(buildingType, {
                x,
                y,
                isHeadquarters,
                owner: this.manager.random.element(this.players)!,
            }));
        }

        // mirror the map
        for (const originalBuilding of originalBuildings) {
            this.manager.createBuilding(originalBuilding.gameObjectName, {
                x: this.mapWidth - originalBuilding.x - 1,
                y: originalBuilding.y,
                owner: originalBuilding.owner.opponent,
                isHeadquarters: originalBuilding.isHeadquarters,
            });
        }

        // now all the buildings on the map should be created, so hook up the north/east/south/west pointers
        for (const building of this.buildings) {
            for (const [direction, offset] of Object.entries(DIRECTIONAL_OFFSETS)) {
                (building as any)[`building${direction}`] = this.getBuildingAt(
                    building.x + offset.x,
                    building.y + offset.y,
                );
            }
        }

        // create the forecasts, each "set" of turns (e.g. 0 and 1, 100 and 101,
        // 264 and 265, etc) are the same initial states for each player.
        for (let i = 0; i < this.maxTurns; i += 2) {
            let direction = this.manager.random.element(this.directions)!;
            const intensity = this.manager.random.int(this.maxForecastIntensity);

            for (let j = 0; j < 2; j++) {
                if (j === 1) { // for the second player's forecasts mirror the directions East/West
                    if (direction === "East") {
                        direction = "West";
                    }
                    else if (direction === "West") {
                        direction = "East";
                    }
                }

                direction = direction || "North";

                this.forecasts.push(this.manager.create.Forecast({
                    direction,
                    intensity,
                    controllingPlayer: this.players[j],
                }));
            }
        }

        this.currentForecast = this.forecasts[0];
        this.nextForecast = this.forecasts[1];

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Gets a building at a specified (x, y).
     *
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns The building at (x, y), or undefined if there is none.
     */
    public getBuildingAt(x: number, y: number): Building | undefined {
        if (x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
            return this.buildingsGrid[x][y];
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

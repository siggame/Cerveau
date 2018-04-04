// Game: Two player grid based game where each player tries to burn down the other player's buildings. Let it burn.

import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses, Building, Forecast, GameManager, GameObject, Player } from "./";
import { IAnarchyGameSettings } from "./game-settings";

// <<-- Creer-Merge: requires -->>
import { ArrayUtils, IPoint } from "~/utils";
// <<-- /Creer-Merge: requires -->>

const DIRECTIONAL_OFFSETS = {
    North: { x: 0, y: -1 },
    East: { x: 1, y: 0 },
    South: { x: 0, y: 1 },
    West: { x: -1, y: 0 },
};

/**
 * Two player grid based game where each player tries to burn down the other
 * player's buildings. Let it burn.
 */
export class Game extends BaseClasses.Game {
    public readonly manager!: GameManager;

    /**
     * How many bribes players get at the beginning of their turn, not counting their burned down Buildings.
     */
    public readonly baseBribesPerTurn!: number;

    /**
     * All the buildings in the game.
     */
    public readonly buildings!: Building[];

    /**
     * The current Forecast, which will be applied at the end of the turn.
     */
    public currentForecast: Forecast;

    /**
     * The player whose turn it is currently. That player can send commands. Other players cannot.
     */
    public currentPlayer!: Player;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     */
    public currentTurn!: number;

    /**
     * All the forecasts in the game, indexed by turn number.
     */
    public readonly forecasts!: Forecast[];

    /**
     * All the game objects in the game, indexed by id
     */
    public readonly gameObjects!: {[id: string]: GameObject | undefined};

    /**
     * The maximum amount of fire value for any Building.
     */
    public readonly maxFire: number = this.maxFire || 0;

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

    public readonly mapWidth!: number;
    public readonly mapHeight!: number;

    public readonly buildingsGrid = ArrayUtils.make2D<Building>(this.mapWidth, this.mapHeight);

    /**
     * List of all the players in the game.
     */
    public readonly players!: Player[];

    public readonly settings!: Readonly<IAnarchyGameSettings>;

    // creer-merge
    public readonly directions: ["north", "east", "south", "west"] = ["north", "east", "south", "west"];

    // private readonly buildingsGrid = make2D<Building>(this.mapWidth, this.mapHeight);
    // /creer-merge

    /**
     * Initializes Games.
     * @param data - the game settings
     */
    constructor(settings: IAnarchyGameSettings, required: IBaseGameRequiredData) {
        super(settings, required);

        // <<-- Creer-Merge: init -->>

        // Some configuration parameters to change map generation
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

            pointsSet.add(JSON.stringify({x, y}));
        }

        // now connect the points, after shuffling them
        let points = this.manager.random.shuffle(Array.from(pointsSet));
        const startingLength = points.length;
        for (let i = 0; i < startingLength; i++) {
            let from: IPoint = JSON.parse(points[i]);
            const to: IPoint = JSON.parse(points[i + 1]);

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
                const change = this.manager.random.element(changes);
                const connectedPoint = {
                    x: from.x + change.x,
                    y: from.y + change.y,
                };

                from = connectedPoint;
                points.push(JSON.stringify(connectedPoint));
            }
        }
        points = this.manager.random.shuffle(points);

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

            const {x, y} = JSON.parse(points[i]);
            originalBuildings.push(this.manager.createBuilding(buildingType, {
                x,
                y,
                isHeadquarters,
                owner: this.manager.random.element(this.players),
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
            let direction = this.manager.random.element(this.directions);
            const intensity = this.manager.random.int(this.maxForecastIntensity);

            for (let j = 0; j < 2; j++) {
                if (j === 1) { // for the second player's forecasts mirror the directions East/West
                    if (direction === "east") {
                        direction = "west";
                    }
                    else if (direction === "west") {
                        direction = "east";
                    }
                }

                this.forecasts.push(this.manager.create.Forecast({
                    direction,
                    intensity,
                    controllingPlayer: this.players[j],
                }));
            }
        }

        this.currentForecast = this.forecasts[0];
        this.nextForecast = this.forecasts[1];

        // <<-- /Creer-Merge: init -->>
    }

    public getBuildingAt(x: number, y: number): Building | undefined {
        if (x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
            return this.buildingsGrid[x][y];
        }
    }
}

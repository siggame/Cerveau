import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Beaver } from "./beaver";
import { StumpedGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { StumpedGameSettingsManager } from "./game-settings";
import { Job } from "./job";
import { Player } from "./player";
import { Spawner } from "./spawner";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
import { jobStats } from "./job-stats";
// <<-- /Creer-Merge: imports -->>

/**
 * Gather branches and build up your lodge as beavers fight to survive.
 */
export class StumpedGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: StumpedGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * Every Beaver in the game.
     */
    public beavers!: Beaver[];

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
     * When a Player has less Beavers than this number, then recruiting other
     * Beavers is free.
     */
    public readonly freeBeaversCount!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * All the Jobs that Beavers can have in the game.
     */
    public jobs!: Job[];

    /**
     * Constant number used to calculate what it costs to spawn a new lodge.
     */
    public readonly lodgeCostConstant!: number;

    /**
     * How many lodges must be owned by a Player at once to win the game.
     */
    public readonly lodgesToWin!: number;

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
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * Every Spawner in the game.
     */
    public spawner!: Spawner[];

    /**
     * Constant number used to calculate how many branches/food Beavers harvest
     * from Spawners.
     */
    public readonly spawnerHarvestConstant!: number;

    /**
     * All the types of Spawners in the game.
     */
    public spawnerTypes!: string[];

    /**
     * All the tiles in the map, stored in Row-major order. Use `x + y *
     * mapWidth` to access the correct index.
     */
    public tiles!: Tile[];

    // <<-- Creer-Merge: attributes -->>

    /**
     * The newly spawned beavers this turn that are not tracked in any arrays
     * (yet).
     */
    public readonly newBeavers: Beaver[] = [];
    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: StumpedGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.spawnerTypes.push("branches", "food");

        for (const title of Object.keys(jobStats).sort()) {
            this.jobs.push(
                this.manager.create.Job({
                    ...jobStats[title],
                    title,
                }),
            );
        }

        for (const player of this.players) {
            player.calculateBranchesToBuildLodge();
        }

        this.generateMap();

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
        return super.getTile(x, y) as Tile | undefined;
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /** Generates the map, by modifying tiles attributes. */
    private generateMap(): void {
        // Lake center
        const lake = Math.floor(this.mapWidth / 2);

        // Generate random metaballs where the lake will be
        const balls: Array<{ x: number; y: number; r: number }> = [];
        const minRadius = 0.5;
        const maxRadius = 5.0;
        const maxOffset = 2.0;
        const additionalBalls = 5;
        const gooeyNess = 1.0;
        const threshold = 3.5;
        const radiusRange = maxRadius - minRadius;

        // Initial ball (lake center)
        balls.push({
            x: lake,
            y: this.mapHeight / 2,
            r: this.manager.random.float() * radiusRange + minRadius,
        });

        // Extra balls
        for (let i = 0; i < additionalBalls; i++) {
            balls.push({
                x: lake + this.manager.random.float() * maxOffset * 2 - maxOffset,
                y: this.mapHeight / 2 - this.manager.random.float() * maxOffset,
                r: this.manager.random.float() * radiusRange + minRadius,
            });
        }

        // Generate lake from metaballs
        for (const tile of this.tiles) {
            let energy = 0;
            for (const ball of balls) {
                const r = ball.r;
                const dist = Math.sqrt(Math.pow(ball.x - tile.x, 2) + Math.pow(ball.y - tile.y, 2));
                const d = Math.max(0.0001, Math.pow(dist, gooeyNess));
                energy += r / d;
            }

            if (energy > threshold) {
                (tile as any).type = "water";
            }
        }

        /* Generate rivers */
        const minTheta = Math.PI / 4;
        const maxTheta = 3 * Math.PI / 4;
        const minThetaDelta = Math.PI / 6;
        const maxThetaDelta = Math.PI / 4;
        const thetaDeltaRange = maxThetaDelta - minThetaDelta;

        let theta = minTheta - minThetaDelta;
        while (true) {
            theta += this.manager.random.float() * thetaDeltaRange + minThetaDelta;
            if (theta >= maxTheta) {
                break;
            }
            // console.log(`Generating river at ${theta * 180 / Math.PI} degrees`);

            // Define the line segments
            const points: Array<{ x: number; y: number }> = [];

            // Starting point - The center of lake, at (0, 0)
            points.push({
                x: 0,
                y: 0,
            });

            // Final point - Outside the edge of the map
            points.push({
                x: this.mapWidth + this.mapHeight,
                y: 0,
            });

            // Generate fractals
            // createFractal(points, 0, 1);

            // Transform points
            const offset = Math.PI;
            for (const p of points) {
                const r = Math.sqrt(p.x * p.x + p.y * p.y);
                const t = Math.atan2(p.y, p.x) + theta + offset;
                p.x = lake + r * Math.cos(t);
                p.y = this.mapHeight / 2 + r * Math.sin(t);
            }

            // console.log("Points:");
            // console.log(points);

            // Draw line segments
            let collided = false;
            for (let i = 1; !collided && i < points.length; i++) {
                const a = points[i - 1];
                const b = points[i];

                // Useful values
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                let steps = 0;
                if (Math.abs(dx) > Math.abs(dy)) {
                    steps = Math.abs(dx);
                }
                else {
                    steps = Math.abs(dy);
                }
                const xInc = dx / steps;
                const yInc = dy / steps;

                let ax = a.x;
                let ay = a.y;
                let lastX = -1;
                let lastY = -1;
                for (let step = 0; !collided && step < steps; step++) {
                    ax += xInc;
                    ay += yInc;
                    const realX = Math.floor(ax);
                    const realY = Math.floor(ay);
                    const nextX = Math.floor(ax + xInc);
                    const nextY = Math.floor(ay + yInc);

                    // Verify the current tile exists
                    if (realX >= 0 && realY >= 0 && realX < this.mapWidth && realY < this.mapHeight / 2) {
                        // Set tile to water
                        const tile = this.getTile(realX, realY)!;

                        // Don't go diagonal
                        if (realX !== nextX && realY !== nextY) {
                            ay -= yInc;
                        }

                        // Flow direction
                        if (tile.type !== "water") {
                            if (realY > lastY) {
                                (tile as any).flowDirection = "North";
                            }
                            else if (realY < lastY) {
                                (tile as any).flowDirection = "South";
                            }
                            else if (realX < lastX) {
                                (tile as any).flowDirection = "East";
                            }
                            else if (realX > lastX) {
                                (tile as any).flowDirection = "West";
                            }

                            (tile as any).type = "water";
                        }
                        else if (tile.flowDirection !== "") {
                            collided = true;
                        }
                    }

                    // Update last coords
                    lastX = realX;
                    lastY = realY;
                }
            }
        }

        // create spawners
        for (const type of this.spawnerTypes as ["branches", "food"]) {
            const max = type === "branches"
                ? this.settings.maxBranchSpawners
                : this.settings.maxFoodSpawners;
            const min = type === "branches"
                ? this.settings.minBranchSpawners
                : this.settings.minFoodSpawners;

            const count = this.manager.random.int(max, min);
            const tileType = type === "food" ? "water" : "land";

            for (let i = 0; i < count; i++) {
                let tile: Tile | undefined;
                while (!tile || tile.type !== tileType) {
                    // generate a new tile to see if it is valid
                    tile = this.getTile(
                        this.manager.random.int(this.mapWidth - 1),
                        this.manager.random.int(this.mapHeight / 2 - 1),
                    );
                }

                this.manager.create.Spawner({ tile, type });
            }
        }

        /* Mirror map */
        for (const orig of this.tiles) {
            const target = this.getTile(orig.x, this.mapHeight - orig.y - 1)!;

            // Copy data
            (target as any).type = orig.type;
            (target as any).flowDirection = orig.flowDirection === "North" || orig.flowDirection === "South"
                ? this.invertTileDirection(orig.flowDirection)
                : orig.flowDirection;

            // clone Spawner
            if (orig.spawner) {
                target.spawner = this.manager.create.Spawner({
                    tile: target,
                    type: orig.spawner.type,
                });
            }
        }

        /* Place starting beavers */
        let x = 0;
        let y = 0;
        do {
            x = this.manager.random.int(this.mapWidth);
            y = this.manager.random.int(this.mapHeight / 2);
        } while (this.getTile(x, y)!.spawner);

        const p1 = this.getTile(x, y)!;
        const p2 = this.getTile(x, this.mapHeight - y - 1)!;

        // Player 1
        this.manager.create.Beaver({
            owner: this.players[0],
            tile: p1,
            job: this.jobs[0],
            recruited: true,
            branches: 1,
        });

        // Player 2
        this.manager.create.Beaver({
            owner: this.players[0].opponent,
            tile: p2,
            job: this.jobs[0],
            recruited: true,
            branches: 1,
        });

        this.manager.cleanupArrays();
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

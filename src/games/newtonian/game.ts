import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { NewtonianGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { NewtonianGameSettingsManager } from "./game-settings";
import { Job } from "./job";
import { Machine } from "./machine";
import { Player } from "./player";
import { Tile } from "./tile";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Combine elements and be the first scientists to create fusion.
 */
export class NewtonianGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: NewtonianGameManager;

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
     * Determins the rate at which the highest value victory points degrade.
     */
    public readonly degradeRate!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * How many interns a player can have.
     */
    public readonly internCap!: number;

    /**
     * Every job in the game.
     */
    public jobs!: Job[];

    /**
     * Every Machine in the game.
     */
    public machines!: Machine[];

    /**
     * How many managers a player can have.
     */
    public readonly managerCap!: number;

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
     * How many physicists a player can have.
     */
    public readonly physicistCap!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * How much each refined ore adds when put in the generator.
     */
    public readonly refinedValue!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The number of turns between spawning unit waves.
     */
    public readonly spawnTime!: number;

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
        protected settingsManager: NewtonianGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.createJobs();

        this.createMap();

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->

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
    /** Creates all the Jobs in the game */
    private createJobs(): void {
        this.jobs.push(
            this.manager.create.job({
                title: "intern",
                carryLimit: 4,
                damage: 4,
                health: 12,
                moves: 3,
            }),

            this.manager.create.job({
                title: "physicists",
                carryLimit: 1,
                damage: 4,
                health: 12,
                moves: 3,
            }),

            this.manager.create.job({
                title: "manager",
                carryLimit: 0,
                damage: 4,
                health: 16,
                moves: 3,
            }),
        );
    }

    /**
     * Generates the map by modifying Tiles in the game.
     *
     * TODO: sig game devs make this sane. Stop drinking and write code that
     * humans can understand.
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
        const getMutableTile = (x: number, y: number): MutableRequired<Tile> => {
            const tile = this.getTile(x, y);
            if (!tile) {
                throw new Error(`Cannot get a tile for map generation at (${x}, ${y})`);
            }

            return tile;
        };

        // TODO: Machine list
        const RMstart = 7;
        const MMstart = 25;
        const spawnEnd = 7;
        const genEnd = 15;
        const startEnd = 5;
        const mid = Math.floor(this.mapHeight / 2);
        for (let x = 0; x < (this.mapWidth / 2 + 1); x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                if (y === 0 // bottom edge of map
                 || y === (this.mapHeight - 1) // top edge of map
                 || x === 0 // left edge of map
                 || x === RMstart
                 || x === MMstart
                 || x === Math.floor(this.mapWidth / 2) - 1
                 || (x < startEnd && (y === spawnEnd || y === genEnd))
                ) {
                    getMutableTile(x, y).isWall = true;
                }
            }
        }

        // --- Set spawn area --- \\
        for (let x = 1; x <= startEnd - 1; x++) {
            for (let y = 1; y < spawnEnd; y++) {
                const tile = getMutableTile(x, y);

                tile.owner = this.players[0];
                tile.type = "spawn";
            }
        }

        // --- Set generator area --- \\
        for (let x = 1; x <= startEnd - 1; x++) {
            for (let y = spawnEnd + 1; y < genEnd; y++) {
                const tile = getMutableTile(x, y);

                tile.owner = this.players[0];
                tile.type = "generator";
            }
        }

        // --- Set resource spawn --- \\
        const resourceSpawns: Array<{
            x: number;
            y: number;
            direction: Tile["direction"];
        }> = [
            { x: 1, y: 20, direction: "east" },
            { x: 2, y: 20, direction: "east" },
            { x: 3, y: 20, direction: "east" },
            { x: 4, y: 20, direction: "north" },
            { x: 4, y: 19, direction: "north" },
            { x: 4, y: 18, direction: "north" },
            { x: 4, y: 17, direction: "west" },
            { x: 3, y: 17, direction: "west" },
            { x: 2, y: 17, direction: "west" },
            { x: 1, y: 17, direction: "blank" },
        ];
        for (const { x, y, direction } of resourceSpawns) {
            const tile = getMutableTile(x, y);

            tile.type = "conveyor";
            tile.direction = direction;
        }

        // --- Generate center --- \\
        // Determine the size of the center room
        const midSize = this.manager.random.int(6, 3);
        // Determine the rooms offset
        // TODO: lets are bad, don't use them
        // 0-7, 6 mean y = 0, 7 means y = maxHeight
        // let shift = this.manager.random.int(Math.floor(this.mapHeight / 2) - midSize);
        let shift = this.mapHeight / 2 - midSize - 5; // TODO: delete after testing
        // Edge case handling to make sure walls don't touch.
        if (shift === Math.floor(this.mapHeight / 2) - midSize - 1) {
            shift += 1;
        }
        // Decides weither the rooms shifts upwards or downwards
        /** used to determine random shifts and doorways */
        let shiftDir = Math.floor(this.manager.random.int(1, -1));
        /** Determines machines shift */
        let mShift = Math.floor(this.manager.random.int(midSize));
        if (shiftDir === 1) {
            mShift = -mShift;
        }

        // Generate the run time for the machiens
        const time = this.manager.random.int(2, 9);
        // determines the tile that machine will be on.
        const loc = getMutableTile(MMstart + 1, mid + shift + mShift);
        // makes the machine
        // TODO: FIX CREATE!
        const machine = this.manager.create.machine({
            oreType: "redium",
            refineTime: time,
            refineInput: (Math.floor(time / 2) + 1),
            refineOutput: Math.floor(time / 2),
            tile: loc as Tile,
        });
        // Assigned the tile it's machine.
        loc.machine = machine;
        // Adds the machine to the list
        this.machines.push(machine);

        // Clear out center hallway walls that would run through the center
        // room. also creats the top and bottom walls.
        for (let x = MMstart + 1; x < (this.mapWidth / 2) - 1; x++) {
            getMutableTile(x, mid + midSize + shift).isWall = true;
            getMutableTile(x, mid - midSize + shift).isWall = true;

            if (x === Math.floor(this.mapWidth / 2) - 1) {
                for (let y = mid - midSize + 1 + shift; y < mid + midSize + shift; y++) {
                    getMutableTile(x, y).isWall = false;
                }
            }
        }

        // generates structures that fill in the rest of the center area
        // top area
        // makes sure there is a top area.
        if (shift !== -(Math.floor(this.mapHeight / 2) - midSize)) {
            // if it has the smallest possible space and still exist, hallway time.
            if (shift === -(Math.floor(this.mapHeight / 2) - midSize - 2)) {
                getMutableTile(MMstart, 1).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 1).isWall = false;
            // if there are 2 spaces.
            }
            else if (shift === -(Math.floor(this.mapHeight / 2) - midSize - 3)) {
                const midSplit = this.manager.random.int(4, 0);
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    getMutableTile(MMstart + 3 + midSplit, 1).isWall = true;
                }
                else {
                    getMutableTile(MMstart + 3 + midSplit, 2).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    getMutableTile(MMstart, 1).isWall = false;
                }
                else {
                    getMutableTile(MMstart, 2).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 1).isWall = false;
                }
                else {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 2).isWall = false;
                }
            }
            else if (shift === -(Math.floor(this.mapHeight / 2) - midSize - 4)) {
                const midSplit = this.manager.random.int(3, 0);
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(MMstart + 3 + midSplit, 1).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 2).isWall = true;
                }
                else if (shiftDir === 1) {
                    getMutableTile(MMstart + 3 + midSplit, 2).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 3).isWall = true;
                }
                else {
                    getMutableTile(MMstart + 3 + midSplit, 1).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 3).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(MMstart, 1).isWall = false;
                }
                else if (shiftDir === 1) {
                    getMutableTile(MMstart, 2).isWall = false;
                }
                else {
                    getMutableTile(MMstart, 3).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 1).isWall = false;
                }
                else if (shiftDir === 1) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 2).isWall = false;
                }
                else {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 3).isWall = false;
                }
            }
            else if (shift === -(Math.floor(this.mapHeight / 2) - midSize - 5)) {
                const midSplit = this.manager.random.int(2, 0);
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(MMstart + 3 + midSplit, 1).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 2).isWall = true;
                }
                else if (shiftDir === 1) {
                    getMutableTile(MMstart + 3 + midSplit, 2).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 3).isWall = true;
                }
                else {
                    getMutableTile(MMstart + 3 + midSplit, 1).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 3).isWall = true;
                }
                getMutableTile(MMstart, 4).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 1).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 2).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 4).isWall = false;
                for (let x = MMstart + 1; x <= Math.floor(this.mapWidth / 2); x++) {
                    getMutableTile(x, 3).isWall = true;
                }
                shiftDir = Math.floor(this.manager.random.int(1, 0));
                if (shiftDir === 1) {
                    shiftDir = this.manager.random.int(2, 0);
                    if (shiftDir === 1) {
                        getMutableTile(Math.floor(this.mapWidth / 2) - 2, 1).isWall = true;
                    }
                    else {
                        getMutableTile(Math.floor(this.mapWidth / 2) - 2, 2).isWall = true;
                    }
                }
                else {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 2, 1).isWall = true;
                    getMutableTile(Math.floor(this.mapWidth / 2) - 2, 2).isWall = true;
                    if (midSplit === 1) {
                        shiftDir = this.manager.random.int(2, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 3, 3).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 4, 3).isWall = false;
                        }
                    }
                    else {
                        shiftDir = this.manager.random.int(3, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 3, 3).isWall = false;
                        }
                        else if (shiftDir === 2) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 4, 3).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 5, 3).isWall = false;
                        }
                    }
                }
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 0) {
                    if (midSplit === 1) {
                        shiftDir = this.manager.random.int(2, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 8, 3).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 7, 3).isWall = false;
                        }
                    }
                    else {
                        shiftDir = this.manager.random.int(3, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 6, 3).isWall = false;
                        }
                        else if (shiftDir === 2) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 7, 3).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 8, 3).isWall = false;
                        }
                    }
                }
                else {
                    shiftDir = this.manager.random.int(2, 0);
                    if (shiftDir === 1) {
                        getMutableTile(MMstart, 2).isWall = false;
                    }
                    else {
                        getMutableTile(MMstart, 1).isWall = false;
                    }
                }
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 3).isWall = false;
            }
            else {
                for (let y = 1; y < mid - midSize + shift; y++) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, y).isWall = false;
                }
                getMutableTile(Math.floor(this.mapWidth / 2), mid - midSize + shift).isWall = true;
                const a = 3; // this is hardset for one map. Because I am lazy.
                let b = Math.floor((mid - midSize + shift) / 3);
                let extra = 0;
                for (let i = mid - midSize + shift; i > 0; i -= 3) {
                    if (i > 0 && i < 3) {
                        extra = i;
                    }
                }
                const map: IRoom[][] = [];
                for (let i = 0; i < a; i++) {
                    map[i] = new Array(b); // TODO: do you understand what this does?
                }
                let yStart = 1;
                const yEnd = mid - midSize + shift - 1;
                let room = this.makeRoom(0, 0, 0, 0);
                let start = 0;
                if (extra === 2) {
                    for (let i = 0; i < a; i++) {
                        room = this.makeRoom(
                            MMstart + 1 + (i * 3), MMstart + 2 + (i * 3), yStart, yStart + 1, yStart + 2,
                        );
                        map[i][0] = room;
                        // getMutableTile(9+i, 2).isWall = true
                    }
                    start = 1;
                    yStart += 1;
                    for (let i = 0; i < a; i++) {
                        room = this.makeRoom(MMstart + 1 + (i * 3), MMstart + 2 + (i * 3), yEnd - 2, yEnd - 1 , yEnd);
                        map[i][b - 1] = room;
                        // getMutableTile(9+i, 1+b).isWall = true
                    }
                    b -= 1;
                }
                else if (extra === 1) {
                    shiftDir = this.manager.random.int(2, 0);
                    if (shiftDir === 1) {
                        for (let i = 0; i < a; i++) {
                            room = this.makeRoom(MMstart + 1 + (i * 3), MMstart + 2 +
                                      (i * 3), yStart, yStart + 1, yStart + 2);
                            map[i][0] = room;
                            // getMutableTile(9+i, 2).isWall = true
                        }
                        start = 1;
                        yStart += 1;
                    }
                    else {
                        for (let i = 0; i < a; i++) {
                            room = this.makeRoom(MMstart + 1 + (i * 3), MMstart + 2 +
                                           (i * 3), yEnd - 2, yEnd - 1 , yEnd);
                            map[i][b - 1] = room;
                            // getMutableTile(9+i, 1+b).isWall = true
                        }
                        b -= 1;
                    }
                }
                for (let x = 0; x < a; x++) {
                    for (let y = start; y < b; y++) {
                        room = this.makeRoom(MMstart + 1 + (x * 3), MMstart + 2 +
                                       (x * 3), yStart + (y * 3), yStart + 1 + (y * 3));
                        map[x][y] = room;
                        // getMutableTile(9+x, 2+y).isWall = true
                    }
                }
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir !== 0) {
                    map[0][map[0].length - 1].DSouth = true;
                }
                if (shiftDir !== 1) {
                    map[1][map[0].length - 1].DSouth = true;
                }
                if (shiftDir !== 2) {
                    map[2][map[0].length - 1].DSouth = true;
                }
                shiftDir = this.manager.random.int(map[0].length, 0);
                if (shiftDir !== 0) {
                    map[map.length - 1][0].DEast = true;
                }
                if (shiftDir !== 1) {
                    map[map.length - 1][1].DEast = true;
                }
                if (shiftDir !== 2 && map[map.length - 1][2]) {
                    map[map.length - 1][2].DEast = true;
                }
                if (shiftDir !== 3 && map[map.length - 1][3]) {
                    map[map.length - 1][3].DEast = true;
                }
                shiftDir = this.manager.random.int(map[0].length, 0);
                if (shiftDir !== 0) {
                    map[0][0].DWest = true;
                }
                if (shiftDir !== 1) {
                    map[0][1].DWest = true;
                }
                if (shiftDir !== 2 && map[map.length - 1][2]) {
                    map[0][2].DWest = true;
                }
                if (shiftDir !== 3 && map[map.length - 1][3]) {
                    map[0][3].DWest = true;
                }
                this.roomFill(map, getMutableTile);
            }
        }
        // bottom area
        if (shift !== Math.floor(this.mapHeight / 2) - midSize) {
            // generate for smallest leftover area - make a hallway
            if (shift === Math.floor(this.mapHeight / 2) - midSize - 2) {
                getMutableTile(MMstart, 21).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 21).isWall = false;
            // generate for a slightly bigger area.
            }
            else if (shift === Math.floor(this.mapHeight / 2) - midSize - 3) {
                const midSplit = this.manager.random.int(3, 0);
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    getMutableTile(MMstart + 3 + midSplit, 20).isWall = true;
                }
                else {
                    getMutableTile(MMstart + 3 + midSplit, 21).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    getMutableTile(MMstart, 21).isWall = false;
                }
                else {
                    getMutableTile(MMstart, 20).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 21).isWall = false;
                }
                else {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 20).isWall = false;
                }
            // generate a 4 tall area.
            }
            else if (shift === Math.floor(this.mapHeight / 2) - midSize - 4) {
                const midSplit = this.manager.random.int(3, 0);
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(MMstart + 3 + midSplit, 19).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 20).isWall = true;
                }
                else if (shiftDir === 1) {
                    getMutableTile(MMstart + 3 + midSplit, 20).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 21).isWall = true;
                }
                else {
                    getMutableTile(MMstart + 3 + midSplit, 19).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 21).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(MMstart, 19).isWall = false;
                }
                else if (shiftDir === 1) {
                    getMutableTile(MMstart, 20).isWall = false;
                }
                else {
                    getMutableTile(MMstart, 21).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = this.manager.random.int(3, 0);
                if (shiftDir === 0) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 19).isWall = false;
                }
                else if (shiftDir === 1) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 20).isWall = false;
                }
                else {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, 21).isWall = false;
                }
            // generate a 5 tall area. There is room for a hallway
            }
            else if (shift === Math.floor(this.mapHeight / 2) - midSize - 5) {
                // figure out where to split the area
                const midSplit = this.manager.random.int(2, 0);
                shiftDir = this.manager.random.int(3, 0);
                // place the seperating wall with a hole in it.
                if (shiftDir === 0) {
                    getMutableTile(MMstart + 3 + midSplit, 19).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 20).isWall = true;
                }
                else if (shiftDir === 1) {
                    getMutableTile(MMstart + 3 + midSplit, 20).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 21).isWall = true;
                }
                else {
                    getMutableTile(MMstart + 3 + midSplit, 19).isWall = true;
                    getMutableTile(MMstart + 3 + midSplit, 21).isWall = true;
                }
                getMutableTile(MMstart, 18).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 21).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 20).isWall = false;
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 18).isWall = false;
                for (let x = MMstart + 1; x <= Math.floor(this.mapWidth / 2); x++) {
                    getMutableTile(x, 19).isWall = true;
                }
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 1) {
                    shiftDir = this.manager.random.int(2, 0);
                    if (shiftDir === 1) {
                        getMutableTile(Math.floor(this.mapWidth / 2) - 2, 20).isWall = true;
                    }
                    else {
                        getMutableTile(Math.floor(this.mapWidth / 2) - 2, 21).isWall = true;
                    }
                }
                else {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 2, 20).isWall = true;
                    getMutableTile(Math.floor(this.mapWidth / 2) - 2, 21).isWall = true;
                    if (midSplit === 1) {
                        shiftDir = this.manager.random.int(2, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 3, 19).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 4, 19).isWall = false;
                        }
                    }
                    else {
                        shiftDir = this.manager.random.int(3, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 3, 19).isWall = false;
                        }
                        else if (shiftDir === 2) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 4, 19).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 5, 19).isWall = false;
                        }
                    }
                }
                shiftDir = this.manager.random.int(2, 0);
                if (shiftDir === 0) {
                    if (midSplit === 1) {
                        shiftDir = this.manager.random.int(2, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 8, 19).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 7, 19).isWall = false;
                        }
                    }
                    else {
                        shiftDir = this.manager.random.int(3, 0);
                        if (shiftDir === 1) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 6, 19).isWall = false;
                        }
                        else if (shiftDir === 2) {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 7, 19).isWall = false;
                        }
                        else {
                            getMutableTile(Math.floor(this.mapWidth / 2) - 8, 19).isWall = false;
                        }
                    }
                }
                else {
                    shiftDir = this.manager.random.int(2, 0);
                    if (shiftDir === 1) {
                        getMutableTile(MMstart, 20).isWall = false;
                    }
                    else {
                        getMutableTile(MMstart, 21).isWall = false;
                    }
                }
                getMutableTile(Math.floor(this.mapWidth / 2) - 1, 19).isWall = false;
            // generate a very large area.
            }
            else {
                for (let y = mid + midSize + shift + 1; y < this.mapHeight - 1; y++) {
                    getMutableTile(Math.floor(this.mapWidth / 2) - 1, y).isWall = false;
                }
                /*
                getMutableTile(Math.floor(this.mapWidth/2), mid+midSize+shift).isWall = true;
                shiftDir = this.manager.random.int(2, 0);
                if(shiftDir === 1) {
                    //
                } else {
                    //
                }
                */
            }
        }
        // generate Side area
        // Math.floor(Math.random() * 3)
        // mirror map
        for (let x = 0; x < this.mapWidth / 2; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                const copy = getMutableTile(x, y).isWall;
                getMutableTile((this.mapWidth - 1 - x), y).isWall = copy;
                if (getMutableTile(x, y).machine) {
                    const mach = getMutableTile(x, y).machine;
                    if (mach === undefined) {
                        throw new Error(`The machine you are copying: ${mach}, doesn't exist!`);
                    }
                    const machine2 = this.manager.create.machine({
                        oreType: "blueium",
                        refineTime: mach.refineTime,
                        refineInput: mach.refineInput,
                        refineOutput: mach.refineOutput,
                        tile: getMutableTile((this.mapWidth - 1 - x), y) as Tile,
                    });
                    getMutableTile((this.mapWidth - 1 - x), y).machine = machine2;
                    this.machines.push(machine2);
                }
                else if (getMutableTile(x, y).type === "spawn") {
                    getMutableTile((this.mapWidth - 1 - x), y).type = "spawn";
                    getMutableTile((this.mapWidth - 1 - x), y).owner = this.players[1];
                }
                else if (getMutableTile(x, y).type === "generator") {
                    getMutableTile((this.mapWidth - 1 - x), y).type = "generator";
                    getMutableTile((this.mapWidth - 1 - x), y).owner = this.players[1];
                }
                else if (getMutableTile(x, y).type === "conveyor") {
                    getMutableTile((this.mapWidth - 1 - x), y).type = "conveyor";
                    // TODO: use this.invertTileDirection
                    let { direction } = getMutableTile(x, y);
                    if (direction === "east") {
                        direction = "west";
                    }
                    else if (direction === "west") {
                        direction = "east";
                    }
                    getMutableTile((this.mapWidth - 1 - x), y).direction = direction;
                }
            }
        }
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * TODO: document
     *
     * @param x1 - TODO: document
     * @param x2 - TODO: document
     * @param y1 - TODO: document
     * @param y2 - TODO: document
     * @param y3 - TODO: document
     * @param x3 - TODO: document
     * @returns TODO: document
     */
    private makeRoom(x1: number, x2: number, y1: number, y2: number, y3: number = -1, x3: number = -1): IRoom {
        return {
            x1, y1,
            x2, y2,
            x3, y3,
            WNorth: true, WEast: true, WSouth: true, WWest: true,
            DNorth: false, DEast: false, DSouth: false, DWest: false,
        };
    }

    /**
     * TODO: document
     *
     * @param map - TODO: document
     * @param getMutableTile - A function that gets a mutable tile given an (x, y)
     */
    private roomFill(map: IRoom[][], getMutableTile: (x: number, y: number) => MutableRequired<Tile>): void {
        let unconnected: IPoint[] = [];
        const roomList: IPoint[] = [];
        let connect = Math.floor((map.length * map[0].length) / 2);
        let find = { x: 0, y: 0 };
        let done = false;
        connect += Math.floor(connect * this.manager.random.float(0.5, 0.25));
        // getMutableTile(7+connect,7).isWall = true;
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                unconnected.push({x, y});
                roomList.push({x, y});
            }
        }
        for (let i = 0; i <= connect; i++) {
            if (unconnected.length > 0) {
                // getMutableTile(8+i,7).isWall = true;
                const index = this.manager.random.int(unconnected.length, 0);
                find = unconnected[index];
                done = false;
                let rot = this.manager.random.int(4, 0);
                let num = 0;
                while (!done) {
                    if (rot === 0) {
                        num++;
                        rot++;
                        if (map[find.x][find.y - 1] && (this.has(unconnected, find.x, find.y - 1) >= 0 || num >= 5)) {
                            map[find.x][find.y].WNorth = false;
                            map[find.x][find.y - 1].WSouth = false;
                            unconnected.splice(index, 1);
                            if (this.has(unconnected, find.x, find.y - 1) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x, find.y - 1), 1);
                            }
                            done = true;
                        }
                    }
                    else if (rot === 1) {
                        num++;
                        rot++;
                        if (map[find.x + 1] && (this.has(unconnected, find.x + 1, find.y) >= 0 || num >= 5)) {
                            map[find.x][find.y].WEast = false;
                            map[find.x + 1][find.y].WWest = false;
                            unconnected.splice(index, 1);
                            if (this.has(unconnected, find.x + 1, find.y) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x + 1, find.y), 1);
                            }
                            done = true;
                        }
                    }
                    else if (rot === 1) {
                        num++;
                        rot++;
                        if (map[find.x][find.y + 1] && (this.has(unconnected, find.x, find.y + 1) >= 0 || num >= 5)) {
                            map[find.x][find.y].WSouth = false;
                            map[find.x][find.y + 1].WNorth = false;
                            unconnected.splice(index, 1);
                            if (this.has(unconnected, find.x, find.y + 1) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x + 1, find.y), 1);
                            }
                            done = true;
                        }
                    }
                    else {
                        num++;
                        rot = 0;
                        if (map[find.x - 1] && (this.has(unconnected, find.x - 1, find.y) >= 0 || num >= 5)) {
                            map[find.x][find.y].WWest = false;
                            map[find.x - 1][find.y].WEast = false;
                            unconnected.splice(index, 1);
                            if (this.has(unconnected, find.x - 1, find.y) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x - 1, find.y), 1);
                            }
                            done = true;
                        }
                    }
                }
            }
            else {
                find = roomList[this.manager.random.int(roomList.length, 0)];
                done = false;
                let rot = this.manager.random.int(4, 0);
                while (!done) {
                    if (rot === 0) {
                        rot++;
                        if (map[find.x][find.y - 1]) {
                            map[find.x][find.y].WNorth = false;
                            map[find.x][find.y - 1].WSouth = false;
                            done = true;
                        }
                    }
                    else if (rot === 1) {
                        rot++;
                        if (map[find.x + 1]) {
                            map[find.x][find.y].WEast = false;
                            map[find.x + 1][find.y].WWest = false;
                            done = true;
                        }
                    }
                    else if (rot === 2) {
                        rot++;
                        if (map[find.x][find.y + 1]) {
                            map[find.x][find.y].WSouth = false;
                            map[find.x][find.y + 1].WNorth = false;
                            done = true;
                        }
                    }
                    else {
                        rot = 0;
                        if (map[find.x - 1]) {
                            map[find.x][find.y].WWest = false;
                            map[find.x - 1][find.y].WEast = false;
                            done = true;
                        }
                    }
                }
            }
        }
        let doors = map.length * map[0].length / 2;
        doors = Math.floor(doors * 1.5);
        unconnected = [];
        const connected: IPoint[] = [];
        find = roomList[this.manager.random.int(roomList.length, 0)];
        connected.push({x: find.x, y: find.y});
        if (map[find.x][find.y - 1]) {
            unconnected.push({ x: find.x, y: find.y - 1});
        }
        if (map[find.x][find.y + 1]) {
            unconnected.push({ x: find.x, y: find.y + 1 });
        }
        if (map[find.x + 1]) {
            unconnected.push({ x: find.x + 1, y: find.y });
        }
        if (map[find.x - 1]) {
            unconnected.push({ x: find.x - 1, y: find.y });
        }
        for (let v = 0; v < doors; v++) {
            if (unconnected.length > 0 && false) {
                done = false;
                let index = this.manager.random.int(unconnected.length, 0);
                find = unconnected[index];
                let dir = this.manager.random.int(4, 0);
                let num = 0;
                while (!done) {
                    if (dir === 0) {
                        dir++;
                        num++;
                        if (map[find.x][find.y - 1] && this.has(connected, find.x, find.y - 1) >= 0) {
                            done = true;
                            map[find.x][find.y - 1].DSouth = true;
                            map[find.x][find.y].DNorth = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x , y: find.y});
                            if (map[find.x][find.y + 1] && this.has(unconnected, find.x, find.y + 1) === -1
                                                      && this.has(connected, find.x, find.y + 1) === -1) {
                                unconnected.push({x: find.x, y: find.y + 1});
                            }
                            if (map[find.x + 1] && this.has(unconnected, find.x + 1, find.y) === -1
                                              && this.has(connected, find.x + 1, find.y) === -1) {
                                unconnected.push({x: find.x + 1, y: find.y});
                            }
                            if (map[find.x - 1] && this.has(unconnected, find.x - 1, find.y) === -1
                                              && this.has(connected, find.x - 1, find.y) === -1) {
                                unconnected.push({x: find.x - 1, y: find.y});
                            }
                        }
                    }
                    else if (dir === 1) {
                        dir++;
                        num++;
                        if (map[find.x + 1] && this.has(connected, find.x + 1, find.y) >= 0) {
                            done = true;
                            map[find.x + 1][find.y].DWest = true;
                            map[find.x][find.y].DEast = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x , y: find.y});
                            if (map[find.x][find.y + 1] && this.has(unconnected, find.x, find.y + 1) === -1
                                                      && this.has(connected, find.x, find.y + 1) === -1) {
                                unconnected.push({x: find.x, y: find.y + 1});
                            }
                            if (map[find.x][find.y - 1] && this.has(unconnected, find.x, find.y - 1) === -1
                                                      && this.has(connected, find.x, find.y - 1) === -1) {
                                unconnected.push({x: find.x, y: find.y - 1});
                            }
                            if (map[find.x - 1] && this.has(unconnected, find.x - 1, find.y) === -1
                                              && this.has(connected, find.x - 1, find.y) === -1) {
                                unconnected.push({x: find.x - 1, y: find.y});
                            }
                        }
                    }
                    else if (dir === 2) {
                        dir++;
                        num++;
                        if (map[find.x][find.y + 1] && this.has(connected, find.x, find.y + 1) >= 0) {
                            done = true;
                            map[find.x][find.y + 1].DNorth = true;
                            map[find.x][find.y].DSouth = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x , y: find.y});
                            if (map[find.x][find.y - 1] && this.has(unconnected, find.x, find.y - 1) === -1
                                                      && this.has(connected, find.x, find.y - 1) === -1) {
                                unconnected.push({x: find.x, y: find.y - 1});
                            }
                            if (map[find.x + 1] && this.has(unconnected, find.x + 1, find.y) === -1
                                              && this.has(connected, find.x + 1, find.y) === -1) {
                                unconnected.push({x: find.x + 1, y: find.y});
                            }
                            if (map[find.x - 1] && this.has(unconnected, find.x - 1, find.y) === -1
                                              && this.has(connected, find.x - 1, find.y) === -1) {
                                unconnected.push({x: find.x - 1, y: find.y});
                            }
                        }
                    }
                    else {
                        dir = 0;
                        num++;
                        if (map[find.x - 1] && this.has(connected, find.x - 1, find.y) >= 0) {
                            done = true;
                            map[find.x - 1][find.y].DEast = true;
                            map[find.x][find.y].DWest = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x , y: find.y});
                            if (map[find.x][find.y + 1] && this.has(unconnected, find.x, find.y + 1) === -1
                                                      && this.has(connected, find.x, find.y + 1) === -1) {
                                unconnected.push({x: find.x, y: find.y + 1});
                            }
                            if (map[find.x][find.y - 1] && this.has(unconnected, find.x, find.y - 1) === -1
                                                      && this.has(connected, find.x, find.y - 1) === -1) {
                                unconnected.push({x: find.x, y: find.y - 1});
                            }
                            if (map[find.x + 1] && this.has(unconnected, find.x + 1, find.y) === -1
                                              && this.has(connected, find.x + 1, find.y) === -1) {
                                unconnected.push({x: find.x + 1, y: find.y});
                            }
                        }
                    }
                    if (num > 4) {
                        unconnected.splice(index, 1);
                        if (unconnected.length > 0) {
                            index = this.manager.random.int(unconnected.length, 0);
                            find = unconnected[index];
                        }
                        else {
                            done = true;
                        }
                    }
                }
            }
            else {
                let done2 = false;
                while (!done2) {
                    getMutableTile(10, 5).isWall = true;
                    find = roomList[this.manager.random.int(roomList.length, 0)];
                    let dir = this.manager.random.int(4, 0);
                    if (dir === 0) {
                        getMutableTile(10, 6).isWall = true;
                        done2 = true;
                        if (find.y > 0) {
                            map[find.x][find.y - 1].DSouth = true;
                            map[find.x][find.y].DNorth = true;
                            getMutableTile(10, 10).isWall = true;
                        }
                        else {
                            dir += 1;
                        }
                    }
                    else if (dir === 1) {
                        getMutableTile(10, 7).isWall = true;
                        if (find.x < map.length - 1) {
                            map[find.x + 1][find.y].DWest = true;
                            map[find.x][find.y].DEast = true;
                            getMutableTile(10, 10).isWall = true;
                        }
                        else {
                            dir += 1;
                        }
                    }
                    else if (dir === 2) {
                        getMutableTile(10, 7).isWall = true;
                        if (find.y < map.length - 1) {
                            map[find.x][find.y + 1].DNorth = true;
                            map[find.x][find.y].DSouth = true;
                            getMutableTile(10, 10).isWall = true;
                        }
                        else {
                            dir += 1;
                        }
                    }
                    else {
                        getMutableTile(10, 8).isWall = true;
                        if (find.x > 0) {
                            map[find.x - 1][find.y].DEast = true;
                            map[find.x][find.y].DWest = true;
                            getMutableTile(10, 10).isWall = true;
                        }
                        else {
                            dir = 0;
                        }
                    }
                }
            }
        }

        this.draw(map, getMutableTile);
    }

    /**
     * this makes sure the room is in the list. I was uncreative with the name.
     *
     * @param uncon - TODO: document
     * @param x - TODO: document
     * @param y - TODO: document
     * @returns TODO: document
     */
    private has(uncon: IPoint[], x: number, y: number): number {
        for (let w = 0; w < uncon.length; w++) {
            if (uncon[w].x === x && uncon[w].y === y) {
                return w;
            }
        }

        return -1;
    }

    /**
     * This draws the rooms. only handles simple room clusters, 3 tall, not 3 wide.
     *
     * @param map - TODO: document
     * @param getMutableTile - TODO: document
     */
    private draw(map: IRoom[][], getMutableTile: (x: number, y: number) => MutableRequired<Tile>): void {
        /*for(let x = 0; x < map.length; x++) {
            for(let y = 0; y < map[0].length; y++) {
                this.game.getTileUnsafe(map[x][y].x1, map[x][y].y1).owner = this.players[0];
                this.game.getTileUnsafe(map[x][y].x1, map[x][y].y1).type = "generator";
                this.game.getTileUnsafe(map[x][y].x1, map[x][y].y2).owner = this.players[0];
                this.game.getTileUnsafe(map[x][y].x1, map[x][y].y2).type = "generator";
                this.game.getTileUnsafe(map[x][y].x2, map[x][y].y1).owner = this.players[0];
                this.game.getTileUnsafe(map[x][y].x2, map[x][y].y1).type = "generator";
                this.game.getTileUnsafe(map[x][y].x2, map[x][y].y2).owner = this.players[0];
                this.game.getTileUnsafe(map[x][y].x2, map[x][y].y2).type = "generator";
                if(map[x][y].y3 !== -1) {
                    this.game.getTileUnsafe(map[x][y].x1, map[x][y].y3).owner = this.players[0];
                    this.game.getTileUnsafe(map[x][y].x1, map[x][y].y3).type = "generator";
                    this.game.getTileUnsafe(map[x][y].x2, map[x][y].y3).owner = this.players[0];
                    this.game.getTileUnsafe(map[x][y].x2, map[x][y].y3).type = "generator";
                }
            }
        }*/
        for (const rooms of map) {
            for (const room of rooms) {
                getMutableTile(room.x1 - 1, room.y1 - 1).isWall = true;
                getMutableTile(room.x2 + 1, room.y1 - 1).isWall = true;
                if (room.y3 === -1) {
                    getMutableTile(room.x1 - 1, room.y2 + 1).isWall = true;
                    getMutableTile(room.x2 + 1, room.y2 + 1).isWall = true;
                }
                else {
                    getMutableTile(room.x1 - 1, room.y3 + 1).isWall = true;
                    getMutableTile(room.x2 + 1, room.y3 + 1).isWall = true;
                }
                if (room.WNorth === true) {
                    getMutableTile(room.x1, room.y1 - 1).isWall = true;
                    getMutableTile(room.x2, room.y1 - 1).isWall = true;
                }
                if (room.WEast === true) {
                    if (room.y3 !== -1) {
                        getMutableTile(room.x2 + 1, room.y1).isWall = true;
                        getMutableTile(room.x2 + 1, room.y2).isWall = true;
                        getMutableTile(room.x2 + 1, room.y3).isWall = true;
                    }
                    else {
                        getMutableTile(room.x2 + 1, room.y1).isWall = true;
                        getMutableTile(room.x2 + 1, room.y2).isWall = true;
                    }
                }
                if (room.WSouth === true) {
                    if (room.y3 !== -1) {
                        getMutableTile(room.x1, room.y3 + 1).isWall = true;
                        getMutableTile(room.x2, room.y3 + 1).isWall = true;
                    }
                    else {
                        getMutableTile(room.x1, room.y2 + 1).isWall = true;
                        getMutableTile(room.x2, room.y2 + 1).isWall = true;
                    }
                }
                if (room.WWest === true) {
                    if (room.y3 !== -1) {
                        getMutableTile(room.x1 - 1, room.y1).isWall = true;
                        getMutableTile(room.x1 - 1, room.y2).isWall = true;
                        getMutableTile(room.x1 - 1, room.y3).isWall = true;
                    }
                    else {
                        getMutableTile(room.x1 - 1, room.y1).isWall = true;
                        getMutableTile(room.x1 - 1, room.y2).isWall = true;
                    }
                }
            }
        }
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                const room2 = map[x][y];
                // start drawing walls
                let shift = 0;
                if (room2.DNorth === true) {
                    if (map[x][y - 1]) {
                        map[x][y - 1].DSouth = false;
                    }
                    shift = this.manager.random.int(2, 0);
                    if (shift === 0) {
                        getMutableTile(room2.x1, room2.y1 - 1).isWall = false;
                    }
                    else {
                        getMutableTile(room2.x2, room2.y1 - 1).isWall = false;
                    }
                }
                if (room2.DEast === true) {
                    if (map[x + 1]) {
                        map[x + 1][y].DWest = false;
                    }
                    if (room2.y3 === -1) {
                        shift = this.manager.random.int(2, 0);
                        if (shift === 0) {
                            getMutableTile(room2.x2 + 1, room2.y1).isWall = false;
                        }
                        else {
                            getMutableTile(room2.x2 + 1, room2.y2).isWall = false;
                        }
                    }
                    else {
                        shift = this.manager.random.int(3, 0);
                        if (shift === 0) {
                            getMutableTile(room2.x2 + 1, room2.y1).isWall = false;
                        }
                        else if (shift === 1) {
                            getMutableTile(room2.x2 + 1, room2.y2).isWall = false;
                        }
                        else {
                            getMutableTile(room2.x2 + 1, room2.y3).isWall = false;
                        }
                    }
                }
                if (room2.DSouth === true) {
                    if (map[x][y + 1]) {
                        map[x][y + 1].DNorth = false;
                    }
                    shift = this.manager.random.int(2, 0);
                    if (room2.y3 === -1) {
                        if (shift === 0) {
                            getMutableTile(room2.x1, room2.y2 + 1).isWall = false;
                        }
                        else {
                            getMutableTile(room2.x2, room2.y2 + 1).isWall = false;
                        }
                    }
                    else {
                        if (shift === 0) {
                            getMutableTile(room2.x1, room2.y3 + 1).isWall = false;
                        }
                        else {
                            getMutableTile(room2.x2, room2.y3 + 1).isWall = false;
                        }
                    }
                }
                if (room2.DWest === true) {
                    if (map[x - 1]) {
                        map[x - 1][y].DEast = false;
                    }
                    if (room2.y3 === -1) {
                        shift = this.manager.random.int(2, 0);
                        if (shift === 0) {
                            getMutableTile(room2.x1 - 1, room2.y1).isWall = false;
                        }
                        else {
                            getMutableTile(room2.x1 - 1, room2.y2).isWall = false;
                        }
                    }
                    else {
                        shift = this.manager.random.int(3, 0);
                        if (shift === 0) {
                            getMutableTile(room2.x1 - 1, room2.y1).isWall = false;
                        }
                        else if (shift === 1) {
                            getMutableTile(room2.x1 - 1, room2.y2).isWall = false;
                        }
                        else {
                            getMutableTile(room2.x1 - 1, room2.y3).isWall = false;
                        }
                    }
                }
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

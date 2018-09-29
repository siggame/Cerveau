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
import { IPoint, MutableRequired } from "~/utils";

/** interface used to create rooms.s */
interface IRoom {
    // room locations to be stored.
    x1: number; y1: number;
    x2: number; y2: number;
    x3: number; y3: number;
    // tracks doors and walls.
    WNorth: boolean; WEast: boolean; WSouth: boolean; WWest: boolean;
    DNorth: boolean; DEast: boolean; DSouth: boolean; DWest: boolean;
}

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
     * Percent loss from the difference of Heat and Pressure. (0 to 1).
     */
    public readonly degradeRate!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * The maximum number of interns a player can have.
     */
    public readonly internCap!: number;

    /**
     * A list of all jobs. first item is intern, second is physicists, and
     * third is manager.
     */
    public jobs!: Job[];

    /**
     * Every Machine in the game.
     */
    public machines!: Machine[];

    /**
     * The maximum number of managers a player can have.
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
     * The number of materials that spawn per spawn cycle.
     */
    public readonly materialSpawn!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The maximum number of physicists a player can have.
     */
    public readonly physicistCap!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * The amount of victory points added when a refined ore is consumed by the
     * generator.
     */
    public readonly refinedValue!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The amount of turns it takes a unit to spawn.
     */
    public readonly spawnTime!: number;

    /**
     * The amount of turns a unit cannot do anything when stunned.
     */
    public readonly stunTime!: number;

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
     * The number turns a unit is immune to being stunned.
     */
    public readonly timeImmune!: number;

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
        required: Readonly<IBaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.createJobs();

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

        // marks where the spawn area ends and the rooms begin.
        const RMstart = Math.floor(this.mapWidth * 0.105);
        // marks where the middle area of the map begins.
        const MMstart = Math.floor(this.mapWidth * 0.363);
        // marks where the spawn room in the spawn area ends.
        const spawnEnd = Math.floor(this.mapHeight * 0.304);
        // marks where the generator room in the spawn area ends.
        const genEnd = Math.floor(this.mapHeight * 0.653);
        // marks how many tiles wide the spawn and generator are.
        const startEnd = Math.floor(this.mapWidth * 0.073);
        // used to track the maps mid-point.
        const mid = Math.floor(this.mapHeight / 2);
        // iterates over the map and adds basic structure.
        for (let x = 0; x < (this.mapWidth / 2 + 1); x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                if (y === 0 // bottom edge of map
                 || y === (this.mapHeight - 1) // top edge of map
                 || x === 0 // left edge of map
                 || x === RMstart
                 || x === MMstart
                // || x === Math.floor(this.mapWidth / 2) - 1
                 || (x < startEnd && (y === spawnEnd || y === genEnd))
                ) {
                    getMutableTile(x, y).isWall = true;
                }
            }
        }

        // --- Set spawn area --- \\
        for (let y = 1; y < spawnEnd; y++) {
            for (let x = 1; x <= startEnd - 1; x++) {
                const tile = getMutableTile(x, y);

                tile.owner = this.players[0];
                tile.type = "spawn";
                this.players[0].spawnTiles.push(tile as Tile);
            }
        }

        // --- Set generator area --- \\
        for (let y = spawnEnd + 1; y < genEnd; y++) {
            for (let x = 1; x <= startEnd - 1; x++) {
                const tile = getMutableTile(x, y);

                tile.owner = this.players[0];
                tile.type = "generator";
                this.players[0].generatorTiles.push(tile as Tile);
            }
        }

        // --- Set resource spawn --- \\
        const conveyors: Array<{
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
        for (const { x, y, direction } of conveyors) {
            const tile = getMutableTile(x, y);

            tile.type = "conveyor";
            tile.direction = direction;
        }
        // TODO: spawn in one of each unit.

        // --- Generate center --- \\
        // Determine the size of the center room
        const midSize = this.manager.random.int(6, 3);
        // Determine the rooms offset
        let shift = this.manager.random.int(Math.floor(this.mapHeight / 2) - midSize);
        // let shift = Math.floor(this.mapHeight / 2) - midSize - 3; // for testing
        // Edge case handling to make sure walls don't touch.
        if (shift === Math.floor(this.mapHeight / 2) - midSize - 1) {
            shift++;
        }
        // Decides if the rooms shifts upwards or downwards
        /** used to determine random shifts and doorways */
        let shiftDir = this.manager.random.int(2, 0); // 0 = small south, 1 = small north
        // shiftDir = 0; // used for testing.
        /** Determines the ship of the middle room */
        if (shiftDir === 1) {
            shift = -shift;
        }
        /** Determines machines shift */
        shiftDir = this.manager.random.int(2, 0);
        let mShift = this.manager.random.int(midSize);
        if (shiftDir === 1) {
            mShift = -mShift;
        }

        // Generate the run time for the machines
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

        // generates structures that fill in the rest of the center area
        // top area
        // makes sure there is a top area.
        if (shift !== -(Math.floor(this.mapHeight / 2) - midSize)) {
            // if it has the smallest possible space and still exist, hallway time.
            if (shift === -(Math.floor(this.mapHeight / 2) - midSize - 2)) {
                getMutableTile(MMstart, 1).isWall = false;
                getMutableTile(MMstart, 1).decoration = 1;
            }
            // if there are 2 spaces.
            else if (shift === -(Math.floor(this.mapHeight / 2) - midSize - 5)) {
                this.roomCalc(MMstart + 1, Math.floor((this.mapWidth - 2) / 2), 1,
                              mid - midSize + shift - 3, getMutableTile,
                              false, true, true, false);
            }
            // if the room is bigger.
            else {
                // generates the rooms.
                this.roomCalc(MMstart + 1, Math.floor((this.mapWidth - 2) / 2), 1,
                              mid - midSize + shift - 1, getMutableTile,
                              false, true, true, false);
            }
        }
        // bottom area
        if (shift !== Math.floor(this.mapHeight / 2) + midSize) {
            // generate for smallest leftover area - make a hallway
            if (shift === Math.floor(this.mapHeight / 2) + midSize - 2) {
                getMutableTile(MMstart, 21).isWall = false;
                getMutableTile(MMstart, 21).decoration = 1;
            }
            // generate 2 tall area.
            else if (shift === Math.floor(this.mapHeight / 2) - midSize - 5) {
                this.roomCalc(MMstart + 1, Math.floor((this.mapWidth - 2) / 2),
                              mid + midSize + shift + 3,
                              this.mapHeight - 2, getMutableTile,
                              true, true, false, false);
                getMutableTile(4, 5).isWall = true;
            }
            else {
                // generates the rooms.
                this.roomCalc(MMstart + 1, Math.floor((this.mapWidth - 2) / 2),
                              mid + midSize + shift + 1,
                              this.mapHeight - 2, getMutableTile,
                              true, true, false, false);
            }
        }
        // generate Side area
        this.roomCalc(RMstart + 1, MMstart - 1, 1,
                      this.mapHeight - 2, getMutableTile,
                      false, true, false, true,
                      Math.min((this.mapHeight * this.mapWidth) / 790));
        // Math.floor(Math.random() * 3)
        // mirror map
        // TODO: copy units.
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth / 2; x++) {
                const copy = getMutableTile(x, y).isWall;
                getMutableTile((this.mapWidth - 1 - x), y).isWall = copy;
                const copy2 = getMutableTile(x, y).decoration;
                getMutableTile((this.mapWidth - 1 - x), y).decoration = copy2;
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
                    const tile = getMutableTile((this.mapWidth - 1 - x), y);
                    tile.type = "spawn";
                    tile.owner = this.players[1];
                    this.players[1].spawnTiles.push(tile as Tile);
                }
                else if (getMutableTile(x, y).type === "generator") {
                    const tile = getMutableTile((this.mapWidth - 1 - x), y);
                    tile.type = "generator";
                    tile.owner = this.players[1];
                    this.players[1].generatorTiles.push(tile as Tile);
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
     * This creates a room struct and returns it. Saves a lot of space.
     *
     * All of these parameters are for the INSIDE of the room, walls not included!
     * @param x1 - lowest x value of the room.
     * @param x2 - highest x value of a 2 by 2 room.
     * @param y1 - lowest y value of the room.
     * @param y2 - highest y value of a 2 by 2 room.
     * @param y3 - If the room is 3 tall, this is actually the highest value.
     * @param x3 - If the room is 3 wide, this is actually the highest value.
     * @returns - the room object.
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
     * takes a area and starts the process of filling it with rooms.
     *
     * All of these parameters are for the INSIDE of the room, walls not included!
     * @param x1 - lowest x value of the area.
     * @param x2 - highest x value of the area.
     * @param y1 - lowest y value of the area.
     * @param y2 - highest y value of the area.
     * @param getMutableTile - A function that gets a mutable tile given an (x, y)
     * @param DNorth - If there should be doors to the north.
     * @param DEast - If there should be doors to the East.
     * @param DSouth - If there should be doors to the south.
     * @param DWest - If there should be doors to the west.
     * @param machines - The number of machines you want added to the map.
     * @returns - nothing, calls the next stage
     */
    private roomCalc(x1: number, x2: number, y1: number, y2: number,
                     getMutableTile: (x: number, y: number) => MutableRequired<Tile>,
                     DNorth: boolean = false, DEast: boolean = false,
                     DSouth: boolean = false, DWest: boolean = false,
                     machines: number = 0): void {
        // determines the number of rooms on the x axis
        const mapW = Math.floor((x2 - x1 + 2) / 3); // MUST be a whole number
        // determines the number of rooms on the y axis
        const mapH = Math.floor((y2 - y1 + 2) / 3);
        if (mapH === 0) {
            getMutableTile(3, 4).isWall = true;

            return;
        }
        // map used for mapgen.
        const map: IRoom[][] = [];
        // sets sets up the rest of the map.
        for (let i = 0; i < mapW; i++) {
            map[i] = new Array(mapH);
        }
        // counts the extra y tiles.
        const extraY = (y2 - y1 + 2) % 3;
        // counts extra x tiles.
        const extraX = (x2 - x1 + 2) % 3;
        // make a list of the Y values that will have the 3 tall rooms.
        const yLarge: number[] = [];
        for (let y = 0; y < mapH && extraY !== 0; y++) {
            yLarge.push(y);
        }
        // make a list of the X values that will have the 3 wide rooms.
        const xLarge: number[] = [];
        for (let x = 0; x < mapW && extraX !== 0; x++) {
            xLarge.push(x);
        }
        // Reduce yLarge until it is has the number of needed 3 tall rooms selected.
        while (yLarge.length > extraY) {
            yLarge.splice(this.manager.random.int(yLarge.length, 0), 1);
        }
        // Reduce xLarge until it is has the number of needed 3 tall rooms selected.
        while (xLarge.length > extraX) {
            xLarge.splice(this.manager.random.int(xLarge.length, 0), 1);
        }
        // variables that account for size 3 rooms.
        let shiftX = 0;
        let shiftY = 0;
        // create the rest of the rooms by iterating over the rest of the map.
        for (let x = 0; x < mapW; x++) {
            for (let y = 0/*start*/; y < mapH; y++) {
                // create and add the room.
                // if the room is 3 wide.
                if (x === xLarge[shiftX]) {
                    // if the room is a 3 tall.
                    if (y === yLarge[shiftY]) {
                        // create the room.
                        const room = this.makeRoom(
                            x1 + (x * 3) + shiftX,
                            x1 + 1 + (x * 3) + shiftX,
                            y1 + (y * 3) + shiftY,
                            y1 + 1 + (y * 3) + shiftY,
                            y1 + 2 + (y * 3) + shiftY,
                            x1 + 2 + (x * 3) + shiftX,
                        );
                        // add the room.
                        map[x][y] = room;
                        // mark the shift so future rooms are place correctly.
                        shiftY++;
                    }
                    // if the room is a 2 tall.
                    else {
                        // create the room.
                        const room = this.makeRoom(
                            x1 + (x * 3) + shiftX,
                            x1 + 1 + (x * 3) + shiftX,
                            y1 + (y * 3) + shiftY,
                            y1 + 1 + (y * 3) + shiftY,
                            -1,
                            x1 + 2 + (x * 3) + shiftX,
                        );
                        // add the room.
                        map[x][y] = room;
                    }
                }
                // if the room is 2 wide.
                else {
                    // if the room is a 3 tall.
                    if (y === yLarge[shiftY]) {
                        // create the room.
                        const room = this.makeRoom(
                            x1 + (x * 3) + shiftX,
                            x1 + 1 + (x * 3) + shiftX,
                            y1 + (y * 3) + shiftY,
                            y1 + 1 + (y * 3) + shiftY,
                            y1 + 2 + (y * 3) + shiftY,
                        );
                        // add the room.
                        map[x][y] = room;
                        // mark the shift so future rooms are place correctly.
                        shiftY++;
                    }
                    // if the room is a 2 tall.
                    else {
                        // create the room.
                        const room = this.makeRoom(
                            x1 + (x * 3) + shiftX,
                            x1 + 1 + (x * 3) + shiftX,
                            y1 + (y * 3) + shiftY,
                            y1 + 1 + (y * 3) + shiftY,
                        );
                        // add the room.
                        map[x][y] = room;
                    }
                }
            }
            shiftY = 0;
            if (x === xLarge[shiftX]) {
                shiftX++;
            }
        }
        // variables to decide random things.
        let shift = 0;
        // if it should add doors to the north.
        if (DNorth) {
            // add doors into the North
            shift = this.manager.random.int(mapW, 0);
            for (let x = 0; x < mapW; x++) {
                if (shift !== x) {
                    if (map[x][0] !== undefined) {
                        map[x][0].DNorth = true;
                    }
                    else if (map[x][0] === undefined) {
                        throw new Error(`Cannot get a tile for map generation at (${x}, ${0}) data: ${mapW}, ${mapH}`);
                    }
                }
            }
        }
        // if it should add doors to the south.
        if (DSouth) {
            // add doors to the south
            shift = this.manager.random.int(mapW, 0);
            for (let x = 0; x < mapW; x++) {
                if (shift !== x) {
                    map[x][mapH - 1].DSouth = true;
                }
            }
        }
        // if there should be doors to the east.
        if (DEast) {
            // add doors to the east.
            shift = this.manager.random.int(mapH, 0);
            for (let y = 0; y < mapH; y++) {
                if (shift !== y) {
                    map[mapW - 1][y].DEast = true;
                }
            }
        }
        // if there should be doors to the west
        if (DWest) {
            // add doors ito the west.
            shift = this.manager.random.int(mapH, 0);
            for (let y = 0; y < mapH; y++) {
                if (shift !== y) {
                    map[0][y].DWest = true;
                }
            }
        }
        // go about filling out the details of the map.
        this.roomFill(map, machines, getMutableTile);
    }

    /**
     * TODO: document
     *
     * @param map - a 2D array that contains room structs that contain map information.
     * @param machines - the number of machines to be added to the map.
     * @param getMutableTile - A function that gets a mutable tile given an (x, y)
     */
    private roomFill(map: IRoom[][], machines: number,
                     getMutableTile: (x: number, y: number) => MutableRequired<Tile>): void {
        // tracks every room in the map list that is unconnected.
        const unconnected: IPoint[] = [];
        // master list of random rooms in a easy to grab fashion.
        const roomList: IPoint[] = [];
        // tracks all rooms that are eligible to get machines.
        const machRooms: IPoint[] = [];
        // tracks the number of connections that need to be made.
        let connect = Math.floor((map.length * map[0].length) / 2);
        // used to track if a direction has been chosen.
        let done = false;
        // adds all the points to the two lists
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                unconnected.push({x, y});
                roomList.push({x, y});
                machRooms.push({x, y});
            }
        }
        // add machines to the map
        if (machines > 0) {
            // place the machines
            for (let i = 0; i < machines - 1; i++) {
                // grabs a random room's location.
                const index = this.manager.random.int(machRooms.length, 0);
                // grabs the room.
                const find = machRooms[index];
                // marks it being chosen
                machRooms.splice(index, 1);
                // removes it's neighbors
                let check = this.has(machRooms, find.x, find.y - 1);
                // if the rooms is in the list.
                if (check !== -1) {
                    // removes the room
                    machRooms.splice(check, 1);
                }
                check = this.has(machRooms, find.x + 1, find.y);
                // if the rooms is in the list.
                if (check !== -1) {
                    // removes the room
                    machRooms.splice(check, 1);
                }
                check = this.has(machRooms, find.x, find.y + 1);
                // if the rooms is in the list.
                if (check !== -1) {
                    // removes the room
                    machRooms.splice(check, 1);
                }
                check = this.has(machRooms, find.x - 1, find.y);
                // if the rooms is in the list.
                if (check !== -1) {
                    // removes the room
                    machRooms.splice(check, 1);
                }
                // adds the machine.
                const room = map[find.x][find.y];
                // sets up a location to be set.
                let loc = getMutableTile(0, 0);
                // if the rooms is 2 tall.
                if (room.y3 === -1) {
                    // if the room is 2 wide.
                    if (room.x3 === -1) {
                        // gets a random location.
                        let place = this.manager.random.int(4, 0);
                        // check to protect against machine blocked doorways.
                        if (find.x === map.length - 1) {
                            place = this.manager.random.int(2, 0);
                        }
                        // if it is the upper left tile.
                        if (place === 0) {
                            loc = getMutableTile(room.x1, room.y1);
                        }
                        // if it is the upper left tile.
                        else if (place === 1) {
                            loc = getMutableTile(room.x1, room.y2);
                        }
                        // if it is the lower right tile.
                        else if (place === 2) {
                            loc = getMutableTile(room.x2, room.y1);
                        }
                        // if it is the upper right tile.
                        else {
                            loc = getMutableTile(room.x2, room.y2);
                        }
                    }
                    // if the room is 3 wide.
                    else {
                        // gets a random location.
                        let place = this.manager.random.int(6, 0);
                        // check to protect against machine blocked doorways.
                        if (find.x === map.length - 1) {
                            place = this.manager.random.int(4, 0);
                        }
                        // if it is the lower left tile.
                        if (place === 0) {
                            loc = getMutableTile(room.x1, room.y1);
                        }
                        // if it is the upper left tile.
                        else if (place === 1) {
                            loc = getMutableTile(room.x1, room.y2);
                        }
                        // if it is the lower middle tile.
                        else if (place === 2) {
                            loc = getMutableTile(room.x2, room.y1);
                        }
                        // if it is the upper middle tile.
                        else if (place === 3) {
                            loc = getMutableTile(room.x2, room.y2);
                        }
                        // if it is the lower right tile.
                        else if (place === 4) {
                            loc = getMutableTile(room.x3, room.y1);
                        }
                        // if it is the upper right tile.
                        else {
                            loc = getMutableTile(room.x3, room.y2);
                        }
                    }
                }
                // if the room is 3 tall.
                else {
                    // if the room is 2 wide.
                    if (room.x3 === -1) {
                        // gets a random location.
                        let place = this.manager.random.int(6, 0);
                        // check to protect against machine blocked doorways.
                        if (find.x === map.length - 1) {
                            place = this.manager.random.int(3, 0);
                        }
                        // if it is the lower left tile.
                        if (place === 0) {
                            loc = getMutableTile(room.x1, room.y1);
                        }
                        // if it is the middle left tile.
                        else if (place === 1) {
                            loc = getMutableTile(room.x1, room.y2);
                        }
                        // if it is the upper left tile.
                        else if (place === 2) {
                            loc = getMutableTile(room.x1, room.y3);
                        }
                        // if it is the lower right tile.
                        else if (place === 3) {
                            loc = getMutableTile(room.x2, room.y1);
                        }
                        // if it is the middle right tile.
                        else if (place === 4) {
                            loc = getMutableTile(room.x2, room.y2);
                        }
                        // if it is the upper right tile.
                        else {
                            loc = getMutableTile(room.x2, room.y3);
                        }
                    }
                    // if the room is 3 wide.
                    else {
                        // gets a random location.
                        let place = this.manager.random.int(9, 0);
                        // check to protect against machine blocked doorways.
                        if (find.x === map.length - 1) {
                            place = this.manager.random.int(6, 0);
                        }
                        // if it is the lower left tile.
                        if (place === 0) {
                            loc = getMutableTile(room.x1, room.y1);
                        }
                        // if it is the middle left tile.
                        else if (place === 1) {
                            loc = getMutableTile(room.x1, room.y2);
                        }
                        // if it is the upper left tile.
                        else if (place === 2) {
                            loc = getMutableTile(room.x1, room.y3);
                        }
                        // if it is the lower middle tile.
                        else if (place === 3) {
                            loc = getMutableTile(room.x2, room.y1);
                        }
                        // if it is the center tile.
                        else if (place === 4) {
                            loc = getMutableTile(room.x2, room.y2);
                        }
                        // if it is the upper middle tile.
                        else if (place === 5) {
                            loc = getMutableTile(room.x2, room.y3);
                        }
                        // if it is the lower right tile.
                        else if (place === 6) {
                            loc = getMutableTile(room.x3, room.y1);
                        }
                        // if it is the middle right tile.
                        else if (place === 7) {
                            loc = getMutableTile(room.x3, room.y2);
                        }
                        // if it is the upper right tile.
                        else {
                            loc = getMutableTile(room.x3, room.y3);
                        }
                    }
                }
                // Generate the run time for the machines
                const time = this.manager.random.int(2, 9);
                // makes the machine
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
            }
        }
        // adds extra connects for more rooms connections.
        connect += Math.floor(connect * this.manager.random.float(0.5, 0.25));
        if (roomList.length <= 4) {
            connect = this.manager.random.int(1, -1);
        }
        for (let i = 0; i <= connect; i++) {
            // used to make the map-gen favor connecting unconnected rooms.
            if (unconnected.length > 0) {
                // grabs a random room. Also used to remove it from the list.
                const index = this.manager.random.int(unconnected.length, 0);
                // grabs the room.
                const find = unconnected[index];
                // resets done.
                done = false;
                // picks a random direction.
                let rot = this.manager.random.int(4, 0);
                // makes sure it picks something if no options are optimal.
                let num = 0;
                // a while loop that forces it to pick something.
                while (!done) {
                    // if the direction is north.
                    if (rot === 0) {
                        // checks if the choice is optimal or at least legal
                        if (map[find.x][find.y - 1] && (this.has(unconnected, find.x, find.y - 1) >= 0 || num >= 4)) {
                            // makes the connection.
                            map[find.x][find.y].WNorth = false;
                            map[find.x][find.y - 1].WSouth = false;
                            // the room is connected, so it is removed from unconnected.
                            unconnected.splice(index, 1);
                            // if the other room is in the unconnected list, remove it as well.
                            if (this.has(unconnected, find.x, find.y - 1) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x, find.y - 1), 1);
                            }
                            // it has picked something, let the loop end.
                            done = true;
                        }
                        // otherwise, go to the next and note the failure.
                        else {
                            num++;
                            rot++;
                        }
                    }
                    // if the direction is east
                    else if (rot === 1) {
                        // checks if the choice is optimal or at least legal
                        if (map[find.x + 1] && (this.has(unconnected, find.x + 1, find.y) >= 0 || num >= 5)) {
                            // makes the connection.
                            map[find.x][find.y].WEast = false;
                            map[find.x + 1][find.y].WWest = false;
                            // the room is connected, so it is removed from unconnected.
                            unconnected.splice(index, 1);
                            // if the other room is in the unconnected list, remove it as well.
                            if (this.has(unconnected, find.x + 1, find.y) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x + 1, find.y), 1);
                            }
                            // it has picked something, let the loop end.
                            done = true;
                        }
                        // otherwise, go to the next and note the failure.
                        else {
                            num++;
                            rot++;
                        }
                    }
                    // if the direction is south.
                    else if (rot === 2) {
                        // checks if the choice is optimal or at least legal
                        if (map[find.x][find.y + 1] && (this.has(unconnected, find.x, find.y + 1) >= 0 || num >= 5)) {
                            // makes the connection.
                            map[find.x][find.y].WSouth = false;
                            map[find.x][find.y + 1].WNorth = false;
                            // the room is connected, so it is removed from unconnected.
                            unconnected.splice(index, 1);
                            // if the other room is in the unconnected list, remove it as well.
                            if (this.has(unconnected, find.x, find.y + 1) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x + 1, find.y), 1);
                            }
                            // it has picked something, let the loop end.
                            done = true;
                        }
                        // otherwise, go to the next and note the failure.
                        else {
                            num++;
                            rot++;
                        }
                    }
                    // if the direction is west.
                    else {
                        // checks if the choice is optimal or at least legal
                        if (map[find.x - 1] && (this.has(unconnected, find.x - 1, find.y) >= 0 || num >= 5)) {
                            // makes the connection.
                            map[find.x][find.y].WWest = false;
                            map[find.x - 1][find.y].WEast = false;
                            // the room is connected, so it is removed from unconnected.
                            unconnected.splice(index, 1);
                            // if the other room is in the unconnected list, remove it as well.
                            if (this.has(unconnected, find.x - 1, find.y) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x - 1, find.y), 1);
                            }
                            // it has picked something, let the loop end.
                            done = true;
                        }
                        // otherwise, go to the next and note the failure.
                        else {
                            num++;
                            rot = 0;
                        }
                    }
                }
            }
            // every room as been connected, do a simpler random connection.
            else {
                // grabs a random room.
                const find = roomList[this.manager.random.int(roomList.length, 0)];
                // makes sure it picks a valid direction
                done = false;
                // picks a random direction/
                let rot = this.manager.random.int(4, 0);
                while (!done) {
                    // if it picked north.
                    if (rot === 0) {
                        // make sure the direction is valid.
                        if (map[find.x][find.y - 1]) {
                            // do the connection and end the loop.
                            map[find.x][find.y].WNorth = false;
                            map[find.x][find.y - 1].WSouth = false;
                            done = true;
                        }
                        // otherwise go to the next direction.
                        else {
                            rot++;
                        }
                    }
                    else if (rot === 1) {
                        // make sure the direction is valid.
                        if (map[find.x + 1]) {
                            // do the connection and end the loop.
                            map[find.x][find.y].WEast = false;
                            map[find.x + 1][find.y].WWest = false;
                            done = true;
                        }
                        // otherwise go to the next direction.
                        else {
                            rot++;
                        }
                    }
                    else if (rot === 2) {
                        // make sure the direction is valid.
                        if (map[find.x][find.y + 1]) {
                            // do the connection and end the loop.
                            map[find.x][find.y].WSouth = false;
                            map[find.x][find.y + 1].WNorth = false;
                            done = true;
                        }
                        // otherwise go to the next direction.
                        else {
                            rot++;
                        }
                    }
                    else {
                        // make sure the direction is valid.
                        if (map[find.x - 1]) {
                            // do the connection and end the loop.
                            map[find.x][find.y].WWest = false;
                            map[find.x - 1][find.y].WEast = false;
                            done = true;
                        }
                        // otherwise go to the next direction.
                        else {
                            rot = 0;
                        }
                    }
                }
            }
        }
        // making each room make a unique connection.
        // iterating over the lists in map.
        for (let x = 0; x < map.length; x++) {
            // iterating over each list's values.
            for (let y = 0; y < map[x].length; y++) {
                // getting a random direction.
                let dir = this.manager.random.int(4, 0);
                // setting the flag variable.
                done = false;
                let num = 0;
                // making sure it picks a direction.
                while (!done) {
                    // if it picks north.
                    if (dir === 0) {
                        // if it doesn't have that connection and the room exists.
                        if (!map[x][y].DNorth && map[x][y - 1]) {
                            // set the flag and make the connection.
                            done = true;
                            map[x][y].DNorth = true;
                            map[x][y - 1].DSouth = true;
                        }
                        else {
                            // going to the next direction.
                            dir++;
                            num++;
                        }
                    }
                    else if (dir === 1) {
                        // if it doesn't have that connection and the room exists.
                        if (!map[x][y].DEast && map[x + 1]) {
                            // set the flag and make the connection.
                            done = true;
                            map[x][y].DEast = true;
                            map[x + 1][y].DWest = true;
                        }
                        else {
                            // going to the next direction.
                            dir++;
                            num++;
                        }
                    }
                    else if (dir === 2) {
                        // if it doesn't have that connection and the room exists.
                        if (!map[x][y].DSouth && map[x][y + 1]) {
                            // set the flag and make the connection.
                            done = true;
                            map[x][y].DSouth = true;
                            map[x][y + 1].DNorth = true;
                        }
                        else {
                            // going to the next direction.
                            dir++;
                            num++;
                        }
                    }
                    else {
                        // if it doesn't have that connection and the room exists.
                        if (!map[x][y].DWest && map[x - 1]) {
                            // set the flag and make the connection.
                            done = true;
                            map[x][y].DWest = true;
                            map[x - 1][y].DEast = true;
                        }
                        else {
                            // going to the next direction.
                            dir = 0;
                            num++;
                        }
                    }
                    if (num > 4) {
                        done = true;
                    }
                }
            }
        }
        // actually draws all the walls and doors.
        this.draw(map, getMutableTile);
    }

    /**
     * this makes sure the room is in the list. I was uncreative with the name.
     *
     * @param uncon - a list of x and y points.
     * @param x - the x point you are checking for.
     * @param y - the y point you are checking for.
     * @returns returns it's index or -1 if it doesn't exist.
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
     * @param map - a 2D array of rooms for it to draw using.
     * @param getMutableTile - the function for it to grab tiles.
     */
    private draw(map: IRoom[][], getMutableTile: (x: number, y: number) => MutableRequired<Tile>): void {
        // Test code to help visualize where it actually places rooms.
        /*for (const x of map) {
            for (const y of x) {
                getMutableTile(y.x1, y.y1).owner = this.players[0];
                getMutableTile(y.x1, y.y1).type = "generator";
                getMutableTile(y.x1, y.y2).owner = this.players[0];
                getMutableTile(y.x1, y.y2).type = "generator";
                getMutableTile(y.x2, y.y1).owner = this.players[0];
                getMutableTile(y.x2, y.y1).type = "generator";
                getMutableTile(y.x2, y.y2).owner = this.players[0];
                getMutableTile(y.x2, y.y2).type = "generator";
                if (y.y3 !== -1) {
                    if (y.x3 !== -1) {
                        getMutableTile(y.x3, y.y1).owner = this.players[0];
                        getMutableTile(y.x3, y.y1).type = "generator";
                        getMutableTile(y.x3, y.y2).owner = this.players[0];
                        getMutableTile(y.x3, y.y2).type = "generator";
                        getMutableTile(y.x1, y.y3).owner = this.players[0];
                        getMutableTile(y.x1, y.y3).type = "generator";
                        getMutableTile(y.x2, y.y3).owner = this.players[0];
                        getMutableTile(y.x2, y.y3).type = "generator";
                        getMutableTile(y.x3, y.y3).owner = this.players[0];
                        getMutableTile(y.x3, y.y3).type = "generator";
                    }
                    else {
                        getMutableTile(y.x1, y.y3).owner = this.players[0];
                        getMutableTile(y.x1, y.y3).type = "generator";
                        getMutableTile(y.x2, y.y3).owner = this.players[0];
                        getMutableTile(y.x2, y.y3).type = "generator";
                    }
                }
                else if (y.x3 !== -1) {
                    getMutableTile(y.x3, y.y1).owner = this.players[0];
                    getMutableTile(y.x3, y.y1).type = "generator";
                    getMutableTile(y.x3, y.y2).owner = this.players[0];
                    getMutableTile(y.x3, y.y2).type = "generator";
                }
            }
        }*/
        // iterate through the rooms of the map.
        for (const rooms of map) {
            for (const room of rooms) {
                // TODO: Iterate through rooms, skilling one every time, checking for diagonal connects to not draw
                // corners.
                // draw the northern corners
                // if the room is 2 wide.
                if (room.x3 === -1) {
                    getMutableTile(room.x1 - 1, room.y1 - 1).isWall = true;
                    getMutableTile(room.x2 + 1, room.y1 - 1).isWall = true;
                    // draw the southern corners, account for different heights
                    // if the room is 2 tall.
                    if (room.y3 === -1) {
                        getMutableTile(room.x1 - 1, room.y2 + 1).isWall = true;
                        getMutableTile(room.x2 + 1, room.y2 + 1).isWall = true;
                    }
                    // if the room is 3 tall.
                    else {
                        getMutableTile(room.x1 - 1, room.y3 + 1).isWall = true;
                        getMutableTile(room.x2 + 1, room.y3 + 1).isWall = true;
                    }
                }
                // if the room is 3 wide.
                else {
                    getMutableTile(room.x1 - 1, room.y1 - 1).isWall = true;
                    getMutableTile(room.x3 + 1, room.y1 - 1).isWall = true;
                    // draw the southern corners, account for different heights
                    // if the room is 2 tall.
                    if (room.y3 === -1) {
                        getMutableTile(room.x1 - 1, room.y2 + 1).isWall = true;
                        getMutableTile(room.x3 + 1, room.y2 + 1).isWall = true;
                    }
                    // if the room is 3 tall.
                    else {
                        getMutableTile(room.x1 - 1, room.y3 + 1).isWall = true;
                        getMutableTile(room.x3 + 1, room.y3 + 1).isWall = true;
                    }
                }
                // if there is a wall to the north, draw it.
                if (room.WNorth === true) {
                    // if the room is 3 wide.
                    getMutableTile(room.x1, room.y1 - 1).isWall = true;
                    getMutableTile(room.x2, room.y1 - 1).isWall = true;
                    // if the room is 3 wide.
                    if (room.x3 !== -1) {
                        getMutableTile(room.x3, room.y1 - 1).isWall = true;
                    }
                }
                // if there is a wall to the east, draw it.
                if (room.WEast === true) {
                    // if the room is 3 wide.
                    if (room.x3 !== -1) {
                        // place the wall as long as it doesn't cover up a door.
                        if (getMutableTile(room.x3 + 1, room.y1).decoration !== 1) {
                            getMutableTile(room.x3 + 1, room.y1).isWall = true;
                        }
                        if (getMutableTile(room.x3 + 1, room.y2).decoration !== 1) {
                            getMutableTile(room.x3 + 1, room.y2).isWall = true;
                        }
                        // if the room is 3 tall.
                        if (room.y3 !== -1) {
                            // place the wall as long as it doesn't cover up a door.
                            if (getMutableTile(room.x3 + 1, room.y3).decoration !== 1) {
                                getMutableTile(room.x3 + 1, room.y3).isWall = true;
                            }
                        }
                    }
                    // if the room is 2 wide.
                    else {
                        // place the wall as long as it doesn't cover up a door.
                        if (getMutableTile(room.x2 + 1, room.y1).decoration !== 1) {
                            getMutableTile(room.x2 + 1, room.y1).isWall = true;
                        }
                        if (getMutableTile(room.x2 + 1, room.y2).decoration !== 1) {
                            getMutableTile(room.x2 + 1, room.y2).isWall = true;
                        }
                        // if the room is 3 tall.
                        if (room.y3 !== -1) {
                            // place the wall as long as it doesn't cover up a door.
                            if (getMutableTile(room.x2 + 1, room.y3).decoration !== 1) {
                                getMutableTile(room.x2 + 1, room.y3).isWall = true;
                            }
                        }
                    }
                }
                // if there is a wall to the south, drawn it.
                if (room.WSouth === true) {
                    // if the room is 3 wide.
                    if (room.x3 !== -1) {
                        // if the room is 3 tall.
                        if (room.y3 !== -1) {
                            // place the wall as long as it doesn't cover up a door.
                            getMutableTile(room.x1, room.y3 + 1).isWall = true;
                            getMutableTile(room.x2, room.y3 + 1).isWall = true;
                            getMutableTile(room.x3, room.y3 + 1).isWall = true;
                        }
                        // if the room is 2 tall.
                        else {
                            // place the wall as long as it doesn't cover up a door.
                            getMutableTile(room.x1, room.y2 + 1).isWall = true;
                            getMutableTile(room.x2, room.y2 + 1).isWall = true;
                            getMutableTile(room.x3, room.y2 + 1).isWall = true;
                        }
                    }
                    // if the room is 2 wide.
                    else {
                        // if the room is 3 tall.
                        if (room.y3 !== -1) {
                            // place the wall as long as it doesn't cover up a door.
                            getMutableTile(room.x1, room.y3 + 1).isWall = true;
                            getMutableTile(room.x2, room.y3 + 1).isWall = true;
                        }
                        // if the room is 2 tall.
                        else {
                            // place the wall as long as it doesn't cover up a door.
                            getMutableTile(room.x1, room.y2 + 1).isWall = true;
                            getMutableTile(room.x2, room.y2 + 1).isWall = true;
                        }
                    }
                }
                // if there is a wall to the west, draw it.
                if (room.WWest === true) {
                    // place the wall as long as it doesn't cover up a door.
                    if (getMutableTile(room.x1 - 1, room.y1).decoration !== 1) {
                        getMutableTile(room.x1 - 1, room.y1).isWall = true;
                    }
                    if (getMutableTile(room.x1 - 1, room.y2).decoration !== 1) {
                        getMutableTile(room.x1 - 1, room.y2).isWall = true;
                    }
                    // if the room is 3 tall.
                    if (room.y3 !== -1) {
                        // place the wall as long as it doesn't cover up a door.
                        if (getMutableTile(room.x1 - 1, room.y3).decoration !== 1) {
                            getMutableTile(room.x1 - 1, room.y3).isWall = true;
                        }
                    }
                }
            }
        }
        // iterate over the map in order to draw rooms.
        // TODO: account for machines, to make sure doors won't be dead ends.
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                const room = map[x][y];
                // start drawing walls
                let shift = 0;
                // if there is door to the north, draw it.
                if (room.DNorth === true) {
                    // make sure it is drawn only once.
                    if (map[x][y - 1]) {
                        map[x][y - 1].DSouth = false;
                    }
                    // figure out which part of the wall to make the door.
                    if (room.WNorth === true) {
                        // if the room is 3 wide.
                        if (room.x3 !== -1) {
                            // pick a random spot.
                            shift = this.manager.random.int(3, 0);
                            // if this spot is blocked off or there is a door on the other-side.
                            if (shift === 0) {
                                if (getMutableTile(room.x1, room.y1 - 2).machine !== undefined ||
                                    getMutableTile(room.x1, room.y1).machine !== undefined ||
                                    getMutableTile(room.x1, room.y1 - 2).isWall ||
                                    getMutableTile(room.x1, room.y1 - 2).decoration === 1) {
                                    // try a different spot.
                                    shift = this.manager.random.int(2, 0);
                                    shift++;
                                }
                            }
                            else if (shift === 1) {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x2, room.y1 - 2).machine !== undefined ||
                                    getMutableTile(room.x2, room.y1).machine !== undefined ||
                                    getMutableTile(room.x2, room.y1 - 2).isWall ||
                                    getMutableTile(room.x2, room.y1 - 2).decoration === 1) {
                                    // try a different spot..
                                    shift = this.manager.random.int(2, 0);
                                    if (shift === 1) {
                                        shift++;
                                    }
                                }
                            }
                            else {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x3, room.y1 - 2).machine !== undefined ||
                                    getMutableTile(room.x3, room.y1).machine !== undefined ||
                                    getMutableTile(room.x3, room.y1 - 2).isWall ||
                                    getMutableTile(room.x3, room.y1 - 2).decoration === 1) {
                                    // try a different spot.
                                    shift = this.manager.random.int(2, 0);
                                }
                            }
                            // depending on the spot chosen, add the door.
                            if (shift === 0) {
                                getMutableTile(room.x1, room.y1 - 1).isWall = false;
                                getMutableTile(room.x1, room.y1 - 1).decoration = 1;
                            }
                            else if (shift === 1) {
                                getMutableTile(room.x2, room.y1 - 1).isWall = false;
                                getMutableTile(room.x2, room.y1 - 1).decoration = 1;
                            }
                            else {
                                getMutableTile(room.x3, room.y1 - 1).isWall = false;
                                getMutableTile(room.x3, room.y1 - 1).decoration = 1;
                            }
                        }
                        // if the room is 2 wide.
                        else {
                            // pick a random spot.
                            shift = this.manager.random.int(2, 0);
                            // if this spot is blocked off or there is a door on the other-side.
                            if (shift === 0) {
                                if (getMutableTile(room.x1, room.y1 - 2).machine !== undefined ||
                                    getMutableTile(room.x1, room.y1).machine !== undefined ||
                                    getMutableTile(room.x1, room.y1 - 2).isWall ||
                                    getMutableTile(room.x1, room.y1 - 2).decoration === 1) {
                                    // try the other spot.
                                    shift = 1;
                                }
                            }
                            else {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x2, room.y1 - 2).machine !== undefined ||
                                    getMutableTile(room.x2, room.y1).machine !== undefined ||
                                    getMutableTile(room.x2, room.y1 - 2).isWall ||
                                    getMutableTile(room.x2, room.y1 - 2).decoration === 1) {
                                    // try the other spot.
                                    shift = 0;
                                }
                            }
                            // depending on the spot chosen, add the door.
                            if (shift === 0) {
                                getMutableTile(room.x1, room.y1 - 1).isWall = false;
                                getMutableTile(room.x1, room.y1 - 1).decoration = 1;
                            }
                            else {
                                getMutableTile(room.x2, room.y1 - 1).isWall = false;
                                getMutableTile(room.x2, room.y1 - 1).decoration = 1;
                            }
                        }
                    }
                }
                // if there is a door to the east.
                if (room.DEast === true) {
                    // make sure it is drawn only once.
                    if (map[x + 1]) {
                        map[x + 1][y].DWest = false;
                    }
                    if (room.WEast === true) {
                        // if the room is 3 wide.
                        if (room.x3 !== -1) {
                            // if the room is 2 tall.
                            if (room.y3 !== -1) {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(3, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3 + 2, room.y1).machine !== undefined ||
                                        getMutableTile(room.x3, room.y1).machine !== undefined ||
                                        getMutableTile(room.x3 + 2, room.y1).isWall ||
                                        getMutableTile(room.x3 + 2, room.y1).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        shift++;
                                    }
                                }
                                else if (shift === 1) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3 + 2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x3, room.y2).machine !== undefined ||
                                        getMutableTile(room.x3 + 2, room.y2).isWall ||
                                        getMutableTile(room.x3 + 2, room.y2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        if (shift === 1) {
                                            shift++;
                                        }
                                    }
                                }
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3 + 2, room.y3).machine !== undefined ||
                                        getMutableTile(room.x3, room.y3).machine !== undefined ||
                                        getMutableTile(room.x3 + 2, room.y3).isWall ||
                                        getMutableTile(room.x3 + 2, room.y3).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x3 + 1, room.y1).isWall = false;
                                    getMutableTile(room.x3 + 1, room.y1).decoration = 1;
                                }
                                else if (shift === 1) {
                                    getMutableTile(room.x3 + 1, room.y2).isWall = false;
                                    getMutableTile(room.x3 + 1, room.y2).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x3 + 1, room.y3).isWall = false;
                                    getMutableTile(room.x3 + 1, room.y3).decoration = 1;
                                }
                            }
                            // if the room is 3 tall.
                            else {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(2, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3 + 2, room.y1).machine !== undefined ||
                                        getMutableTile(room.x3, room.y1).machine !== undefined ||
                                        getMutableTile(room.x3 + 2, room.y1).isWall ||
                                        getMutableTile(room.x3 + 2, room.y1).decoration === 1) {
                                        // try the other spot.
                                        shift = 1;
                                    }
                                }
                                // if the room is 3 tall.
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3 + 2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x3, room.y2).machine !== undefined ||
                                        getMutableTile(room.x3 + 2, room.y2).isWall ||
                                        getMutableTile(room.x3 + 2, room.y2).decoration === 1) {
                                        // try the other spot.
                                        shift = 0;
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x3 + 1, room.y1).isWall = false;
                                    getMutableTile(room.x3 + 1, room.y1).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x3 + 1, room.y2).isWall = false;
                                    getMutableTile(room.x3 + 1, room.y2).decoration = 1;
                                }
                            }
                        }
                        // if the room is 2 wide.
                        else {
                            // if the room is 3 tall.
                            if (room.y3 !== -1) {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(3, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2 + 2, room.y1).machine !== undefined ||
                                        getMutableTile(room.x2, room.y1).machine !== undefined ||
                                        getMutableTile(room.x2 + 2, room.y1).isWall ||
                                        getMutableTile(room.x2 + 2, room.y1).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        shift++;
                                    }
                                }
                                else if (shift === 1) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2 + 2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x2 + 2, room.y2).isWall ||
                                        getMutableTile(room.x2 + 2, room.y2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        if (shift === 1) {
                                            shift++;
                                        }
                                    }
                                }
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2 + 2, room.y3).machine !== undefined ||
                                        getMutableTile(room.x2, room.y3).machine !== undefined ||
                                        getMutableTile(room.x2 + 2, room.y3).isWall ||
                                        getMutableTile(room.x2 + 2, room.y3).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x2 + 1, room.y1).isWall = false;
                                    getMutableTile(room.x2 + 1, room.y1).decoration = 1;
                                }
                                else if (shift === 1) {
                                    getMutableTile(room.x2 + 1, room.y2).isWall = false;
                                    getMutableTile(room.x2 + 1, room.y2).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x2 + 1, room.y3).isWall = false;
                                    getMutableTile(room.x2 + 1, room.y3).decoration = 1;
                                }
                            }
                            // if the room is 2 tall.
                            else {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(2, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2 + 2, room.y1).machine !== undefined ||
                                        getMutableTile(room.x2, room.y1).machine !== undefined ||
                                        getMutableTile(room.x2 + 2, room.y1).isWall ||
                                        getMutableTile(room.x2 + 2, room.y1).decoration === 1) {
                                        // try the other spot.
                                        shift = 1;
                                    }
                                }
                                // if the room is 3 tall.
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2 + 2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x2 + 2, room.y2).isWall ||
                                        getMutableTile(room.x2 + 2, room.y2).decoration === 1) {
                                        // try the other spot.
                                        shift = 0;
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x2 + 1, room.y1).isWall = false;
                                    getMutableTile(room.x2 + 1, room.y1).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x2 + 1, room.y2).isWall = false;
                                    getMutableTile(room.x2 + 1, room.y2).decoration = 1;
                                }
                            }
                        }
                    }
                }
                if (room.DSouth === true) {
                    // make sure it is drawn only once.
                    if (map[x][y + 1]) {
                        map[x][y + 1].DNorth = false;
                    }
                    if (room.WSouth === true) {
                        // if the room is 3 wide.
                        if (room.x3 !== -1) {
                            // if the room is 3 tall.
                            if (room.y3 !== -1) {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(3, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x1, room.y3 + 2).machine !== undefined ||
                                        getMutableTile(room.x1, room.y3).machine !== undefined ||
                                        getMutableTile(room.x1, room.y3 + 2).isWall ||
                                        getMutableTile(room.x1, room.y3 + 2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        shift++;
                                    }
                                }
                                else if (shift === 1) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2, room.y3 + 2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y3).machine !== undefined ||
                                        getMutableTile(room.x2, room.y3 + 2).isWall ||
                                        getMutableTile(room.x2, room.y3 + 2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        if (shift === 1) {
                                            shift++;
                                        }
                                    }
                                }
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3, room.y3 + 2).machine !== undefined ||
                                        getMutableTile(room.x3, room.y3).machine !== undefined ||
                                        getMutableTile(room.x3, room.y3 + 2).isWall ||
                                        getMutableTile(room.x3, room.y3 + 2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x1, room.y3 + 1).isWall = false;
                                    getMutableTile(room.x1, room.y3 + 1).decoration = 1;
                                }
                                else if (shift === 1) {
                                    getMutableTile(room.x2, room.y3 + 1).isWall = false;
                                    getMutableTile(room.x2, room.y3 + 1).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x3, room.y3 + 1).isWall = false;
                                    getMutableTile(room.x3, room.y3 + 1).decoration = 1;
                                }
                            }
                            // if the room is 2 tall.
                            else {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(3, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x1, room.y2 + 2).machine !== undefined ||
                                        getMutableTile(room.x1, room.y2).machine !== undefined ||
                                        getMutableTile(room.x1, room.y2 + 2).isWall ||
                                        getMutableTile(room.x1, room.y2 + 2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        shift++;
                                    }
                                }
                                else if (shift === 1) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2, room.y2 + 2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y2 + 2).isWall ||
                                        getMutableTile(room.x2, room.y2 + 2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                        if (shift === 1) {
                                            shift++;
                                        }
                                    }
                                }
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x3, room.y2 + 2).machine !== undefined ||
                                        getMutableTile(room.x3, room.y2).machine !== undefined ||
                                        getMutableTile(room.x3, room.y2 + 2).isWall ||
                                        getMutableTile(room.x3, room.y2 + 2).decoration === 1) {
                                        // try a different spot.
                                        shift = this.manager.random.int(2, 0);
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x1, room.y2 + 1).isWall = false;
                                    getMutableTile(room.x1, room.y2 + 1).decoration = 1;
                                }
                                else if (shift === 1) {
                                    getMutableTile(room.x2, room.y2 + 1).isWall = false;
                                    getMutableTile(room.x2, room.y2 + 1).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x2, room.y2 + 1).isWall = false;
                                    getMutableTile(room.x2, room.y2 + 1).decoration = 1;
                                }
                            }
                        }
                        // if the room is 2 wide.
                        else {
                            // if the room is 3 tall.
                            if (room.y3 !== -1) {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(2, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x1, room.y3 + 2).machine !== undefined ||
                                        getMutableTile(room.x1, room.y3).machine !== undefined ||
                                        getMutableTile(room.x1, room.y3 + 2).isWall ||
                                        getMutableTile(room.x1, room.y3 + 2).decoration === 1) {
                                        // try the other spot.
                                        shift = 1;
                                    }
                                }
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2, room.y3 + 2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y3).machine !== undefined ||
                                        getMutableTile(room.x2, room.y3 + 2).isWall ||
                                        getMutableTile(room.x2, room.y3 + 2).decoration === 1) {
                                        // try the other spot.
                                        shift = 0;
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x1, room.y3 + 1).isWall = false;
                                    getMutableTile(room.x1, room.y3 + 1).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x2, room.y3 + 1).isWall = false;
                                    getMutableTile(room.x2, room.y3 + 1).decoration = 1;
                                }
                            }
                            // if the room is 2 tall.
                            else {
                                // figure out which part of the wall to make the door.
                                shift = this.manager.random.int(2, 0);
                                if (shift === 0) {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x1, room.y2 + 2).machine !== undefined ||
                                        getMutableTile(room.x1, room.y2).machine !== undefined ||
                                        getMutableTile(room.x1, room.y2 + 2).isWall ||
                                        getMutableTile(room.x1, room.y2 + 2).decoration === 1) {
                                        // try the other spot.
                                        shift = 1;
                                    }
                                }
                                else {
                                    // if this spot is blocked off or there is a door on the other-side.
                                    if (getMutableTile(room.x2, room.y2 + 2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y2).machine !== undefined ||
                                        getMutableTile(room.x2, room.y2 + 2).isWall ||
                                        getMutableTile(room.x2, room.y2 + 2).decoration === 1) {
                                        // try the other spot.
                                        shift = 0;
                                    }
                                }
                                // depending on the spot chosen, add the door.
                                if (shift === 0) {
                                    getMutableTile(room.x1, room.y2 + 1).isWall = false;
                                    getMutableTile(room.x1, room.y2 + 1).decoration = 1;
                                }
                                else {
                                    getMutableTile(room.x2, room.y2 + 1).isWall = false;
                                    getMutableTile(room.x2, room.y2 + 1).decoration = 1;
                                }
                            }
                        }
                    }
                }
                if (room.DWest === true) {
                    // make sure it is drawn only once.
                    if (map[x - 1]) {
                        map[x - 1][y].DEast = false;
                    }
                    if (room.WWest === true) {
                        // if the room is 3 tall.
                        if (room.y3 !== -1) {
                            // figure out which part of the wall to make the door.
                            shift = this.manager.random.int(3, 0);
                            if (shift === 0) {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x1 - 2, room.y1).machine !== undefined ||
                                    getMutableTile(room.x1, room.y1).machine !== undefined ||
                                    getMutableTile(room.x1 - 2, room.y1).isWall ||
                                    getMutableTile(room.x1 - 2, room.y1).decoration === 1) {
                                    // try a different spot.
                                    shift = this.manager.random.int(2, 0);
                                    shift++;
                                }
                            }
                            else if (shift === 1) {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x1 - 2, room.y2).machine !== undefined ||
                                    getMutableTile(room.x1, room.y2).machine !== undefined ||
                                    getMutableTile(room.x1 - 2, room.y2).isWall ||
                                    getMutableTile(room.x1 - 2, room.y2).decoration === 1) {
                                    // try a different spot.
                                    shift = this.manager.random.int(2, 0);
                                    if (shift === 1) {
                                        shift++;
                                    }
                                }
                            }
                            else {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x1 - 2, room.y3).machine !== undefined ||
                                    getMutableTile(room.x1, room.y3).machine !== undefined ||
                                    getMutableTile(room.x1 - 2, room.y3).isWall ||
                                    getMutableTile(room.x1 - 2, room.y3).decoration === 1) {
                                    // try a different spot.
                                    shift = this.manager.random.int(2, 0);
                                }
                            }
                            // depending on the spot chosen, add the door.
                            if (shift === 0) {
                                getMutableTile(room.x1 - 1, room.y1).isWall = false;
                                getMutableTile(room.x1 - 1, room.y1).decoration = 1;
                            }
                            else if (shift === 1) {
                                getMutableTile(room.x1 - 1, room.y2).isWall = false;
                                getMutableTile(room.x1 - 1, room.y2).decoration = 1;
                            }
                            else {
                                getMutableTile(room.x1 - 1, room.y3).isWall = false;
                                getMutableTile(room.x1 - 1, room.y3).decoration = 1;
                            }
                        }
                        else {
                            // figure out which part of the wall to make the door.
                            shift = this.manager.random.int(2, 0);
                            if (shift === 0) {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x1 - 2, room.y1).machine !== undefined ||
                                    getMutableTile(room.x1, room.y1).machine !== undefined ||
                                    getMutableTile(room.x1 - 2, room.y1).isWall ||
                                    getMutableTile(room.x1 - 2, room.y1).decoration === 1) {
                                    // try the other spot.
                                    shift = 1;
                                }
                            }
                            else {
                                // if this spot is blocked off or there is a door on the other-side.
                                if (getMutableTile(room.x1 - 2, room.y2).machine !== undefined ||
                                    getMutableTile(room.x1, room.y2).machine !== undefined ||
                                    getMutableTile(room.x1 - 2, room.y2).isWall ||
                                    getMutableTile(room.x1 - 2, room.y2).decoration === 1) {
                                    // try the other spot.
                                    shift = 0;
                                }
                            }
                            // depending on the spot chosen, add the door.
                            if (shift === 0) {
                                getMutableTile(room.x1 - 1, room.y1).isWall = false;
                                getMutableTile(room.x1 - 1, room.y1).decoration = 1;
                            }
                            else {
                                getMutableTile(room.x1 - 1, room.y2).isWall = false;
                                getMutableTile(room.x1 - 1, room.y2).decoration = 1;
                            }
                        }
                    }
                }
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

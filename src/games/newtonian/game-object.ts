import { IBaseGameObjectRequiredData } from "~/core/game";
import { BaseClasses, IGameObjectProperties } from "./";
import { NewtonianGame } from "./game";
import { NewtonianGameManager } from "./game-manager";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class GameObject extends BaseClasses.GameObject {
    /** The game this game object is in */
    public readonly game!: NewtonianGame;

    /** The manager of the game that controls this */
    public readonly manager!: NewtonianGameManager;

    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     */
    public readonly gameObjectName!: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     */
    public readonly id!: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     */
    public logs!: string[];

    // <<-- Creer-Merge: attributes -->>
    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a GameObject is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor (
        // never directly created by game developers
        args: IGameObjectProperties,
        required: IBaseGameObjectRequiredData,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        const { mapHeight, mapWidth } = this.game;
        /*
        or
        var mapHeight = this.game.mapHeight;
        var mapWidth = this.game.mapWidth;*/
        // NOTE: this.manager.random.int(MAX_NUM_POINTS, MIN_NUM_POINTS);
        // setup any thing you need here

        // TODO list: Machine list
        const RMstart = 7;
        const MMstart = 25;
        const spawnEnd = 7;
        const genEnd = 15;
        const startEnd = 5;
        const mid = Math.floor(mapHeight / 2);
        for(let x = 0; x < (mapWidth / 2 + 1); x++) {
            for(let y = 0; y < mapHeight; y++) {
                if(y === 0 || y === (mapHeight - 1) || x === 0 ||
                   x === RMstart || x === MMstart || x === Math.floor(mapWidth / 2) - 1) {
                    /*if(this.game.getTile(x, y) === undefined) {
                        throw new Error(`${this} has no tile somehow!?!?!`);
                    }*/
                    get(x, y).isWall = true;
                }
                else if (x < startEnd && (y === spawnEnd || y === genEnd))
                {
                    get(x, y).isWall = true;
                }
            }
        }
        // set spawn area
        for(let x = 1; x <= startEnd - 1; x++) {
            for(let y = 1; y < spawnEnd; y++) {
                get(x, y).owner = this.game.players[0];
                get(x, y).type = "spawn";
            }
        }
        // set generator area
        for(let x = 1; x <= startEnd - 1; x++) {
            for(let y = spawnEnd + 1; y < genEnd; y++) {
                get(x, y).owner = this.game.players[0];
                get(x, y).type = "generator";
            }
        }
        // set resource spawn
        conveyorBelt(1, 20, "e");
        conveyorBelt(2, 20, "e");
        conveyorBelt(3, 20, "e");
        conveyorBelt(4, 20, "n");
        conveyorBelt(4, 19, "n");
        conveyorBelt(4, 18, "n");
        conveyorBelt(4, 17, "w");
        conveyorBelt(3, 17, "w");
        conveyorBelt(2, 17, "w");
        conveyorBelt(1, 17, "b");
        // generate center
        // determine the size of the center room
        const midSize = Math.floor(this.manager.random.int(3)) + 3;
        // determine the rooms offset
        let shift = Math.floor(this.manager.random.int(Math.floor(mapHeight / 2) -
                         midSize)); // 0-7, 6 mean y = 0, 7 means y = maxHeight
        shift = Math.floor(mapHeight / 2) - midSize - 5; // hardset for testing. Remove this.
        // edge case handling to make sure walls don't touch.
        if(shift === Math.floor(mapHeight / 2) - midSize - 1) {
            shift += 1;
        }
        // decides weither the rooms shifts upwards or downwards
        // this variable will be used to determine random shifts and doorways
        let shiftDir = Math.floor(this.manager.random.int(2));
        shiftDir = 0; // hardset for testing. Remove this.
        if(shiftDir === 1) {
            shift = -shift;
        }
        // determines machines shift
        let mShift = Math.floor(this.manager.random.int(midSize));
        // determines the machine shift direction
        shiftDir = Math.floor(this.manager.random.int(2));
        if(shiftDir === 1) {
            mShift = -mShift;
        }
        // generate the run time for the machiens
        const time = Math.floor(this.manager.random.int(7)) + 2;
        // determines the tile that machine will be on.
        const tile = get(MMstart + 1, mid + shift + mShift);
        // makes the machine
        // TODO: FIX CREATE!
        const machine = this.game.create("Machine", {
            oreType: "redium",
            refineTime: time,
            refineInput: (Math.floor(time / 2) + 1),
            refineOutput: Math.floor(time / 2),
            tile: tile,
        });
        // assigned the tile it's machine.
        tile.machine = machine;
        // adds the machine to the list
        this.game.machines.push(machine);
        // clears out center hallway walls that would run through the center room. also creats the top and bottom walls.
        for(let x = MMstart + 1; x < (mapWidth / 2) - 1; x++) {
            get(x, mid + midSize + shift).isWall = true;
            get(x, mid - midSize + shift).isWall = true;
            if(x === Math.floor(mapWidth / 2) - 1) {
                for(let y = mid - midSize + 1 + shift; y < mid + midSize + shift; y++) {
                    get(x, y).isWall = false;
                }
            }
        }
        // generates structures that fill in the rest of the center area
        // top area
        // makes sure there is a top area.
        if(shift !== -(Math.floor(mapHeight / 2) - midSize)) {
            // if it has the smallest possible space and still exist, hallway time.
            if(shift === -(Math.floor(mapHeight / 2) - midSize - 2)) {
                get(MMstart, 1).isWall = false;
                get(Math.floor(mapWidth / 2) - 1, 1).isWall = false;
            // if there are 2 spaces.
            } else if (shift === -(Math.floor(mapHeight / 2) - midSize - 3)) {
                const midSplit = Math.floor(Math.random() * 3);
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    get(MMstart + 3 + midSplit,1).isWall = true;
                } else {
                    get(MMstart + 3 + midSplit,2).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    get(MMstart, 1).isWall = false;
                } else {
                    get(MMstart, 2).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    get(Math.floor(mapWidth / 2) - 1, 1).isWall = false;
                } else {
                    get(Math.floor(mapWidth / 2) - 1, 2).isWall = false;
                }
            } else if (shift === -(Math.floor(mapHeight / 2) - midSize- 4)) {
                const midSplit = Math.floor(Math.random() * 3);
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(MMstart + 3 + midSplit,1).isWall = true;
                    get(MMstart + 3 + midSplit,2).isWall = true;
                } else if(shiftDir === 1) {
                    get(MMstart + 3 + midSplit,2).isWall = true;
                    get(MMstart + 3 + midSplit,3).isWall = true;
                } else {
                    get(MMstart + 3 + midSplit,1).isWall = true;
                    get(MMstart + 3 + midSplit,3).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(MMstart, 1).isWall = false;
                } else if(shiftDir === 1) {
                    get(MMstart, 2).isWall = false;
                } else {
                    get(MMstart, 3).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(Math.floor(mapWidth / 2) - 1, 1).isWall = false;
                } else if(shiftDir === 1) {
                    get(Math.floor(mapWidth / 2) - 1, 2).isWall = false;
                } else {
                    get(Math.floor(mapWidth / 2) - 1, 3).isWall = false;
                }
            } else if (shift === -(Math.floor(mapHeight / 2) - midSize - 5)) {
                const midSplit = Math.floor(Math.random() * 2);
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(MMstart + 3 + midSplit,1).isWall = true;
                    get(MMstart + 3 + midSplit,2).isWall = true;
                } else if(shiftDir === 1) {
                    get(MMstart + 3 + midSplit,2).isWall = true;
                    get(MMstart + 3 + midSplit,3).isWall = true;
                } else {
                    get(MMstart + 3 + midSplit,1).isWall = true;
                    get(MMstart + 3 + midSplit,3).isWall = true;
                }
                get(MMstart, 4).isWall = false;
                get(Math.floor(mapWidth / 2) - 1, 1).isWall = false;
                get(Math.floor(mapWidth / 2) - 1, 2).isWall = false;
                get(Math.floor(mapWidth / 2) - 1, 4).isWall = false;
                for(let x = MMstart + 1; x <= Math.floor(mapWidth / 2); x++) {
                    get(x,3).isWall = true;
                }
                shiftDir = Math.floor(this.manager.random.int(1, 0));
                if(shiftDir === 1) {
                    shiftDir = Math.floor(Math.random() * 2);
                    if(shiftDir === 1) {
                        get(Math.floor(mapWidth / 2) - 2, 1).isWall = true;
                    } else {
                        get(Math.floor(mapWidth / 2) - 2, 2).isWall = true;
                    }
                } else {
                    get(Math.floor(mapWidth/2)-2, 1).isWall = true;
                    get(Math.floor(mapWidth/2)-2, 2).isWall = true;
                    if(midSplit === 1) {
                        shiftDir = Math.floor(Math.random() * 2);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-3, 3).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-4, 3).isWall = false;
                        }
                    } else {
                        shiftDir = Math.floor(Math.random() * 3);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-3, 3).isWall = false;
                        } else if(shiftDir === 2) {
                            get(Math.floor(mapWidth/2)-4, 3).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-5, 3).isWall = false;
                        }
                    }
                }
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 0) {
                    if(midSplit === 1) {
                        shiftDir = Math.floor(Math.random() * 2);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-8, 3).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-7, 3).isWall = false;
                        }
                    } else {
                        shiftDir = Math.floor(Math.random() * 3);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-6, 3).isWall = false;
                        } else if(shiftDir === 2) {
                            get(Math.floor(mapWidth/2)-7, 3).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-8, 3).isWall = false;
                        }
                    }
                } else {
                    shiftDir = Math.floor(Math.random() * 2);
                    if(shiftDir === 1) {
                        get(MMstart, 2).isWall = false;
                    } else {
                        get(MMstart, 1).isWall = false;
                    }
                }
                get(Math.floor(mapWidth/2)-1, 3).isWall = false;
            } else {
                for(let y = 1; y < mid-midSize+shift; y++) {
                    get(Math.floor(mapWidth/2)-1, y).isWall = false;
                }
                get(Math.floor(mapWidth/2), mid-midSize+shift).isWall = true;
                let a = 3; // this is hardset for one map. Because I am lazy.
                let b = Math.floor((mid-midSize+shift)/3);
                let extra = 0;
                for(i = mid-midSize+shift; i > 0; i -= 3){
                    if(i > 0 && i < 3) {
                        extra = i;
                    }
                }
                let map = [];
                for (var i = 0; i < a; i++) {
                    map[i] = new Array(b);
                }
                let y_start = 1;
                let y_end = mid-midSize+shift-1;
                let room = null;
                let start = 0;
                if(extra === 2) {
                    for(let i = 0; i < a; i++) {
                        room = makeRoom(MMstart+1 + (i*3), MMstart+2 + (i*3), y_start, y_start + 1, y_start + 2);
                        map[i][0] = room;
                        // get(9+i, 2).isWall = true;
                    }
                    start = 1;
                    y_start += 1;
                    for(let i = 0; i < a; i++) {
                        room = makeRoom(MMstart+1 + (i*3), MMstart+2 + (i*3), y_end-2, y_end-1 , y_end);
                        map[i][b-1] = room;
                        // get(9+i, 1+b).isWall = true;
                    }
                    b -= 1;
                } else if (extra === 1) {
                    shiftDir = Math.floor(Math.random() * 2);
                    if(shiftDir === 1) {
                        for(let i = 0; i < a; i++) {
                            room = makeRoom(MMstart+1 + (i*3), MMstart+2 +
                                      (i*3), y_start, y_start + 1, y_start + 2);
                            map[i][0] = room;
                            // get(9+i, 2).isWall = true;
                        }
                        start = 1;
                        y_start += 1;
                    } else {
                        for(let i = 0; i < a; i++) {
                            room = makeRoom(MMstart+1 + (i*3), MMstart+2 + (i*3), y_end-2, y_end-1 , y_end);
                            map[i][b-1] = room;
                            // get(9+i, 1+b).isWall = true;
                        }
                        b -= 1;
                    }
                }
                for(let x = 0; x < a; x++) {
                    for(let y = start; y < b; y++) {
                        room = makeRoom(MMstart+1 + (x*3), MMstart+2 + (x*3), y_start + (y*3), y_start + 1 + (y*3));
                        map[x][y] = room;
                        // get(9+x, 2+y).isWall = true;
                    }
                }
                shiftDir = Math.floor(Math.random()*3);
                if(shiftDir !== 0) {
                    map[0][map[0].length - 1].DSouth = true;
                }
                if(shiftDir !== 1) {
                    map[1][map[0].length - 1].DSouth = true;
                }
                if(shiftDir !== 2) {
                    map[2][map[0].length - 1].DSouth = true;
                }
                shiftDir = Math.floor(Math.random()*map[0].length);
                if(shiftDir !== 0) {
                    map[map.length - 1][0].DEast = true;
                }
                if(shiftDir !== 1) {
                    map[map.length - 1][1].DEast = true;
                }
                if(shiftDir !== 2 && map[map.length - 1][2]) {
                    map[map.length - 1][2].DEast = true;
                }
                if(shiftDir !== 3 && map[map.length - 1][3]) {
                    map[map.length - 1][3].DEast = true;
                }
                shiftDir = Math.floor(Math.random()*map[0].length);
                if(shiftDir !== 0) {
                    map[0][0].DWest = true;
                }
                if(shiftDir !== 1) {
                    map[0][1].DWest = true;
                }
                if(shiftDir !== 2 && map[map.length - 1][2]) {
                    map[0][2].DWest = true;
                }
                if(shiftDir !== 3 && map[map.length - 1][3]) {
                    map[0][3].DWest = true;
                }
                this.roomFill(map);
            }
        }
        // bottom area
        if(shift !== Math.floor(mapHeight/2)-midSize) {
            // generate for smallest leftover area - make a hallway
            if(shift === Math.floor(mapHeight/2)-midSize-2) {
                get(MMstart, 21).isWall = false;
                get(Math.floor(mapWidth/2)-1, 21).isWall = false;
            // generate for a slightly bigger area.
            } else if (shift === Math.floor(mapHeight/2)-midSize-3) {
                let midSplit = Math.floor(Math.random()*3);
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    get(MMstart+3+midSplit,20).isWall = true;
                } else {
                    get(MMstart+3+midSplit,21).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    get(MMstart, 21).isWall = false;
                } else {
                    get(MMstart, 20).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    get(Math.floor(mapWidth/2)-1, 21).isWall = false;
                } else {
                    get(Math.floor(mapWidth/2)-1, 20).isWall = false;
                }
            // generate a 4 tall area.
            } else if (shift === Math.floor(mapHeight/2)-midSize-4) {
                let midSplit = Math.floor(Math.random()*3);
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(MMstart+3+midSplit,19).isWall = true;
                    get(MMstart+3+midSplit,20).isWall = true;
                } else if(shiftDir === 1) {
                    get(MMstart+3+midSplit,20).isWall = true;
                    get(MMstart+3+midSplit,21).isWall = true;
                } else {
                    get(MMstart+3+midSplit,19).isWall = true;
                    get(MMstart+3+midSplit,21).isWall = true;
                }
                // determines the first rooms extra door
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(MMstart, 19).isWall = false;
                } else if(shiftDir === 1) {
                    get(MMstart, 20).isWall = false;
                } else {
                    get(MMstart, 21).isWall = false;
                }
                // determines the second room's extra door
                shiftDir = Math.floor(Math.random() * 3);
                if(shiftDir === 0) {
                    get(Math.floor(mapWidth/2)-1, 19).isWall = false;
                } else if(shiftDir === 1) {
                    get(Math.floor(mapWidth/2)-1, 20).isWall = false;
                } else {
                    get(Math.floor(mapWidth/2)-1, 21).isWall = false;
                }
            // generate a 5 tall area. There is room for a hallway
            } else if (shift === Math.floor(mapHeight/2)-midSize-5) {
                // figure out where to split the area
                let midSplit = Math.floor(Math.random()*2);
                shiftDir = Math.floor(Math.random() * 3);
                // place the seperating wall with a hole in it.
                if(shiftDir === 0) {
                    get(MMstart+3+midSplit,19).isWall = true;
                    get(MMstart+3+midSplit,20).isWall = true;
                } else if(shiftDir === 1) {
                    get(MMstart+3+midSplit,20).isWall = true;
                    get(MMstart+3+midSplit,21).isWall = true;
                } else {
                    get(MMstart+3+midSplit,19).isWall = true;
                    get(MMstart+3+midSplit,21).isWall = true;
                }
                get(MMstart, 18).isWall = false;
                get(Math.floor(mapWidth/2)-1, 21).isWall = false;
                get(Math.floor(mapWidth/2)-1, 20).isWall = false;
                get(Math.floor(mapWidth/2)-1, 18).isWall = false;
                for(x = MMstart+1; x <= Math.floor(mapWidth/2); x++) {
                    get(x,19).isWall = true;
                }
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    shiftDir = Math.floor(Math.random() * 2);
                    if(shiftDir === 1) {
                        get(Math.floor(mapWidth/2)-2, 20).isWall = true;
                    } else {
                        get(Math.floor(mapWidth/2)-2, 21).isWall = true;
                    }
                } else {
                    get(Math.floor(mapWidth/2)-2, 20).isWall = true;
                    get(Math.floor(mapWidth/2)-2, 21).isWall = true;
                    if(midSplit === 1) {
                        shiftDir = Math.floor(Math.random() * 2);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-3, 19).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-4, 19).isWall = false;
                        }
                    } else {
                        shiftDir = Math.floor(Math.random() * 3);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-3, 19).isWall = false;
                        } else if(shiftDir === 2) {
                            get(Math.floor(mapWidth/2)-4, 19).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-5, 19).isWall = false;
                        }
                    }
                }
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 0) {
                    if(midSplit === 1) {
                        shiftDir = Math.floor(Math.random() * 2);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-8, 19).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-7, 19).isWall = false;
                        }
                    } else {
                        shiftDir = Math.floor(Math.random() * 3);
                        if(shiftDir === 1) {
                            get(Math.floor(mapWidth/2)-6, 19).isWall = false;
                        } else if(shiftDir === 2) {
                            get(Math.floor(mapWidth/2)-7, 19).isWall = false;
                        } else {
                            get(Math.floor(mapWidth/2)-8, 19).isWall = false;
                        }
                    }
                } else {
                    shiftDir = Math.floor(Math.random() * 2);
                    if(shiftDir === 1) {
                        get(MMstart, 20).isWall = false;
                    } else {
                        get(MMstart, 21).isWall = false;
                    }
                }
                get(Math.floor(mapWidth/2)-1, 19).isWall = false;
            // generate a very large area.
            } else {
                for(y = mid+midSize+shift+1; y < mapHeight-1; y++) {
                    get(Math.floor(mapWidth/2)-1, y).isWall = false;
                }
                /*get(Math.floor(mapWidth/2), mid+midSize+shift).isWall = true;
                shiftDir = Math.floor(Math.random() * 2);
                if(shiftDir === 1) {
                    //
                } else {
                    //
                }*/
            }
        }
        // generate Side area
        // Math.floor(Math.random() * 3)
        // mirror map
        for(let x = 0; x < mapWidth/2; x++) {
            for(let y = 0; y < mapHeight; y++) {
                let copy = get(x, y).isWall;
                get((mapWidth-1-x), y).isWall = copy;
                if(get(x, y).machine != null) {
                    let mach = get(x, y).machine;
                    let machine = this.game.create("Machine", {
                        oreType: "blueium",
                        refineTime: mach.refineTime,
                        refineInput: mach.RefineInput,
                        refineOutput: mach.RefineOutput,
                        tile: get((mapWidth-1-x), y),
                    });
                    get((mapWidth-1-x), y).machine = machine;
                    this.game.machines.push(machine);
                } else if (get(x, y).type === "spawn") {
                    get((mapWidth-1-x), y).type = "spawn";
                    get((mapWidth-1-x), y).owner = this.game.players[1];
                } else if (get(x, y).type === "generator") {
                    get((mapWidth-1-x), y).type = "generator";
                    get((mapWidth-1-x), y).owner = this.players[1];
                } else if (get(x, y).type === "conveyor") {
                    get((mapWidth-1-x), y).type = "conveyor";
                    let dir = get(x, y).direction;
                    if(dir === "east") {
                        dir = "west";
                    } else if(dir === "west") {
                        dir = "east";
                    }
                    get((mapWidth - 1 - x), y).direction = dir;
                }
            }
        }
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.
function conveyorBelt(x, y, dir) {// dir = 'n', 'e', 's', 'w', or 'b'
        if(dir === "n") {
            get(x, y).type = "conveyor";
            get(x, y).direction = "north";
        } else if(dir === 'e') {
            get(x, y).type = "conveyor";
            get(x, y).direction = "east";
        } else if(dir === 's') {
            get(x, y).type = "conveyor";
            get(x, y).direction = "south";
        } else if(dir === 'w') {
            get(x, y).type = "conveyor";
            get(x, y).direction = "west";
        } else {
            get(x, y).type = "conveyor";
            get(x, y).direction = "blank";
        }
    }

function makeRoom(x_1, x_2, y_1, y_2, y_3 = -1, x_3 = -1) {
        let room = { x1: x_1, y1: y_1, x2: x_2,    y2: y_2, x3: x_3, y3: y_3,
            WNorth: true, WEast: true, WSouth: true, WWest: true,
            DNorth: false, DEast: false, DSouth: false,    DWest: false};
        return room;
    }

function roomFill(map) {
        let unconnected = [];
        let roomList = [];
        let connect = Math.floor((map.length * map[0].length)/2);
        let find = null;
        let done = false;
        connect += Math.floor(connect * (.25 + (Math.random() * .25)));
        // get(7+connect,7).isWall = true;
        for(let x = 0; x < map.length; x++) {
            for(let y = 0; y < map[0].length; y++) {
                unconnected.push({x: x, y: y});
                roomList.push({x: x, y: y});
            }
        }
        for(let i = 0; i <= connect; i++) {
            if(unconnected.length > 0) {
                // get(8+i,7).isWall = true;
                let index = Math.floor(Math.random() * unconnected.length);
                find = unconnected[index];
                done = false;
                let rot = Math.floor(Math.random() * 4);
                let num = 0;
                while(!done) {
                    if(rot === 0) {
                        num++;
                        rot++;
                        if(map[find.x][find.y-1] && (this.has(unconnected, find.x, find.y-1) >= 0 || num >= 5)) {
                            map[find.x][find.y].WNorth = false;
                            map[find.x][find.y-1].WSouth = false;
                            unconnected.splice(index, 1);
                            if(this.has(unconnected, find.x, find.y-1) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x, find.y-1), 1);
                            }
                            done = true;
                        }
                    } else if(rot === 1) {
                        num++;
                        rot++;
                        if(map[find.x+1] && (this.has(unconnected, find.x+1, find.y) >= 0 || num >= 5)) {
                            map[find.x][find.y].WEast = false;
                            map[find.x+1][find.y].WWest = false;
                            unconnected.splice(index, 1);
                            if(this.has(unconnected, find.x+1, find.y) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x+1, find.y), 1);
                            }
                            done = true;
                        }
                    } else if(rot === 1) {
                        num++;
                        rot++;
                        if(map[find.x][find.y+1] && (this.has(unconnected, find.x, find.y+1) >= 0 || num >= 5)) {
                            map[find.x][find.y].WSouth = false;
                            map[find.x][find.y+1].WNorth = false;
                            unconnected.splice(index, 1);
                            if(this.has(unconnected, find.x, find.y+1) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x+1, find.y), 1);
                            }
                            done = true;
                        }
                    } else {
                        num++;
                        rot = 0;
                        if(map[find.x-1] && (this.has(unconnected, find.x-1, find.y) >= 0 || num >= 5)) {
                            map[find.x][find.y].WWest = false;
                            map[find.x-1][find.y].WEast = false;
                            unconnected.splice(index, 1);
                            if(this.has(unconnected, find.x-1, find.y) >= 0) {
                                unconnected.splice(this.has(unconnected, find.x-1, find.y), 1);
                            }
                            done = true;
                        }
                    }
                }
            } else {
                find = roomList[Math.floor(Math.random() * roomList.length)];
                done = false;
                let rot = Math.floor(Math.random() * 4);
                while(!done) {
                    if(rot === 0) {
                        rot++;
                        if(map[find.x][find.y-1]) {
                            map[find.x][find.y].WNorth = false;
                            map[find.x][find.y-1].WSouth = false;
                            done = true;
                        }
                    } else if(rot === 1) {
                        rot++;
                        if(map[find.x+1]) {
                            map[find.x][find.y].WEast = false;
                            map[find.x+1][find.y].WWest = false;
                            done = true;
                        }
                    } else if(rot === 2) {
                        rot++;
                        if(map[find.x][find.y+1]) {
                            map[find.x][find.y].WSouth = false;
                            map[find.x][find.y+1].WNorth = false;
                            done = true;
                        }
                    } else {
                        rot = 0;
                        if(map[find.x-1]) {
                            map[find.x][find.y].WWest = false;
                            map[find.x-1][find.y].WEast = false;
                            done = true;
                        }
                    }
                }
            }
        }
        let doors = (map.length*map[0].length)/2;
        doors = Math.floor(doors * 1.5);
        unconnected = [];
        let connected = [];
        find = roomList[Math.floor(Math.random() * roomList.length)];
        connected.push({x: find.x, y: find.y});
        if(map[find.x][find.y-1]) {
            unconnected.push({x: find.x, y: find.y-1});
        }
        if(map[find.x][find.y+1]) {
            unconnected.push({x: find.x, y: find.y+1});
        }
        if(map[find.x+1]) {
            unconnected.push({x: find.x+1, y: find.y});
        }
        if(map[find.x-1]) {
            unconnected.push({x: find.x-1, y: find.y});
        }
        for(let v = 0; v < doors; v++) {
            if(unconnected.length > 0 && false) {
                done = false;
                let index = Math.floor(Math.random() * unconnected.length);
                find = unconnected[index];
                let dir = Math.floor(Math.random*4);
                let num = 0;
                while(!done) {
                    if(dir === 0) {
                        dir++;
                        num++;
                        if(map[find.x][find.y-1] && this.has(connected, find.x, find.y-1) >= 0) {
                            done = true;
                            map[find.x][find.y-1].DSouth = true;
                            map[find.x][find.y].DNorth = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x ,y: find.y});
                            if(map[find.x][find.y+1] && this.has(unconnected, find.x, find.y+1) === -1
                                                     && this.has(connected, find.x, find.y+1) === -1) {
                                unconnected.push({x: find.x, y: find.y+1});
                            }
                            if(map[find.x+1] && this.has(unconnected, find.x+1, find.y) === -1
                                                     && this.has(connected, find.x+1, find.y) === -1) {
                                unconnected.push({x: find.x+1, y: find.y});
                            }
                            if(map[find.x-1] && this.has(unconnected, find.x-1, find.y) === -1
                                                     && this.has(connected, find.x-1, find.y) === -1) {
                                unconnected.push({x: find.x-1, y: find.y});
                            }
                        }
                    } else if(dir === 1) {
                        dir++;
                        num++;
                        if(map[find.x+1] && this.has(connected, find.x+1, find.y) >= 0) {
                            done = true;
                            map[find.x+1][find.y].DWest = true;
                            map[find.x][find.y].DEast = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x ,y: find.y});
                            if(map[find.x][find.y+1] && this.has(unconnected, find.x, find.y+1) === -1
                                                     && this.has(connected, find.x, find.y+1) === -1) {
                                unconnected.push({x: find.x, y: find.y+1});
                            }
                            if(map[find.x][find.y-1] && this.has(unconnected, find.x, find.y-1
                                                     && this.has(connected, find.x, find.y-1) === -1) === -1) {
                                unconnected.push({x: find.x, y: find.y-1});
                            }
                            if(map[find.x-1] && this.has(unconnected, find.x-1, find.y
                                                     && this.has(connected, find.x-1, find.y) === -1) === -1) {
                                unconnected.push({x: find.x-1, y: find.y});
                            }
                        }
                    } else if(dir === 2) {
                        dir++;
                        num++;
                        if(map[find.x][find.y+1] && this.has(connected, find.x, find.y+1) >= 0) {
                            done = true;
                            map[find.x][find.y+1].DNorth = true;
                            map[find.x][find.y].DSouth = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x ,y: find.y});
                            if(map[find.x][find.y-1] && this.has(unconnected, find.x, find.y-1) === -1
                                                     && this.has(connected, find.x, find.y-1) === -1) {
                                unconnected.push({x: find.x, y: find.y-1});
                            }
                            if(map[find.x+1] && this.has(unconnected, find.x+1, find.y) === -1
                                                     && this.has(connected, find.x+1, find.y) === -1) {
                                unconnected.push({x: find.x+1, y: find.y});
                            }
                            if(map[find.x-1] && this.has(unconnected, find.x-1, find.y) === -1
                                                     && this.has(connected, find.x-1, find.y) === -1) {
                                unconnected.push({x: find.x-1, y: find.y});
                            }
                        }
                    } else {
                        dir = 0;
                        num++;
                        if(map[find.x-1] && this.has(connected, find.x-1, find.y) >= 0) {
                            done = true;
                            map[find.x-1][find.y].DEast = true;
                            map[find.x][find.y].DWest = true;
                            unconnected.splice(index, 1);
                            connected.push({x: find.x ,y: find.y});
                            if(map[find.x][find.y+1] && this.has(unconnected, find.x, find.y+1) === -1
                                                     && this.has(connected, find.x, find.y+1) === -1) {
                                unconnected.push({x: find.x, y: find.y+1});
                            }
                            if(map[find.x][find.y-1] && this.has(unconnected, find.x, find.y-1) === -1
                                                     && this.has(connected, find.x, find.y-1) === -1) {
                                unconnected.push({x: find.x, y: find.y-1});
                            }
                            if(map[find.x+1] && this.has(unconnected, find.x+1, find.y) === -1
                                                     && this.has(connected, find.x+1, find.y) === -1) {
                                unconnected.push({x: find.x+1, y: find.y});
                            }
                        }
                    }
                    if(num > 4) {
                        unconnected.splice(index, 1);
                        if(unconnected.length > 0) {
                            index = Math.floor(Math.random() * unconnected.length);
                            find = unconnected[index];
                        } else {
                            done = true;
                        }
                    }
                }
            } else {
                let done = false;
                while(!done) {
                    get(10,5).isWall = true;
                    find = roomList[Math.floor(Math.random() * roomList.length)];
                    let dir = Math.floor(Math.random*4);
                    if(dir === 0) {
                        get(10,6).isWall = true;
                        done = true;
                        if(find.y > 0) {
                            map[find.x][find.y-1].DSouth = true;
                            map[find.x][find.y].DNorth = true;
                            get(10,10).isWall = true;
                        } else {
                            dir += 1;
                        }
                    } else if(dir === 1) {
                        get(10,7).isWall = true;
                        if(find.x < map.length-1) {
                            map[find.x+1][find.y].DWest = true;
                            map[find.x][find.y].DEast = true;
                            get(10,10).isWall = true;
                        } else {
                            dir += 1;
                        }
                    } else if(dir === 2) {
                        get(10,7).isWall = true;
                        if(find.y < map.length-1) {
                            map[find.x][find.y+1].DNorth = true;
                            map[find.x][find.y].DSouth = true;
                            get(10,10).isWall = true;
                        } else {
                            dir += 1;
                        }
                    } else {
                        get(10,8).isWall = true;
                        if(find.x > 0) {
                            map[find.x-1][find.y].DEast = true;
                            map[find.x][find.y].DWest = true;
                            get(10,10).isWall = true;
                        } else {
                            dir = 0;
                        }
                    }
                }
            }
        }
        draw(map);
    }

    // this makes sure the room is in the list. I was uncreative with the name.
function has(uncon, x: int, y: int): int {
        for(let w = 0; w < uncon.length; w++) {
            if(uncon.x === x && uncon.y === y) {
                return w;
            }
        }
        return -1;
    }

    // this draws the rooms. only handles simple room clusters, 3 tall, not 3 wide.
function draw(map) {
        /*for(let x = 0; x < map.length; x++) {
            for(let y = 0; y < map[0].length; y++) {
                get(map[x][y].x1, map[x][y].y1).owner = this.players[0];
                get(map[x][y].x1, map[x][y].y1).type = "generator";
                get(map[x][y].x1, map[x][y].y2).owner = this.players[0];
                get(map[x][y].x1, map[x][y].y2).type = "generator";
                get(map[x][y].x2, map[x][y].y1).owner = this.players[0];
                get(map[x][y].x2, map[x][y].y1).type = "generator";
                get(map[x][y].x2, map[x][y].y2).owner = this.players[0];
                get(map[x][y].x2, map[x][y].y2).type = "generator";
                if(map[x][y].y3 !== -1) {
                    get(map[x][y].x1, map[x][y].y3).owner = this.players[0];
                    get(map[x][y].x1, map[x][y].y3).type = "generator";
                    get(map[x][y].x2, map[x][y].y3).owner = this.players[0];
                    get(map[x][y].x2, map[x][y].y3).type = "generator";
                }
            }
        }*/
        for(let x = 0; x < map.length; x++) {
            for(let y = 0; y < map[0].length; y++) {
                let room = map[x][y];
                get(room.x1-1, room.y1-1).isWall = true;
                get(room.x2+1, room.y1-1).isWall = true;
                if(room.y3 === -1) {
                    get(room.x1-1, room.y2+1).isWall = true;
                    get(room.x2+1, room.y2+1).isWall = true;
                } else {
                    get(room.x1-1, room.y3+1).isWall = true;
                    get(room.x2+1, room.y3+1).isWall = true;
                }
                if(room.WNorth === true) {
                    get(room.x1, room.y1-1).isWall = true;
                    get(room.x2, room.y1-1).isWall = true;
                }
                if(room.WEast === true) {
                    if(room.y3 !== -1) {
                        get(room.x2+1, room.y1).isWall = true;
                        get(room.x2+1, room.y2).isWall = true;
                        get(room.x2+1, room.y3).isWall = true;
                    } else {
                        get(room.x2+1, room.y1).isWall = true;
                        get(room.x2+1, room.y2).isWall = true;
                    }
                }
                if(room.WSouth === true) {
                    if(room.y3 !== -1) {
                        get(room.x1, room.y3+1).isWall = true;
                        get(room.x2, room.y3+1).isWall = true;
                    } else {
                        get(room.x1, room.y2+1).isWall = true;
                        get(room.x2, room.y2+1).isWall = true;
                    }
                }
                if(room.WWest === true) {
                    if(room.y3 !== -1) {
                        get(room.x1-1, room.y1).isWall = true;
                        get(room.x1-1, room.y2).isWall = true;
                        get(room.x1-1, room.y3).isWall = true;
                    } else {
                        get(room.x1-1, room.y1).isWall = true;
                        get(room.x1-1, room.y2).isWall = true;
                    }
                }
            }
        }
        for(let x = 0; x < map.length; x++) {
            for(let y = 0; y < map[0].length; y++) {
                let room = map[x][y];
                // start drawing walls
                let shift = 0;
                if(room.DNorth === true) {
                    if(map[x][y-1]) {
                        map[x][y-1].DSouth = false;
                    }
                    shift = Math.floor(Math.random() * 2);
                    if(shift === 0) {
                        get(room.x1, room.y1-1).isWall = false;
                    } else {
                        get(room.x2, room.y1-1).isWall = false;
                    }
                }
                if(room.DEast === true) {
                    if(map[x+1]) {
                        map[x+1][y].DWest = false;
                    }
                    if(room.y3 === -1) {
                        shift = Math.floor(Math.random() * 2);
                        if(shift === 0) {
                            get(room.x2+1, room.y1).isWall = false;
                        } else {
                            get(room.x2+1, room.y2).isWall = false;
                        }
                    } else {
                        shift = Math.floor(Math.random() * 3);
                        if(shift === 0) {
                            get(room.x2+1, room.y1).isWall = false;
                        } else if(shift === 1) {
                            get(room.x2+1, room.y2).isWall = false;
                        } else {
                            get(room.x2+1, room.y3).isWall = false;
                        }
                    }
                }
                if(room.DSouth === true) {
                    if(map[x][y+1]) {
                        map[x][y+1].DNorth = false;
                    }
                    shift = Math.floor(Math.random() * 2);
                    if(room.y3 === -1) {
                        if(shift === 0) {
                            get(room.x1, room.y2+1).isWall = false;
                        } else {
                            get(room.x2, room.y2+1).isWall = false;
                        }
                    } else {
                        if(shift === 0) {
                            get(room.x1, room.y3+1).isWall = false;
                        } else {
                            get(room.x2, room.y3+1).isWall = false;
                        }
                    }
                }
                if(room.DWest === true) {
                    if(map[x-1]) {
                        map[x-1][y].DEast = false;
                    }
                    if(room.y3 === -1) {
                        shift = Math.floor(Math.random() * 2);
                        if(shift === 0) {
                            get(room.x1-1, room.y1).isWall = false;
                        } else {
                            get(room.x1-1, room.y2).isWall = false;
                        }
                    } else {
                        shift = Math.floor(Math.random() * 3);
                        if(shift === 0) {
                            get(room.x1-1, room.y1).isWall = false;
                        } else if(shift === 1) {
                            get(room.x1-1, room.y2).isWall = false;
                        } else {
                            get(room.x1-1, room.y3).isWall = false;
                        }
                    }
                }
            }
        }
    }

function get(x: int, y: int): Tile {
        return this.game.getTile(x, y);
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>

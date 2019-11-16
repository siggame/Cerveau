// WARNING: Here be Dragons
// This file is generated by Creer, do not modify it
// It basically sets up all the classes, interfaces, types, and what-not that
// we need for TypeScript to know the base classes, while allowing for minimal
// code for developers to be forced to fill out.

// tslint:disable:max-classes-per-file
// ^ because we need to build a bunch of base class wrappers here

// base game classes
import { BaseAI, BaseGame, BaseGameManager, BaseGameObject,
         BaseGameObjectFactory, BaseGameSettingsManager, BasePlayer,
         makeNamespace } from "~/core/game";

// mixins
import { ITiledPlayer, ITurnBasedPlayer, ITwoPlayerPlayer, mixTiled,
         mixTurnBased, mixTwoPlayer } from "~/core/game/mixins";

// extract game object constructor args
import { FirstArgumentFromConstructor } from "~/utils";

/**
 * The interface the Player for the Necrowar game
 * must implement from mixed in game logic.
 */
export interface IBaseNecrowarPlayer extends
    BasePlayer,
    ITwoPlayerPlayer,
    ITurnBasedPlayer,
    ITiledPlayer {
}

const base0 = {
    AI: BaseAI,
    Game: BaseGame,
    GameManager: BaseGameManager,
    GameObject: BaseGameObject,
    GameSettings: BaseGameSettingsManager,
};

const base1 = mixTwoPlayer(base0);
const base2 = mixTurnBased(base1);
const base3 = mixTiled(base2);

const mixed = base3;

/** The base AI class for the Necrowar game will mixin logic. */
class BaseNecrowarAI extends mixed.AI {}

/** The base Game class for the Necrowar game will mixin logic. */
class BaseNecrowarGame extends mixed.Game {}

/** The base GameManager class for the Necrowar game will mixin logic. */
class BaseNecrowarGameManager extends mixed.GameManager {}

/** The base GameObject class for the Necrowar game will mixin logic. */
class BaseNecrowarGameObject extends mixed.GameObject {}

/** The base GameSettings class for the Necrowar game will mixin logic. */
class BaseNecrowarGameSettings extends mixed.GameSettings {}

/** The Base classes that game classes build off of. */
export const BaseClasses = {
    AI: BaseNecrowarAI,
    Game: BaseNecrowarGame,
    GameManager: BaseNecrowarGameManager,
    GameObject: BaseNecrowarGameObject,
    GameSettings: BaseNecrowarGameSettings,
};

// Now all the base classes are created;
// so we can start importing/exporting the classes that need them.

/** All the possible properties for an GameObject. */
export interface IGameObjectProperties {
}

/** All the possible properties for an Player. */
export interface IPlayerProperties {
    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    clientType?: string;

    /**
     * The amount of gold this Player has.
     */
    gold?: number;

    /**
     * The amount of health remaining for this player's main unit.
     */
    health?: number;

    /**
     * The tile that the home base is located on.
     */
    homeBase?: Tile[];

    /**
     * If the player lost the game or not.
     */
    lost?: boolean;

    /**
     * The amount of mana this player has.
     */
    mana?: number;

    /**
     * The name of the player.
     */
    name?: string;

    /**
     * This player's opponent in the game.
     */
    opponent?: Player;

    /**
     * The reason why the player lost the game.
     */
    reasonLost?: string;

    /**
     * The reason why the player won the game.
     */
    reasonWon?: string;

    /**
     * All tiles that this player can build on and move workers on.
     */
    side?: Tile[];

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    timeRemaining?: number;

    /**
     * Every Tower owned by this player.
     */
    towers?: Tower[];

    /**
     * Every Unit owned by this Player.
     */
    units?: Unit[];

    /**
     * If the player won the game or not.
     */
    won?: boolean;

}

/** All the possible properties for an Tile. */
export interface ITileProperties {
    /**
     * The amount of corpses on this tile.
     */
    corpses?: number;

    /**
     * Whether or not the tile is a castle tile.
     */
    isCastle?: boolean;

    /**
     * Whether or not the tile is considered to be a gold mine or not.
     */
    isGoldMine?: boolean;

    /**
     * Whether or not the tile is considered grass or not (Workers can walk on
     * grass).
     */
    isGrass?: boolean;

    /**
     * Whether or not the tile is considered to be the island gold mine or not.
     */
    isIslandGoldMine?: boolean;

    /**
     * Whether or not the tile is considered a path or not (Units can walk on
     * paths).
     */
    isPath?: boolean;

    /**
     * Whether or not the tile is considered a river or not.
     */
    isRiver?: boolean;

    /**
     * Whether or not the tile is considered a tower or not.
     */
    isTower?: boolean;

    /**
     * Whether or not the tile is the unit spawn.
     */
    isUnitSpawn?: boolean;

    /**
     * Whether or not the tile can be moved on by workers.
     */
    isWall?: boolean;

    /**
     * Whether or not the tile is the worker spawn.
     */
    isWorkerSpawn?: boolean;

    /**
     * The amount of Ghouls on this tile.
     */
    numGhouls?: number;

    /**
     * The amount of Hounds on this tile.
     */
    numHounds?: number;

    /**
     * The amount of Zombies on this tile.
     */
    numZombies?: number;

    /**
     * Which player owns this tile, only applies to grass tiles for workers,
     * NULL otherwise.
     */
    owner?: Player;

    /**
     * The Tile to the 'East' of this one (x+1, y). Undefined if out of bounds
     * of the map.
     */
    tileEast?: Tile;

    /**
     * The Tile to the 'North' of this one (x, y-1). Undefined if out of bounds
     * of the map.
     */
    tileNorth?: Tile;

    /**
     * The Tile to the 'South' of this one (x, y+1). Undefined if out of bounds
     * of the map.
     */
    tileSouth?: Tile;

    /**
     * The Tile to the 'West' of this one (x-1, y). Undefined if out of bounds
     * of the map.
     */
    tileWest?: Tile;

    /**
     * The Tower on this Tile if present, otherwise undefined.
     */
    tower?: Tower;

    /**
     * The Unit on this Tile if present, otherwise undefined.
     */
    unit?: Unit;

    /**
     * The x (horizontal) position of this Tile.
     */
    x?: number;

    /**
     * The y (vertical) position of this Tile.
     */
    y?: number;

}

/**
 * Argument overrides for Tile's res function. If you return an object of this
 * interface from the invalidate functions, the value(s) you set will be used
 * in the actual function.
 */
export interface ITileResArgs {
    /**
     * Number of zombies to resurrect.
     */
    num?: number;
}

/**
 * Argument overrides for Tile's spawnUnit function. If you return an object of
 * this interface from the invalidate functions, the value(s) you set will be
 * used in the actual function.
 */
export interface ITileSpawnUnitArgs {
    /**
     * The title of the desired unit type.
     */
    title?: string;
}

/**
 * Argument overrides for Tile's spawnWorker function. If you return an object
 * of this interface from the invalidate functions, the value(s) you set will
 * be used in the actual function.
 */
export interface ITileSpawnWorkerArgs {
}

/** All the possible properties for an Tower. */
export interface ITowerProperties {
    /**
     * Whether this tower has attacked this turn or not.
     */
    attacked?: boolean;

    /**
     * How many turns are left before it can fire again.
     */
    cooldown?: number;

    /**
     * How much remaining health this tower has.
     */
    health?: number;

    /**
     * What type of tower this is (it's job).
     */
    job?: TowerJob;

    /**
     * The player that built / owns this tower.
     */
    owner?: Player;

    /**
     * The Tile this Tower is on.
     */
    tile?: Tile;

}

/**
 * Argument overrides for Tower's attack function. If you return an object of
 * this interface from the invalidate functions, the value(s) you set will be
 * used in the actual function.
 */
export interface ITowerAttackArgs {
    /**
     * The Tile to attack.
     */
    tile?: Tile;
}

/** All the possible properties for an TowerJob. */
export interface ITowerJobProperties {
    /**
     * Whether this tower type hits all of the units on a tile (true) or one at
     * a time (false).
     */
    allUnits?: boolean;

    /**
     * The amount of damage this type does per attack.
     */
    damage?: number;

    /**
     * How much does this type cost in gold.
     */
    goldCost?: number;

    /**
     * The amount of starting health this type has.
     */
    health?: number;

    /**
     * How much does this type cost in mana.
     */
    manaCost?: number;

    /**
     * The number of tiles this type can attack from.
     */
    range?: number;

    /**
     * The type title. 'arrow', 'aoe', 'ballista', 'cleansing', or 'castle'.
     */
    title?: "arrow" | "aoe" | "ballista" | "cleansing" | "castle";

    /**
     * How many turns have to take place between this type's attacks.
     */
    turnsBetweenAttacks?: number;

}

/** All the possible properties for an Unit. */
export interface IUnitProperties {
    /**
     * Whether or not this Unit has performed its action this turn (attack or
     * build).
     */
    acted?: boolean;

    /**
     * The remaining health of a unit.
     */
    health?: number;

    /**
     * The type of unit this is.
     */
    job?: UnitJob;

    /**
     * The number of moves this unit has left this turn.
     */
    moves?: number;

    /**
     * The Player that owns and can control this Unit.
     */
    owner?: Player;

    /**
     * The Tile this Unit is on.
     */
    tile?: Tile;

}

/**
 * Argument overrides for Unit's attack function. If you return an object of
 * this interface from the invalidate functions, the value(s) you set will be
 * used in the actual function.
 */
export interface IUnitAttackArgs {
    /**
     * The Tile to attack.
     */
    tile?: Tile;
}

/**
 * Argument overrides for Unit's build function. If you return an object of
 * this interface from the invalidate functions, the value(s) you set will be
 * used in the actual function.
 */
export interface IUnitBuildArgs {
    /**
     * The tower type to build, as a string.
     */
    title?: string;
}

/**
 * Argument overrides for Unit's fish function. If you return an object of this
 * interface from the invalidate functions, the value(s) you set will be used
 * in the actual function.
 */
export interface IUnitFishArgs {
    /**
     * The tile the unit will stand on as it fishes.
     */
    tile?: Tile;
}

/**
 * Argument overrides for Unit's mine function. If you return an object of this
 * interface from the invalidate functions, the value(s) you set will be used
 * in the actual function.
 */
export interface IUnitMineArgs {
    /**
     * The tile the mine is located on.
     */
    tile?: Tile;
}

/**
 * Argument overrides for Unit's move function. If you return an object of this
 * interface from the invalidate functions, the value(s) you set will be used
 * in the actual function.
 */
export interface IUnitMoveArgs {
    /**
     * The Tile this Unit should move to.
     */
    tile?: Tile;
}

/** All the possible properties for an UnitJob. */
export interface IUnitJobProperties {
    /**
     * The amount of damage this type does per attack.
     */
    damage?: number;

    /**
     * How much does this type cost in gold.
     */
    goldCost?: number;

    /**
     * The amount of starting health this type has.
     */
    health?: number;

    /**
     * How much does this type cost in mana.
     */
    manaCost?: number;

    /**
     * The number of moves this type can make per turn.
     */
    moves?: number;

    /**
     * How many of this type of unit can take up one tile.
     */
    perTile?: number;

    /**
     * Amount of tiles away this type has to be in order to be effective.
     */
    range?: number;

    /**
     * The type title. 'worker', 'zombie', 'ghoul', 'hound', 'abomination',
     * 'wraith' or 'horseman'.
     */
    title?: "worker" | "zombie" | "ghoul" | "hound" | "abomination" | "wraith" | "horseman";

}

export * from "./game-object";
export * from "./player";
export * from "./tile";
export * from "./tower";
export * from "./tower-job";
export * from "./unit";
export * from "./unit-job";
export * from "./game";
export * from "./game-manager";
export * from "./ai";

import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { Tower } from "./tower";
import { TowerJob } from "./tower-job";
import { Unit } from "./unit";
import { UnitJob } from "./unit-job";

import { AI } from "./ai";
import { NecrowarGame } from "./game";
import { NecrowarGameManager } from "./game-manager";
import { NecrowarGameSettingsManager } from "./game-settings";

/** The arguments used to construct a Tile */
export type TileArgs = FirstArgumentFromConstructor<typeof Tile>;

/** The arguments used to construct a Tower */
export type TowerArgs = FirstArgumentFromConstructor<typeof Tower>;

/** The arguments used to construct a TowerJob */
export type TowerJobArgs = FirstArgumentFromConstructor<typeof TowerJob>;

/** The arguments used to construct a Unit */
export type UnitArgs = FirstArgumentFromConstructor<typeof Unit>;

/** The arguments used to construct a UnitJob */
export type UnitJobArgs = FirstArgumentFromConstructor<typeof UnitJob>;

/**
 * The factory that **must** be used to create any game objects in
 * the Necrowar game.
 */
export class NecrowarGameObjectFactory extends BaseGameObjectFactory {
    /**
     * Creates a new Tile in the Game and tracks it for all players.
     *
     * @param args - Data about the Tile to set. Any keys matching a property
     * in the game object's class will be automatically set for you.
     * @returns A new Tile hooked up in the game and ready for you to use.
     */
    public tile<T extends TileArgs>(
        args: Readonly<T>,
    ): Tile & T {
        return this.createGameObject("Tile", Tile, args);
    }

    /**
     * Creates a new Tower in the Game and tracks it for all players.
     *
     * @param args - Data about the Tower to set. Any keys matching a property
     * in the game object's class will be automatically set for you.
     * @returns A new Tower hooked up in the game and ready for you to use.
     */
    public tower<T extends TowerArgs>(
        args: Readonly<T>,
    ): Tower & T {
        return this.createGameObject("Tower", Tower, args);
    }

    /**
     * Creates a new TowerJob in the Game and tracks it for all players.
     *
     * @param args - Data about the TowerJob to set. Any keys matching a
     * property in the game object's class will be automatically set for you.
     * @returns A new TowerJob hooked up in the game and ready for you to use.
     */
    public towerJob<T extends TowerJobArgs>(
        args: Readonly<T>,
    ): TowerJob & T {
        return this.createGameObject("TowerJob", TowerJob, args);
    }

    /**
     * Creates a new Unit in the Game and tracks it for all players.
     *
     * @param args - Data about the Unit to set. Any keys matching a property
     * in the game object's class will be automatically set for you.
     * @returns A new Unit hooked up in the game and ready for you to use.
     */
    public unit<T extends UnitArgs>(
        args: Readonly<T>,
    ): Unit & T {
        return this.createGameObject("Unit", Unit, args);
    }

    /**
     * Creates a new UnitJob in the Game and tracks it for all players.
     *
     * @param args - Data about the UnitJob to set. Any keys matching a
     * property in the game object's class will be automatically set for you.
     * @returns A new UnitJob hooked up in the game and ready for you to use.
     */
    public unitJob<T extends UnitJobArgs>(
        args: Readonly<T>,
    ): UnitJob & T {
        return this.createGameObject("UnitJob", UnitJob, args);
    }

}

/**
 * The shared namespace for Necrowar that is used to
 * initialize each game instance.
 */
export const Namespace = makeNamespace({
    AI,
    Game: NecrowarGame,
    GameManager: NecrowarGameManager,
    GameObjectFactory: NecrowarGameObjectFactory,
    GameSettingsManager: NecrowarGameSettingsManager,
    Player,

    // These are generated metadata that allow delta-merging values from
    // clients.
    // They are never intended to be directly interfaced with outside of the
    // Cerveau core developers.
    gameName: "Necrowar",
    gameSettingsManager: new NecrowarGameSettingsManager(),
    gameObjectsSchema: {
        AI: {
            attributes: {
            },
            functions: {
                runTurn: {
                    args: [
                    ],
                    returns: {
                        typeName: "boolean",
                    },
                },
            },
        },
        Game: {
            attributes: {
                TowerJobs: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: TowerJob,
                        nullable: false,
                    },
                },
                UnitJobs: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: UnitJob,
                        nullable: false,
                    },
                },
                currentPlayer: {
                    typeName: "gameObject",
                    gameObjectClass: Player,
                    nullable: false,
                },
                currentTurn: {
                    typeName: "int",
                },
                gameObjects: {
                    typeName: "dictionary",
                    keyType: {
                        typeName: "string",
                    },
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: GameObject,
                        nullable: false,
                    },
                },
                goldIncomePerUnit: {
                    typeName: "int",
                },
                islandIncomePerUnit: {
                    typeName: "int",
                },
                manaIncomePerUnit: {
                    typeName: "int",
                },
                mapHeight: {
                    typeName: "int",
                },
                mapWidth: {
                    typeName: "int",
                },
                maxTurns: {
                    typeName: "int",
                },
                players: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Player,
                        nullable: false,
                    },
                },
                riverPhase: {
                    typeName: "int",
                },
                session: {
                    typeName: "string",
                },
                tiles: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Tile,
                        nullable: false,
                    },
                },
                timeAddedPerTurn: {
                    typeName: "int",
                },
                towers: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Tower,
                        nullable: false,
                    },
                },
                units: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Unit,
                        nullable: false,
                    },
                },
            },
            functions: {
            },
        },
        GameObject: {
            attributes: {
                gameObjectName: {
                    typeName: "string",
                },
                id: {
                    typeName: "string",
                },
                logs: {
                    typeName: "list",
                    valueType: {
                        typeName: "string",
                    },
                },
            },
            functions: {
                log: {
                    args: [
                        {
                            argName: "message",
                            typeName: "string",
                        },
                    ],
                    returns: {
                        typeName: "void",
                    },
                },
            },
        },
        Player: {
            parentClassName: "GameObject",
            attributes: {
                clientType: {
                    typeName: "string",
                },
                gold: {
                    typeName: "int",
                },
                health: {
                    typeName: "int",
                },
                homeBase: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Tile,
                        nullable: false,
                    },
                },
                lost: {
                    typeName: "boolean",
                },
                mana: {
                    typeName: "int",
                },
                name: {
                    typeName: "string",
                },
                opponent: {
                    typeName: "gameObject",
                    gameObjectClass: Player,
                    nullable: false,
                },
                reasonLost: {
                    typeName: "string",
                },
                reasonWon: {
                    typeName: "string",
                },
                side: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Tile,
                        nullable: false,
                    },
                },
                timeRemaining: {
                    typeName: "float",
                },
                towers: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Tower,
                        nullable: false,
                    },
                },
                units: {
                    typeName: "list",
                    valueType: {
                        typeName: "gameObject",
                        gameObjectClass: Unit,
                        nullable: false,
                    },
                },
                won: {
                    typeName: "boolean",
                },
            },
            functions: {
            },
        },
        Tile: {
            parentClassName: "GameObject",
            attributes: {
                corpses: {
                    typeName: "int",
                },
                isCastle: {
                    typeName: "boolean",
                },
                isGoldMine: {
                    typeName: "boolean",
                },
                isGrass: {
                    typeName: "boolean",
                },
                isIslandGoldMine: {
                    typeName: "boolean",
                },
                isPath: {
                    typeName: "boolean",
                },
                isRiver: {
                    typeName: "boolean",
                },
                isTower: {
                    typeName: "boolean",
                },
                isUnitSpawn: {
                    typeName: "boolean",
                },
                isWall: {
                    typeName: "boolean",
                },
                isWorkerSpawn: {
                    typeName: "boolean",
                },
                numGhouls: {
                    typeName: "int",
                },
                numHounds: {
                    typeName: "int",
                },
                numZombies: {
                    typeName: "int",
                },
                owner: {
                    typeName: "gameObject",
                    gameObjectClass: Player,
                    nullable: true,
                },
                tileEast: {
                    typeName: "gameObject",
                    gameObjectClass: Tile,
                    nullable: true,
                },
                tileNorth: {
                    typeName: "gameObject",
                    gameObjectClass: Tile,
                    nullable: true,
                },
                tileSouth: {
                    typeName: "gameObject",
                    gameObjectClass: Tile,
                    nullable: true,
                },
                tileWest: {
                    typeName: "gameObject",
                    gameObjectClass: Tile,
                    nullable: true,
                },
                tower: {
                    typeName: "gameObject",
                    gameObjectClass: Tower,
                    nullable: true,
                },
                unit: {
                    typeName: "gameObject",
                    gameObjectClass: Unit,
                    nullable: true,
                },
                x: {
                    typeName: "int",
                },
                y: {
                    typeName: "int",
                },
            },
            functions: {
                res: {
                    args: [
                        {
                            argName: "num",
                            typeName: "int",
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
                spawnUnit: {
                    args: [
                        {
                            argName: "title",
                            typeName: "string",
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
                spawnWorker: {
                    args: [
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
            },
        },
        Tower: {
            parentClassName: "GameObject",
            attributes: {
                attacked: {
                    typeName: "boolean",
                },
                cooldown: {
                    typeName: "int",
                },
                health: {
                    typeName: "int",
                },
                job: {
                    typeName: "gameObject",
                    gameObjectClass: TowerJob,
                    nullable: false,
                },
                owner: {
                    typeName: "gameObject",
                    gameObjectClass: Player,
                    nullable: true,
                },
                tile: {
                    typeName: "gameObject",
                    gameObjectClass: Tile,
                    nullable: false,
                },
            },
            functions: {
                attack: {
                    args: [
                        {
                            argName: "tile",
                            typeName: "gameObject",
                            gameObjectClass: Tile,
                            nullable: false,
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
            },
        },
        TowerJob: {
            parentClassName: "GameObject",
            attributes: {
                allUnits: {
                    typeName: "boolean",
                },
                damage: {
                    typeName: "int",
                },
                goldCost: {
                    typeName: "int",
                },
                health: {
                    typeName: "int",
                },
                manaCost: {
                    typeName: "int",
                },
                range: {
                    typeName: "int",
                },
                title: {
                    typeName: "string",
                    defaultValue: "arrow",
                    literals: ["arrow", "aoe", "ballista", "cleansing", "castle"],
                },
                turnsBetweenAttacks: {
                    typeName: "int",
                },
            },
            functions: {
            },
        },
        Unit: {
            parentClassName: "GameObject",
            attributes: {
                acted: {
                    typeName: "boolean",
                },
                health: {
                    typeName: "int",
                },
                job: {
                    typeName: "gameObject",
                    gameObjectClass: UnitJob,
                    nullable: false,
                },
                moves: {
                    typeName: "int",
                },
                owner: {
                    typeName: "gameObject",
                    gameObjectClass: Player,
                    nullable: true,
                },
                tile: {
                    typeName: "gameObject",
                    gameObjectClass: Tile,
                    nullable: true,
                },
            },
            functions: {
                attack: {
                    args: [
                        {
                            argName: "tile",
                            typeName: "gameObject",
                            gameObjectClass: Tile,
                            nullable: false,
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
                build: {
                    args: [
                        {
                            argName: "title",
                            typeName: "string",
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
                fish: {
                    args: [
                        {
                            argName: "tile",
                            typeName: "gameObject",
                            gameObjectClass: Tile,
                            nullable: false,
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
                mine: {
                    args: [
                        {
                            argName: "tile",
                            typeName: "gameObject",
                            gameObjectClass: Tile,
                            nullable: false,
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
                move: {
                    args: [
                        {
                            argName: "tile",
                            typeName: "gameObject",
                            gameObjectClass: Tile,
                            nullable: false,
                        },
                    ],
                    invalidValue: false,
                    returns: {
                        typeName: "boolean",
                    },
                },
            },
        },
        UnitJob: {
            parentClassName: "GameObject",
            attributes: {
                damage: {
                    typeName: "int",
                },
                goldCost: {
                    typeName: "int",
                },
                health: {
                    typeName: "int",
                },
                manaCost: {
                    typeName: "int",
                },
                moves: {
                    typeName: "int",
                },
                perTile: {
                    typeName: "int",
                },
                range: {
                    typeName: "int",
                },
                title: {
                    typeName: "string",
                    defaultValue: "worker",
                    literals: ["worker", "zombie", "ghoul", "hound", "abomination", "wraith", "horseman"],
                },
            },
            functions: {
            },
        },
    },
});
import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { PiratesGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { PiratesGameSettingsManager } from "./game-settings";
import { Player } from "./player";
import { Port } from "./port";
import { Tile } from "./tile";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>

import { MutableRequired } from "~/utils";
import * as BallGens from "./game-ball-gen";
// Generate some meta-balls for the islands
const ballGens = Object.values(BallGens);

// players and tiles are pre-generated in the base constructor, but we'll
// need to mutate some of their properties in our constructor.
// However this will occur before clients get it so it will _appear_ constant
// to them, so it's all good.
// This is basically the only place forcing mutations is safe however.

/** A Player that can be changed before the game starts. */
type MutablePlayer = MutableRequired<Player>;

/** A Tile that can be changed before the game starts. */
type MutableTile = MutableRequired<Tile>;

// <<-- /Creer-Merge: imports -->>

/**
 * Steal from merchants and become the most infamous pirate.
 */
export class PiratesGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: PiratesGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * The rate buried gold increases each turn.
     */
    public buryInterestRate!: number;

    /**
     * How much gold it costs to construct a single crew.
     */
    public crewCost!: number;

    /**
     * How much damage crew deal to each other.
     */
    public crewDamage!: number;

    /**
     * The maximum amount of health a crew member can have.
     */
    public crewHealth!: number;

    /**
     * The number of moves Units with only crew are given each turn.
     */
    public crewMoves!: number;

    /**
     * A crew's attack range. Range is circular.
     */
    public crewRange!: number;

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
     * How much health a Unit recovers when they rest.
     */
    public healFactor!: number;

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
     * How much gold merchant Ports get each turn.
     */
    public merchantGoldRate!: number;

    /**
     * When a merchant ship spawns, the amount of additional gold it has
     * relative to the Port's investment.
     */
    public merchantInterestRate!: number;

    /**
     * The Euclidean distance buried gold must be from the Player's Port to
     * accumulate interest.
     */
    public minInterestDistance!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * Every Port in the game. Merchant ports have owner set to null.
     */
    public ports!: Port[];

    /**
     * How far a Unit can be from a Port to rest. Range is circular.
     */
    public restRange!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * How much gold it costs to construct a ship.
     */
    public shipCost!: number;

    /**
     * How much damage ships deal to ships and ports.
     */
    public shipDamage!: number;

    /**
     * The maximum amount of health a ship can have.
     */
    public shipHealth!: number;

    /**
     * The number of moves Units with ships are given each turn.
     */
    public shipMoves!: number;

    /**
     * A ship's attack range. Range is circular.
     */
    public shipRange!: number;

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
     * Every Unit in the game. Merchant units have targetPort set to a port.
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
        protected settingsManager: PiratesGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        this.generateMap();

        // Give players their starting gold
        const startingGold = this.settings.startingGold || 3 * this.crewCost + 3 * this.shipCost;
        for (const player of this.players) {
            player.gold = startingGold;
        }

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

    /** Generates the map at the start of the game. */
    private generateMap(): void {
        let failed = true;

        // Make sure there's enough tiles for all the ports to spawn on
        while (failed) {
            failed = false;

            // Remove any current ports
            for (const p of this.ports) {
                (p.tile as MutableTile).port = undefined;
            }

            this.ports.length = 0;

            // Fill the map
            for (const tile of this.tiles) {
                (tile as MutableTile).type = "water";
            }

            // Pick a meta-ball generator
            const ballGen = this.manager.random.element(ballGens)!;
            const ballInfo = ballGen(this.mapWidth, this.mapHeight, () => this.manager.random.float());

            // Generate the islands from the meta-balls
            for (let x = 0; x < this.mapWidth / 2; x++) {
                for (let y = 0; y < this.mapHeight; y++) {
                    const tile = this.getTile(x, y)!;
                    let energy = 0;
                    for (const ball of ballInfo.balls) {
                        const r = ball.r;
                        const dist = Math.sqrt(Math.pow(ball.x - x, 2) + Math.pow(ball.y - y, 2));
                        const d = Math.max(0.0001, Math.pow(dist, ballInfo.gooeyness)); // Can't be 0
                        energy += r / d;
                    }

                    if (energy >= ballInfo.threshold) {
                        (tile as MutableTile).type = "land";
                        if (energy >= ballInfo.grassThreshold) {
                            tile.decoration = true;
                        }
                    }
                    else {
                        (tile as MutableTile).type = "water";
                        if (energy <= ballInfo.seaThreshold) {
                            tile.decoration = true;
                        }
                    }
                }
            }

            // Make sure there's only one main body of water, no extra smaller ones
            this.fillLakes();

            // Find all possible port locations
            const portTiles = this.tiles.filter((t) => {
                // Check type
                if (t.type !== "water") {
                    return false;
                }

                // Make sure it's not too close to the center
                if (t.x > this.mapWidth / 4) {
                    return false;
                }

                // Check neighbors - make sure there's land and enough water
                let land = false;
                let water = 0;
                if (t.tileNorth && t.tileNorth.type === "land") {
                    land = true;
                }
                else if (t.tileNorth) {
                    water += 1;
                    if (t.tileNorth.tileEast && t.tileNorth.tileEast.type === "water") {
                        water += 1;
                    }
                    if (t.tileNorth.tileWest && t.tileNorth.tileWest.type === "water") {
                        water += 1;
                    }
                }
                if (t.tileEast && t.tileEast.type === "land") {
                    land = true;
                }
                else if (t.tileEast) {
                    water += 1;
                }
                if (t.tileSouth && t.tileSouth.type === "land") {
                    land = true;
                }
                else if (t.tileSouth) {
                    water += 1;
                    if (t.tileSouth.tileEast && t.tileSouth.tileEast.type === "water") {
                        water += 1;
                    }
                    if (t.tileSouth.tileWest && t.tileSouth.tileWest.type === "water") {
                        water += 1;
                    }
                }
                if (t.tileWest && t.tileWest.type === "land") {
                    land = true;
                }
                else if (t.tileWest) {
                    water += 1;
                }

                return land && water > 5;
            });

            if (portTiles.length === 0) {
                failed = true;
                continue;
            }

            // Place the starting port
            const selected = this.manager.random.pop(portTiles)!;
            const port = this.manager.create.Port({
                owner: this.players[0],
                tile: selected,
                gold: this.shipCost,
            });

            (port.tile as MutableTile).port = port;
            (port.owner! as MutablePlayer).port = port;
            this.ports.push(port);

            // Find merchant port locations
            const merchantTiles = portTiles.filter(
                (t) => Math.pow(t.x - port.tile.x, 2) + Math.pow(t.y - port.tile.y, 2) > 9,
            );
            if (merchantTiles.length === 0) {
                failed = true;
                continue;
            }

            // Place merchant port
            const merchantTile = this.manager.random.pop(merchantTiles)!;
            const merchantPort = this.manager.create.Port({
                tile: merchantTile,
            });

            // Add the port to the game
            (merchantTile as MutableTile).port = merchantPort;
            this.ports.push(merchantPort);
        }

        // Mirror the map
        for (let x = 0; x < this.mapWidth / 2; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                const orig = this.getTile(x, y)!;
                const target = this.getTile(this.mapWidth - x - 1, this.mapHeight - y - 1)!;

                // Copy tile data
                (target as MutableTile).type = orig.type;
                target.decoration = orig.decoration;

                // Clone ports
                if (orig.port) {
                    const port = this.manager.create.Port({
                        tile: target,
                        owner: orig.port.owner && orig.port.owner.opponent,
                        gold: orig.port.gold,
                    });
                    (target as MutableTile).port = port;
                    this.ports.push(port);

                    if (port.owner) {
                        (port.owner as MutablePlayer).port = port;
                    }
                    else {
                        // Stagger merchant ship spawning
                        port.gold += this.merchantGoldRate;
                    }
                }
            }
        }
    }

    /**
     * Fills in lakes around the map.
     * This is part of the game's map generation.
     */
    private fillLakes(): void {
        // Find the largest body of water and fill the rest
        const checked = new Set<Tile>();
        const bodies: Tile[][] = [];
        for (const tile of this.tiles) {
            // Only looking for bodies of water
            if (tile.type !== "water") {
                continue;
            }

            // Don't check the same body twice
            if (checked.has(tile)) {
                continue;
            }

            // Use BFS(ish) to find all the connected water
            const body: Tile[] = [];
            const open: Tile[] = [ tile ];
            while (open.length > 0) {
                const cur = open.shift()!;

                // Only add water to the body
                if (cur.type !== "water") {
                    continue;
                }

                // Only check for bodies on half of the map
                if (cur.x >= this.mapWidth / 2) {
                    continue;
                }

                // Make sure this tile only gets checked once
                if (checked.has(cur)) {
                    continue;
                }
                checked.add(cur);

                // Add it to the current body of water
                body.push(cur);

                // Add its neighbors to get checked
                open.push(...cur.getNeighbors());
            }

            // Add the current body to the list of bodies
            bodies.push(body);
        }

        // Sort bodies by size (largest first), then remove the first element
        bodies.sort((a, b) => b.length - a.length);
        bodies.shift();

        // Fill the rest of the bodies
        for (const body of bodies) {
            for (const tile of body) {
                (tile as MutableTile).type = "land";
                tile.decoration = false;
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

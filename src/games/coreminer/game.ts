import { BaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Bomb } from "./bomb";
import { CoreminerGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { CoreminerGameSettingsManager } from "./game-settings";
import { Miner } from "./miner";
import { Player } from "./player";
import { Tile } from "./tile";
import { Upgrade } from "./upgrade";

// <<-- Creer-Merge: imports -->>
import { Mutable } from "~/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * Mine resources to obtain more value than your opponent.
 */
export class CoreminerGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it. */
    public readonly manager!: CoreminerGameManager;

    /** The settings used to initialize the game, as set by players. */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * The monetary price of a bomb when bought or sold.
     */
    public readonly bombPrice!: number;

    /**
     * The amount of cargo space taken up by a Bomb.
     */
    public readonly bombSize!: number;

    /**
     * Every Bomb in the game.
     */
    public bombs!: Bomb[];

    /**
     * The monetary price of building materials when bought.
     */
    public readonly buildingMaterialPrice!: number;

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
     * The monetary price of dirt when bought or sold.
     */
    public readonly dirtPrice!: number;

    /**
     * The amount of damage taken per Tile fallen.
     */
    public readonly fallDamage!: number;

    /**
     * The amount of extra damage taken for falling while carrying a large
     * amount of cargo.
     */
    public readonly fallWeightDamage!: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     */
    public gameObjects!: { [id: string]: GameObject };

    /**
     * The amount of building material required to build a ladder.
     */
    public readonly ladderCost!: number;

    /**
     * The amount of mining power needed to remove a ladder from a Tile.
     */
    public readonly ladderHealth!: number;

    /**
     * The amount deemed as a large amount of cargo.
     */
    public readonly largeCargoSize!: number;

    /**
     * The amount deemed as a large amount of material.
     */
    public readonly largeMaterialSize!: number;

    /**
     * The number of Tiles in the map along the y (vertical) axis.
     */
    public readonly mapHeight!: number;

    /**
     * The number of Tiles in the map along the x (horizontal) axis.
     */
    public readonly mapWidth!: number;

    /**
     * The maximum amount of shielding possible on a Tile.
     */
    public readonly maxShielding!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * The highest upgrade level allowed on a Miner.
     */
    public readonly maxUpgradeLevel!: number;

    /**
     * Every Miner in the game.
     */
    public miners!: Miner[];

    /**
     * The amount of money awarded when ore is dumped in the base and sold.
     */
    public readonly orePrice!: number;

    /**
     * The amount of value awarded when ore is dumped in the base and sold.
     */
    public readonly oreValue!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The amount of building material required to shield a Tile.
     */
    public readonly shieldCost!: number;

    /**
     * The amount of mining power needed to remove one unit of shielding off
     * a Tile.
     */
    public readonly shieldHealth!: number;

    /**
     * The monetary price of spawning a Miner.
     */
    public readonly spawnPrice!: number;

    /**
     * The amount of damage taken when suffocating inside a filled Tile.
     */
    public readonly suffocationDamage!: number;

    /**
     * The amount of extra damage taken for suffocating under a large amount of
     * material.
     */
    public readonly suffocationWeightDamage!: number;

    /**
     * The amount of building material required to build a support.
     */
    public readonly supportCost!: number;

    /**
     * The amount of mining power needed to remove a support from a Tile.
     */
    public readonly supportHealth!: number;

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
     * The cost to upgrade a Miner.
     */
    public readonly upgradePrice!: number;

    /**
     * Every Upgrade for a Miner in the game.
     */
    public upgrades!: Upgrade[];

    /**
     * The amount of victory points (value) required to win.
     */
    public readonly victoryAmount!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    /**
     * Every Tile about to fall in the game.
     */
    public fallingTiles!: Tile[];

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: CoreminerGameSettingsManager,
        required: Readonly<BaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>
        this.createJobs();

        this.createMap();

        for (const player of this.players) {
            player.money = this.spawnPrice * 3;
        }

        // Strangely, this starts undefined
        this.fallingTiles = [];
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

    /** Creates all the jobs in the game. */
    private createJobs(): void {
        let job;

        job = this.manager.create.job({
            title: "miner",
            health: [],
            moves: [],
            miningPower: [],
            cargoCapacity: [],
        });
        job.health.push(25, 50, 75, 100);
        job.moves.push(2, 3, 4, 5);
        job.miningPower.push(50, 100, 150, 200);
        job.cargoCapacity.push(250, 500, 750, 1000);
        this.jobs.push(job);

        job = this.manager.create.job({
            title: "bomb",
            health: [],
            moves: [],
            miningPower: [],
            cargoCapacity: [],
        });
        this.jobs.push(job);
    }

    /** Create the game map. */
    private createMap(): void {
        /**
         * Utility function to get a mutable tile at a given (x, y).
         *
         * NOTE: This is a closure function. It is a function we create while
         * running createMap(), and it wraps the current scope, so that `this`
         * refers to the Game running `createMap()`, even though the game was
         * not passed.
         *
         * @param x - The x coordinate. If off map throws an Error.
         * @param y - The y coordinate. If off map throws an Error.
         * @returns A Tile that is mutable JUST for this function scope.
         */
        const getMutableTile = (x: number, y: number): Mutable<Tile> => {
            const tile = this.getTile(x, y);

            if (!tile) {
                throw new Error(
                    `Cannot get a tile for map generation at (${x}, ${y})`,
                );
            }

            return tile;
        };

        // Define half of map for ease of use
        const side = Math.round(this.mapWidth / 2);

        // Define number of dirt layers
        const layerCount = 4;

        // At different y values, tile.dirt has different values - these are called layers
        // The tiles at y = 0 are not in a layer
        // Define the layer depths - each number n means layer occurs when y < n
        // Earlier layers are prioritized in generation
        // We have 4 layers
        const mapSlice = this.mapHeight / 100;
        const layerDepths = [15, 40, 75, 100].map((x) => x * mapSlice);

        // Define the number of rows per layer
        const layerHeights = [layerDepths[0] - 1];
        for (let i = 1; i < layerCount; i++) {
            let aboveRows = 0;

            layerHeights.forEach((h) => {
                aboveRows += h;
            });

            const height = layerDepths[i] - aboveRows - 1;
            layerHeights.push(height);
        }

        // Define an array that holds each row of dirt Tiles
        const rows: Tile[][] = Array<Tile[]>(this.mapHeight - 1);

        for (let i = 0; i < rows.length; i++) {
            rows[i] = [];
        }

        // Define amount of dirt per Tile in each layer
        const layerDirtDensities = [25, 50, 100, 200];

        // Define amount of ore per ore Tile per layer
        // Should be less than dirt density in respective layer
        const layerOreDensities = [10, 25, 50, 125];

        // Generate layer map for one side
        // Also set one Player's base
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < side; x++) {
                const tile = getMutableTile(x, y);

                if (y === 0) {
                    // Surface layer
                    tile.dirt = 0;
                    tile.ore = 0;

                    if (x === 0) {
                        tile.isBase = true;
                        tile.owner = this.players[0];
                        this.players[0].baseTile = tile as Tile;
                    }
                } else {
                    // Dirt layers
                    for (let i = 0; i < layerCount; i++) {
                        if (y < layerDepths[i]) {
                            tile.dirt = layerDirtDensities[i];
                            rows[y - 1].push(tile as Tile);
                            break;
                        }
                    }
                }
            }
        }

        // Define an array that groups each row by layer
        const layerRows: Tile[][][] = Array<Tile[][]>(layerCount);

        for (let i = 0; i < layerCount; i++) {
            layerRows[i] = [];
        }

        for (let y = 0; y < rows.length; y++) {
            let tileLayer = 0;
            for (let i = 0; i < layerDepths.length; i++) {
                if (y < layerDepths[i] - 1) {
                    tileLayer = i;
                    break;
                }
            }
            layerRows[tileLayer].push(rows[y]);
        }

        /**
         * Utility function to get a biased random integer.
         * Used to help randomly populate the map with ore.
         * Bias is used to make more ore spawn towards the middle of the map.
         *
         * @param influence - The amount of influence given to the bias (0-1).
         * @param min - The minimum value for the RNG.
         * @param max - The maximum (excluded) value for the RNG.
         * @returns An integer number that is biased in some way towards the map center.
         */
        const getBiasedInt = (
            influence: number,
            min = 0,
            max: number = side,
        ): number => {
            const bias = max - 1;

            const rnd = this.manager.random.int(max, min);
            const mix = this.manager.random.float(1, 0) * influence;
            const value = rnd * (1 - mix) + bias * mix;

            return Math.floor(value);
        };

        // Define number of ore deposits per layer (on one side)
        // Numbers are percentage of tiles in the layer with ore
        // Must be between 0 and 1 (0% ore to 100% ore)
        const layerOreCounts: number[] = [0.07, 0.1, 0.15, 0.2].map((c, i) =>
            Math.round(c * layerRows[i].length * side),
        );

        // Define influence values for biases per layer
        // Must be between 0 and 1 (weak to strong)
        const layerInfluences = [0.1, 0.2, 0.4, 0.8];

        // Generate cache of ore in the center of the map
        const cacheLayer = layerRows[layerRows.length - 1];
        const cacheOreCount = 10;
        const cacheOreDensity = 250;
        const cacheWidth = 0.9; // Only spawns where x >= 100*cacheWidth% of the side
        const cacheXBias = 1;
        const cacheYBias = 0.8;

        for (let c = cacheOreCount; c > 0; c--) {
            const randomY = getBiasedInt(cacheYBias, 0, cacheLayer.length);
            const cacheMinX = Math.floor(
                cacheLayer[randomY].length * cacheWidth,
            );
            const randomX = getBiasedInt(
                cacheXBias,
                cacheMinX,
                cacheLayer[randomY].length,
            );

            cacheLayer[randomY][randomX].ore = cacheOreDensity;
            cacheLayer[randomY][randomX].dirt = 0;

            cacheLayer[randomY].splice(randomX, 1);

            if (cacheLayer[randomY].length === 0) {
                cacheLayer.splice(randomY, 1);
            }
        }

        // Populate each layer with ore.
        layerRows.forEach((layer, i) => {
            for (let c = layerOreCounts[i]; c > 0; c--) {
                const randomY = this.manager.random.int(layer.length, 0);
                const randomX = getBiasedInt(
                    layerInfluences[i],
                    0,
                    layerRows[i][randomY].length,
                );

                const chosenTile = layerRows[i][randomY][randomX];
                const oreAmount = layerOreDensities[i];

                chosenTile.ore = oreAmount;
                chosenTile.dirt = 0;

                layerRows[i][randomY].splice(randomX, 1);

                if (layerRows[i][randomY].length === 0) {
                    layerRows[i].splice(randomY, 1);
                }
            }
        });

        // Mirror the map
        for (let x = 0; x < side; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                const tile = getMutableTile(x, y);
                const oppositeTile = getMutableTile(this.mapWidth - x - 1, y);

                this.players[0].side.push(tile as Tile);
                this.players[1].side.push(oppositeTile as Tile);

                if (tile.owner !== undefined) {
                    oppositeTile.owner = tile.owner.opponent;
                }

                if (tile.isBase) {
                    oppositeTile.isBase = true;
                    this.players[1].baseTile = oppositeTile as Tile;
                }
                oppositeTile.dirt = tile.dirt;
                oppositeTile.ore = tile.ore;
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

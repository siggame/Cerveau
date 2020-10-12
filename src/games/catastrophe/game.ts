import { BaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { CatastropheGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { CatastropheGameSettingsManager } from "./game-settings";
import { Job } from "./job";
import { Player } from "./player";
import { Structure } from "./structure";
import { Tile } from "./tile";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
import { arrayHasElements, Mutable, removeElements } from "~/utils";
import { jobStats } from "./jobs-stats";

/** A player that we can mutate before the game begins. */
type MutablePlayer = Mutable<Player>;
// <<-- /Creer-Merge: imports -->>

/**
 * Convert as many humans to as you can to survive in this post-apocalyptic
 * wasteland.
 */
export class CatastropheGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it. */
    public readonly manager!: CatastropheGameManager;

    /** The settings used to initialize the game, as set by players. */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * The multiplier for the amount of energy regenerated when resting in a
     * shelter with the cat overlord.
     */
    public readonly catEnergyMult!: number;

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
     * used by the server and client to easily refer to the game objects via ID.
     */
    public gameObjects!: { [id: string]: GameObject };

    /**
     * The amount of turns it takes for a Tile that was just harvested to grow
     * food again.
     */
    public readonly harvestCooldown!: number;

    /**
     * All the Jobs that Units can have in the game.
     */
    public jobs!: Job[];

    /**
     * The amount that the harvest rate is lowered each season.
     */
    public readonly lowerHarvestAmount!: number;

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
     * The multiplier for the cost of actions when performing them in range of
     * a monument. Does not effect pickup cost.
     */
    public readonly monumentCostMult!: number;

    /**
     * The number of materials in a monument.
     */
    public readonly monumentMaterials!: number;

    /**
     * The number of materials in a neutral Structure.
     */
    public readonly neutralMaterials!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * The number of materials in a shelter.
     */
    public readonly shelterMaterials!: number;

    /**
     * The amount of food Players start with.
     */
    public readonly startingFood!: number;

    /**
     * The multiplier for the amount of energy regenerated when resting while
     * starving.
     */
    public readonly starvingEnergyMult!: number;

    /**
     * Every Structure in the game.
     */
    public structures!: Structure[];

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
     * After a food tile is harvested, the number of turns before it can be
     * harvested again.
     */
    public readonly turnsBetweenHarvests!: number;

    /**
     * The number of turns between fresh humans being spawned on the road.
     */
    public readonly turnsToCreateHuman!: number;

    /**
     * The number of turns before the harvest rate is lowered (length of each
     * season basically).
     */
    public readonly turnsToLowerHarvest!: number;

    /**
     * Every Unit in the game.
     */
    public units!: Unit[];

    /**
     * The number of materials in a wall.
     */
    public readonly wallMaterials!: number;

    // <<-- Creer-Merge: attributes -->>

    /**
     * New structures created but not yet inserted into the structures array.
     */
    public readonly newStructures: Structure[] = [];

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager - The manager that holds initial settings.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        protected settingsManager: CatastropheGameSettingsManager,
        required: Readonly<BaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        for (const title of Object.keys(jobStats).sort()) {
            const stats = jobStats[title];
            this.jobs.push(
                this.manager.create.job({
                    title: title as Job["title"],
                    ...stats,
                }),
            );
        }

        // Generate the map and units
        this.generateMap();

        // Properly add all new structures
        for (const structure of this.newStructures) {
            this.structures.push(structure);
            if (structure.owner) {
                structure.owner.structures.push(structure);
            }
        }
        this.newStructures.length = 0;

        // Calculate player upkeeps
        for (const player of this.players) {
            player.upkeep = 0;
            for (const unit of player.units) {
                player.upkeep += unit.job.upkeep;
            }

            player.food = 50; // starting food
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Gets the cost of a given structure type.
     *
     * @param structureType - The type of the structure.
     * @returns A number of its cost.
     */
    public getStructureCost(structureType: Structure["type"]): number {
        switch (structureType) {
            case "neutral":
                return this.neutralMaterials;
            case "road":
                return 0;
            case "wall":
                return this.wallMaterials;
            case "shelter":
                return this.shelterMaterials;
            case "monument":
                return this.monumentMaterials;
        }
    }

    /**
     * Gets the range of a Structure by its type.
     *
     * @param structureType - The type of the structure to get for.
     * @returns A number representing its range.
     */
    public getStructureRange(structureType: Structure["type"]): number {
        switch (structureType) {
            case "neutral":
            case "road":
            case "wall":
                return 0;
            case "shelter":
                return 1;
            case "monument":
                return 3;
        }
    }

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

    /**
     * Generates the map and places the resources, players, and starting units.
     */
    private generateMap(): void {
        const structureChance = 0.025;
        const minFoodChance = 0.01;
        const maxFoodChance = 0.1;
        const minHarvestRate = 30;
        const maxHarvestRate = 150;

        const halfWidth = Math.floor(this.mapWidth / 2);
        const halfHeight = Math.floor(this.mapHeight / 2);

        // Place structures and food spawners
        for (let x = 0; x < halfWidth; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                const tile = this.getTile(x, y);
                if (!tile) {
                    throw new Error(`No tile at (${x}, ${y})`);
                }

                // Generate structures and spawners
                if (y === halfHeight - 1 || y === halfHeight) {
                    // Generate road
                    tile.structure = this.manager.create.structure({
                        tile,
                        type: "road",
                    });
                } else {
                    const cx = this.mapWidth / 2;
                    const cy = this.mapHeight / 2;
                    const exp = 2;

                    // Calculate max distances from center of map, raised to exp
                    const maxD = cx ** exp + cy ** exp;

                    // This is a fancy function based on some easing functions
                    const factor =
                        Math.abs(
                            Math.pow(Math.abs(x - cx) - cx, exp) +
                                Math.pow(Math.abs(y - cy) - cy, exp),
                        ) / maxD;

                    // Food chance increases toward center of map
                    const foodChanceRange = maxFoodChance - minFoodChance;
                    const foodChance =
                        factor * foodChanceRange + minFoodChance;

                    // Try to place food or structure
                    if (this.manager.random.float() < foodChance) {
                        // Calculate the multiplier for the harvest rate, increasing food toward center
                        const maxDistFromCenter = Math.sqrt(cx * cx + cy * cy);
                        const dx = cx - x;
                        const dy = cy - y;
                        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                        const harvestRateMult =
                            1 - distFromCenter / maxDistFromCenter;
                        const harvestRateRange =
                            maxHarvestRate - minHarvestRate;

                        // Generate food spawner
                        tile.harvestRate =
                            minHarvestRate +
                            Math.ceil(harvestRateRange * harvestRateMult);
                    } else if (this.manager.random.float() < structureChance) {
                        // Generate neutral structures
                        tile.structure = this.manager.create.structure({
                            tile,
                            type: "neutral",
                        });
                    }
                }
            }
        }

        // Place cat and starting shelter
        let possibleTiles = this.tiles.filter((t) => {
            // Check if tile is empty
            if (t.structure || t.unit || t.harvestRate > 0) {
                return false;
            }

            // Make sure tile is close enough to a corner of the map
            return (
                t.x < halfWidth / 2 &&
                (t.y < halfWidth / 2 || this.mapHeight - t.y < halfWidth / 2)
            );
        });

        if (!arrayHasElements(possibleTiles)) {
            throw new Error("No possible tiles to generate map from.");
        }

        const selected = this.manager.random.element(possibleTiles);

        // Shelter
        selected.structure = this.manager.create.structure({
            owner: this.players[0],
            tile: selected,
            type: "shelter",
        });

        // Cat
        (this
            .players[0] as MutablePlayer).cat = selected.unit = this.manager.create.unit(
            {
                owner: this.players[0],
                tile: selected,
                job: this.jobs.find((j) => j.title === "cat overlord"),
            },
        );

        // Place starting units
        const cat = this.players[0].cat;
        const increment = 2;
        let maxDist = 1 - increment;
        possibleTiles.length = 0;

        for (let i = 0; i < 3; i++) {
            // Make sure there's valid tiles in range
            while (possibleTiles.length === 0) {
                // Expand the range a bit
                maxDist += increment;
                possibleTiles = this.tiles.filter((t) => {
                    // Check if tile is empty
                    if (t.structure || t.unit || t.harvestRate > 0) {
                        return false;
                    }

                    // Make sure it's on the correct side of the map
                    if (t.x >= halfWidth) {
                        return false;
                    }

                    if (!cat.tile) {
                        throw new Error("Cat is not on a tile!");
                    }

                    // Check if the tile is close enough to the cat
                    return (
                        Math.abs(cat.tile.x - t.x) <= maxDist &&
                        Math.abs(cat.tile.y - t.y) <= maxDist
                    );
                });
            }

            if (!arrayHasElements(possibleTiles)) {
                throw new Error(
                    "No possible tiles to generate map from again.",
                );
            }

            // Choose a tile
            const tile = this.manager.random.element(possibleTiles);
            tile.unit = this.manager.create.unit({
                owner: this.players[0],
                tile,
                job: this.jobs.find((j) => j.title === "fresh human"),
            });
            removeElements(possibleTiles, tile);
        }

        // Mirror map
        for (let x = 0; x < halfWidth; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                const orig = this.getTile(x, y);
                const target = this.getTile(
                    this.mapWidth - x - 1,
                    this.mapHeight - y - 1,
                );

                if (!orig || !target) {
                    throw new Error(
                        "No origin or target tile to mirror the map with",
                    );
                }

                // Copy data
                target.harvestRate = orig.harvestRate;

                // Clone structure
                if (orig.structure) {
                    target.structure = this.manager.create.structure({
                        tile: target,
                        type: orig.structure.type,
                        owner:
                            orig.structure.owner &&
                            orig.structure.owner.opponent,
                    });
                }

                // Clone unit
                if (orig.unit) {
                    target.unit = this.manager.create.unit({
                        tile: target,
                        owner: orig.unit.owner && orig.unit.owner.opponent,
                        job: orig.unit.job,
                    });

                    if (target.unit.job.title === "cat overlord") {
                        (target.unit.owner as MutablePlayer).cat = target.unit;
                    }
                }
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { IBaseGameRequiredData } from "~/core/game";
import { BaseClasses } from "./";
import { Bottle } from "./bottle";
import { Cowboy } from "./cowboy";
import { Furnishing } from "./furnishing";
import { SaloonGameManager } from "./game-manager";
import { GameObject } from "./game-object";
import { SaloonGameSettingsManager } from "./game-settings";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>

import * as gaussian from "gaussian";
import { MutableRequired } from "~/utils";

/** A player that can mutate before the game starts */
type MutablePlayer = MutableRequired<Player>;

// <<-- /Creer-Merge: imports -->>

/**
 * Use cowboys to have a good time and play some music on a Piano, while
 * brawling with enemy Cowboys.
 */
export class SaloonGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: SaloonGameManager;

    /** The settings used to initialize the game, as set by players */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /**
     * How many turns a Bartender will be busy for after throwing a Bottle.
     */
    public readonly bartenderCooldown!: number;

    /**
     * All the beer Bottles currently flying across the saloon in the game.
     */
    public bottles!: Bottle[];

    /**
     * How much damage is applied to neighboring things bit by the Sharpshooter
     * between turns.
     */
    public readonly brawlerDamage!: number;

    /**
     * Every Cowboy in the game.
     */
    public cowboys!: Cowboy[];

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
     * Every furnishing in the game.
     */
    public furnishings!: Furnishing[];

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via
     * ID.
     */
    public gameObjects!: {[id: string]: GameObject};

    /**
     * All the jobs that Cowboys can be called in with.
     */
    public jobs!: string[];

    /**
     * The number of Tiles in the map along the y (vertical) axis.
     */
    public readonly mapHeight!: number;

    /**
     * The number of Tiles in the map along the x (horizontal) axis.
     */
    public readonly mapWidth!: number;

    /**
     * The maximum number of Cowboys a Player can bring into the saloon of each
     * specific job.
     */
    public readonly maxCowboysPerJob!: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    public readonly maxTurns!: number;

    /**
     * List of all the players in the game.
     */
    public players!: Player[];

    /**
     * When a player's rowdiness reaches or exceeds this number their Cowboys
     * take a collective siesta.
     */
    public readonly rowdinessToSiesta!: number;

    /**
     * A unique identifier for the game instance that is being played.
     */
    public readonly session!: string;

    /**
     * How much damage is applied to things hit by Sharpshooters when they act.
     */
    public readonly sharpshooterDamage!: number;

    /**
     * How long siestas are for a player's team.
     */
    public readonly siestaLength!: number;

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
     * How many turns a Cowboy will be drunk for if a bottle breaks on it.
     */
    public readonly turnsDrunk!: number;

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
        protected settingsManager: SaloonGameSettingsManager,
        required: Readonly<IBaseGameRequiredData>,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        this.jobs.push(
            "Sharpshooter",
            "Bartender",
            "Brawler",
        );

        const minFurnishings = 0;
        const maxFurnishings = 5;
        const minHazards = 0;
        const maxHazards = 12;

        // make top and bottom sides walls
        for (let x = 0; x < this.mapWidth; x++) {
            const topTile = this.getTile(x, 0);
            const bottomTile = this.getTile(x, this.mapHeight - 1);
            if (!topTile || !bottomTile) {
                throw new Error(`Could not make top or bottom tile at x=${x} a balcony.`);
            }

            topTile.isBalcony = true;
            bottomTile.isBalcony = true;
        }

        // make left and right sides walls
        for (let y = 0; y < this.mapHeight; y++) {
            const leftTile = this.getTile(0, y);
            const rightTile = this.getTile(this.mapWidth - 1, y);
            if (!leftTile || !rightTile) {
                throw new Error(`Could not make top or bottom tile at y=${y} a balcony.`);
            }
            leftTile.isBalcony = true;
            rightTile.isBalcony = true;
        }

        // spawn some random furnishings in quadrants
        let numFurnishings = this.manager.random.int(maxFurnishings, minFurnishings) * 2; // *2 for each side

        const rand = this.manager.random.float();
        let numPianos = 2;
        // 80% of the time, have 4 pianos
        if (rand < 0.80) {
            numPianos = 4;
        }
        // the other 15% of the time have 6
        else if (rand < 0.95) {
            numPianos = 6;
        }
        // and 5% of the time have 8
        else {
            numPianos = 8;
        }

        const distributionX = gaussian(this.mapWidth / 2, this.mapWidth / 3);
        const distributionY = gaussian(this.mapHeight / 2, this.mapHeight / 3);

        let numHazards = this.manager.random.int(maxHazards, minHazards) * 2;

        // while there is stuff to spawn
        while (numFurnishings > 0 || numPianos > 0 || numHazards > 0) {
            // get a random tile on this side that is empty
            let x = 0;
            let y = 0;

            while (true) {
                x = Math.round(distributionX.ppf(this.manager.random.float()));
                y = Math.round(distributionY.ppf(this.manager.random.float()));
                const tile = this.getTile(x, y);

                if (tile && !tile.furnishing && !tile.isBalcony) {
                    break; // because we found a tile that does not have a
                           // furnishing to spawn one on, else we continue our
                           // random search
                }
            }

            for (let side = 0; side < 2; side++) { // for each side (left and right)
                if (side === 1) { // if the right side, invert the x, y coordinate
                    x = this.mapWidth - x - 1;
                    y = this.mapHeight - y - 1;
                }

                if (numHazards > 0) { // if there are hazards to spawn
                    numHazards--;
                    const tile = this.getTile(x, y);
                    if (!tile) {
                        throw new Error(`(${x},${y} is out of range to place a hazard on!`);
                    }
                    tile.hasHazard = true; // "spawn" it by setting that tile's hasHazard to true
                }
                else { // need to spawn a furnishing
                    const tile = this.getTile(x, y);
                    if (!tile) {
                        throw new Error(`No tile at (${x}, ${y}) to place Furnishing on!`);
                    }
                    this.manager.create.furnishing({
                        tile,
                        // if there are pianos to spawn, make it one, else false and thus it is not a piano
                        isPiano: numPianos > 0,
                    });

                    if (numPianos > 0) { // decrement whatever we spawned
                        numPianos--;
                    }
                    else {
                        numFurnishings--;
                    }
                }
            }
        }

        // create the players' Young Guns
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];

            let x = 0;
            let y = 0;
            let dy = 1;
            if (i > 0) { // then change x, y for the second player
                x = this.mapWidth - 1;
                y = this.mapHeight - 1;
                dy = -1;
            }

            // used for moving the young guns around the map,
            // but not a property exposed to clients
            const previousTile = this.getTile(x, y + dy * 2);
            const tile = this.getTile(x, y + dy);

            if (!tile || !previousTile) {
                throw new Error("Could not find tiles to place YoungGun on!");
            }

            (player as MutablePlayer).youngGun = this.manager.create.youngGun({
                owner: player,
                tile,
                canCallIn: true,
                previousTile,
            });
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

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

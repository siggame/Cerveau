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

// <<-- /Creer-Merge: imports -->>

/**
 * Use cowboys to have a good time and play some music on a Piano, while
 * brawling with enemy Cowboys.
 */
export class SaloonGame extends BaseClasses.Game {
    /** The manager of this game, that controls everything around it */
    public readonly manager!: AnarchyGameManager;

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
     * used by the server and client to easily refer to the game objects via ID.
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
     * How many turns a Cowboy will be drunk for if a bottle breaks on it.
     */
    public readonly turnsDrunk!: number;

    // <<-- Creer-Merge: attributes -->>



    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Game is created.
     *
     * @param settingsManager The settings manager that holds initial settings.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        protected settingsManager: SaloonGameSettingsManager,
        required: IBaseGameRequiredData,
    ) {
        super(settingsManager, required);

        // <<-- Creer-Merge: constructor -->>

        this.jobs.push(
            "Sharpshooter",
            "Bartender",
            "Brawler"
        );

        const minFurnishings = 0;
        const maxFurnishings = 5;
        const minPianos = 2;
        const minHazards = 0;
        const maxHazards = 12;

        // the max number of pianos is the same as the number of jobs,
        // therefore at least half the cowboys spawned can't play pianos as
        // there will always be more possible cowboys than pianos
        const maxPianos = this.jobs.length + 1;


        // make top and bottom sides walls
        for (let x = 0; x < this.mapWidth; x++) {
            this.getTile(x, 0).isBalcony = true;
            this.getTile(x, this.mapHeight - 1).isBalcony = true;
        }

        // make left and right sides walls
        for (let y = 0; y < this.mapHeight; y++) {
            this.getTile(0, y).isBalcony = true;
            this.getTile(this.mapWidth - 1, y).isBalcony = true;
        }

        // spawn some random furnishings in quadrants
        var numFurnishings = this.manager.random.int(maxFurnishings, minFurnishings) * 2; // *2 for each side

        var rand = Math.random();
        var numPianos = 2;
        // 80% of the time, have 4 pianos
        if(rand < 0.80) {
            numPianos = 4;
        }
        // the other 15% of the time have 6
        else if(rand < 0.95) {
            numPianos = 6;
        }
        // and 5% of the time have 8
        else {
            numPianos = 8;
        }

        const distributionX = gaussian(this.mapWidth/2, this.mapWidth/3);
        const distributionY = gaussian(this.mapHeight/2, this.mapHeight/3);

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
                    this.getTile(x, y).hasHazard = true; // "spawn" it by setting that tile's hasHazard to true
                }
                else { // need to spawn a furnishing
                    this.manager.create.Furnishing({
                        tile: this.getTile(x, y),
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
        for(var i = 0; i < this.players.length; i++) {
            const player = this.players[i];

            let x = 0;
            let y = 0;
            let dy = 1;
            if (i > 0) { // then change x, y for the second player
                x = this.mapWidth - 1;
                y = this.mapHeight - 1;
                dy = -1;
            }

            player.youngGun = this.create.YoungGun({
                owner: player,
                tile: this.getTile(x, y + dy),
                canCallIn: true,
            });

            // used for moving the young guns around the map,
            // but not a property exposed to clients
            player.youngGun.previousTile = this.getTile(x, y + dy * 2);

            this.manager.doYoungGunFor(player);
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: functions -->>
}

import { BaseGameObjectRequiredData } from "~/core/game";
import {
    BaseCoreminerPlayer,
    PlayerConstructorArgs,
    PlayerSpawnMinerArgs,
} from "./";
import { AI } from "./ai";
import { Bomb } from "./bomb";
import { GameObject } from "./game-object";
import { Miner } from "./miner";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements BaseCoreminerPlayer {
    /** The AI controlling this Player. */
    public readonly ai!: AI;

    /**
     * The Tile this Player's base is on.
     */
    public baseTile!: Tile;

    /**
     * Every Bomb owned by this Player.
     */
    public bombs!: Bomb[];

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * The Tiles this Player's hoppers are on.
     */
    public hopperTiles!: Tile[];

    /**
     * If the player lost the game or not.
     */
    public lost!: boolean;

    /**
     * Every Miner owned by this Player.
     */
    public miners!: Miner[];

    /**
     * The amount of money this Player currently has.
     */
    public money!: number;

    /**
     * The name of the player.
     */
    public readonly name!: string;

    /**
     * This player's opponent in the game.
     */
    public readonly opponent!: Player;

    /**
     * The reason why the player lost the game.
     */
    public reasonLost!: string;

    /**
     * The reason why the player won the game.
     */
    public reasonWon!: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * The amount of value (victory points) this Player has gained.
     */
    public value!: number;

    /**
     * If the player won the game or not.
     */
    public won!: boolean;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Player is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        // never directly created by game developers
        args: PlayerConstructorArgs,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for spawnMiner. Try to find a reason why the
     * passed in parameters are invalid, and return a human readable string
     * telling them why it is invalid.
     *
     * @param player - The player that called this.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateSpawnMiner(
        player: Player,
    ): void | string | PlayerSpawnMinerArgs {
        // <<-- Creer-Merge: invalidate-spawnMiner -->>
        if (this !== this.game.currentPlayer) {
            return `It is not your turn!`;
        }

        if (this.money < this.game.spawnPrice) {
            return `You do not have enough money to spawn a Miner!`;
        }
        // <<-- /Creer-Merge: invalidate-spawnMiner -->>
    }

    /**
     * Spawns a Miner on this Player's base Tile.
     *
     * @param player - The player that called this.
     * @returns True if successfully spawned, false otherwise.
     */
    protected async spawnMiner(player: Player): Promise<boolean> {
        // <<-- Creer-Merge: spawnMiner -->>
        this.money -= this.game.spawnPrice;

        const miner = this.game.manager.create.miner({
            owner: player,
            tile: this.baseTile,
            upgradeLevel: 0,
            currentUpgrade: this.game.upgrades[0],
            health: this.game.upgrades[0].health,
            maxHealth: this.game.upgrades[0].health,
            miningPower: this.game.upgrades[0].miningPower,
            maxMiningPower: this.game.upgrades[0].miningPower,
            moves: this.game.upgrades[0].moves,
            maxMoves: this.game.upgrades[0].moves,
            maxCargoCapacity: this.game.upgrades[0].cargoCapacity,
        });

        this.baseTile.miners.push(miner);
        this.game.miners.push(miner);
        this.miners.push(miner);

        return true;
        // <<-- /Creer-Merge: spawnMiner -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

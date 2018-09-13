import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBaseCatastrophePlayer } from "./";
import { AI } from "./ai";
import { GameObject } from "./game-object";
import { Structure } from "./structure";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
import { Tile } from "./tile";
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements IBaseCatastrophePlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * The overlord cat Unit owned by this Player.
     */
    public readonly cat!: Unit;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * The amount of food owned by this player.
     */
    public food!: number;

    /**
     * If the player lost the game or not.
     */
    public lost!: boolean;

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
     * Every Structure owned by this Player.
     */
    public structures!: Structure[];

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * Every Unit owned by this Player.
     */
    public units!: Unit[];

    /**
     * The total upkeep of every Unit owned by this Player. If there isn't
     * enough food for every Unit, all Units become starved and do not consume
     * food.
     */
    public upkeep!: number;

    /**
     * If the player won the game or not.
     */
    public won!: boolean;

    // <<-- Creer-Merge: attributes -->>

    /** The units owned by this player that were defeated this turn. */
    public readonly defeatedUnits: Unit[] = [];

    /** The units owned by this player that were created this turn. */
    public readonly newUnits: Unit[] = [];

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Player is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        // never directly created by game developers
        args: Readonly<IBaseCatastrophePlayer>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Gets every structure owned by this player, including new structures
     *
     * @returns All of this player's structures
     */
    public getAllStructures(): Structure[] {
        return this.structures.concat(this.game.newStructures.filter((s) => s.owner === this));
    }

    /**
     * Recalculates all squads for this player's units.
     * Unowned units just have squads with only themselves in it.
     */
    public calculateSquads(): void {
        for (const unit of this.units) {
            // Reset squad
            unit.squad = [];

            // Flood fill to calculate squads
            const open = [unit.tile];
            const closed = new Set<Tile>();
            while (open.length > 0) {
                // Grab a tile from the open list
                const tile = open.shift() as Tile; // must exist from above check
                const cur = tile.unit;

                // If the tile grabbed is null/undefined, there's no valid unit there, or we already checked this tile
                if (!cur ||
                    cur.owner !== this ||
                    (unit.squad.length > 0 && cur.job.title !== "soldier") ||
                    closed.has(tile)
                ) {
                    // Skip this tile (and don't spread out from it)
                    continue;
                }

                // Add this unit to the squad
                unit.squad.push(cur);

                // Make sure we never check this tile again
                closed.add(tile);

                // Add the surrounding tiles to the open list to check
                open.push(...tile.getNeighbors());
            }
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

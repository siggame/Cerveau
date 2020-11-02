import { BaseGameObjectRequiredData } from "~/core/game";
import { BombConstructorArgs } from "./";
import { GameObject } from "./game-object";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A Bomb in the game.
 */
export class Bomb extends GameObject {
    /**
     * The Tile this Miner is on.
     */
    public tile?: Tile;

    /**
     * The number of turns before this Bomb explodes. Zero means it will
     * explode after the current turn.
     */
    public timer!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    public exploded!: boolean;

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Bomb is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: BombConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
            // You can add more constructor args in here
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        this.exploded = false;
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    /**
     * Function to blow up a bomb.
     */
    public explode(): void {
        if (this.exploded) {
            return;
        }
        this.exploded = true;
        // prevent bombs from triggering each other endlessly

        const dmg = this.game.settings.bombExplosionDamage;
        const shockDmg = this.game.settings.bombShockwaveDamage;

        if (!this.tile) {
            return;
        }

        // Destroy current tile and surrounding tiles
        this.tile.ore = 0;
        this.tile.dirt = 0;
        this.tile.miners.forEach(
            (miner) => (miner.health = Math.max(0, miner.health - dmg)),
        );
        this.tile.bombs.forEach((bomb) => bomb.explode());

        // Bomb out cardinal directions
        for (const tile of this.tile.getNeighbors()) {
            // Destroy direct neighboring tiles
            tile.ore = 0;
            tile.dirt = 0;
            tile.miners.forEach((miner) => (miner.health -= dmg));
            tile.bombs.forEach((bomb) => bomb.explode());

            const direction = this.tile.getAdjacentDirection(tile);
            let shockTile: Tile | undefined = tile;
            while (direction !== undefined && shockTile) {
                shockTile = shockTile.getNeighbor(direction);
                if (shockTile && shockTile.ore + shockTile.dirt <= 0) {
                    shockTile.miners.forEach(
                        (miner) => (miner.health -= shockDmg),
                    );
                    shockTile.bombs.forEach((bomb) => bomb.explode());
                }
            }
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

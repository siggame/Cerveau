import { BaseGameObjectRequiredData } from "~/core/game";
import { YoungGunCallInArgs, YoungGunConstructorArgs } from "./";
import { Cowboy } from "./cowboy";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An eager young person that wants to join your gang, and will call in the
 * veteran Cowboys you need to win the brawl in the saloon.
 */
export class YoungGun extends GameObject {
    /**
     * The Tile that a Cowboy will be called in on if this YoungGun calls in a
     * Cowboy.
     */
    public callInTile: Tile;

    /**
     * True if the YoungGun can call in a Cowboy, false otherwise.
     */
    public canCallIn!: boolean;

    /**
     * The Player that owns and can control this YoungGun.
     */
    public readonly owner: Player;

    /**
     * The Tile this YoungGun is currently on.
     */
    public tile: Tile;

    // <<-- Creer-Merge: attributes -->>

    /** The previous tile this Young Gun came from */
    public previousTile: Tile;

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a YoungGun is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: YoungGunConstructorArgs<{
            // <<-- Creer-Merge: constructor-args -->>
                /** The controlling Player of this YoungGun. */
                owner: Player;
                /** The Tile to spawn this YoungGun upon. */
                tile: Tile;
                /** The previous Tile he would have moved from, used to figure out movement direction. */
                previousTile: Tile;
            // <<-- /Creer-Merge: constructor-args -->>
        }>,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        this.owner = args.owner;
        this.tile = args.tile;
        this.previousTile = args.previousTile;
        this.callInTile = args.tile; // will be over-ridden next
        this.update();
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Updates Young Gun related logic: moving them clockwise
     */
    public update(): void {
        this.canCallIn = true; // they can call in a cowboy on their next turn

        // find the adjacent tile that they were not on last turn,
        //   this way all YoungGuns continue walking clockwise
        const tiles = this.tile.getNeighbors();
        const moveTo = tiles.find(
            (tile) => tile.isBalcony && this.previousTile !== tile,
        );

        if (!moveTo) {
            throw new Error(`${this} cannot move to a new Tile!`);
        }

        // do a quick BFS to find the callInTile
        const searchTiles = [moveTo];
        const searched = new Set();
        while (searchTiles.length > 0) {
            const searchTile = searchTiles.shift() as Tile; // will exist because above check

            if (!searched.has(searchTile)) {
                searched.add(searchTile);

                if (searchTile.isBalcony) {
                    // add its neighbors to be searched
                    searchTiles.push(...searchTile.getNeighbors());
                } else {
                    this.callInTile = searchTile;
                    break; // we found it
                }
            }
        }

        this.previousTile = this.tile;
        this.tile.youngGun = undefined;
        this.tile = moveTo;
        moveTo.youngGun = this;
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for callIn. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param job - The job you want the Cowboy being brought to have.
     * @returns If the arguments are invalid, return a string explaining to
     * human players why it is invalid. If it is valid return nothing, or an
     * object with new arguments to use in the actual function.
     */
    protected invalidateCallIn(
        player: Player,
        job: "Bartender" | "Brawler" | "Sharpshooter",
    ): void | string | YoungGunCallInArgs {
        // <<-- Creer-Merge: invalidate-callIn -->>

        if (!this.canCallIn) {
            return `${this} cannot call in any more Cowboys this turn.`;
        }

        // make sure they are not trying to go above the limit
        const count = this.owner.cowboys.filter(
            (c) => c.job === job && !c.isDead,
        ).length;
        if (count >= this.game.maxCowboysPerJob) {
            return `You cannot call in any more '${job}' Cowboys (max of ${this.game.maxCowboysPerJob})`;
        }

        // <<-- /Creer-Merge: invalidate-callIn -->>
    }

    /**
     * Tells the YoungGun to call in a new Cowboy of the given job to the open
     * Tile nearest to them.
     *
     * @param player - The player that called this.
     * @param job - The job you want the Cowboy being brought to have.
     * @returns The new Cowboy that was called in if valid. They will not be
     * added to any `cowboys` lists until the turn ends. Undefined otherwise.
     */
    protected async callIn(
        player: Player,
        job: "Bartender" | "Brawler" | "Sharpshooter",
    ): Promise<Cowboy | undefined> {
        // <<-- Creer-Merge: callIn -->>

        // clear the open tile before moving the young gun to it
        if (this.callInTile.cowboy) {
            this.callInTile.cowboy.damage(Infinity);
        }

        if (this.callInTile.furnishing) {
            this.callInTile.furnishing.damage(Infinity);
        }

        this.canCallIn = false;

        const cowboy = this.manager.create.cowboy({
            owner: this.owner,
            job,
            tile: this.callInTile,
            canMove: false,
        });

        if (this.callInTile.bottle) {
            // then break the bottle on this new cowboy, so he immediately gets drunk
            this.callInTile.bottle.break(cowboy);
        }

        this.callInTile.cowboy = cowboy;

        return cowboy;

        // <<-- /Creer-Merge: callIn -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

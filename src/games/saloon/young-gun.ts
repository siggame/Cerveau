import { IBaseGameObjectRequiredData } from "~/core/game";
import { IYoungGunProperties } from "./";
import { Cowboy } from "./cowboy";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Add properties here to make the create.YoungGun have different args.
 */
export interface IYoungGunConstructorArgs
extends IGameObjectConstructorArgs, IYoungGunProperties {
    // <<-- Creer-Merge: constructor-args -->>
    owner: Player;
    tile: Tile;
    previousTile: Tile;
    // <<-- /Creer-Merge: constructor-args -->>
}

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
     * @param data - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        data: IYoungGunConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        this.owner = data.owner;
        this.tile = data.tile;
        this.previousTile = data.previousTile;
        this.callInTile = data.tile; // will be over-ridden next
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
        const moveTo = tiles.find((tile) => tile.isBalcony && this.previousTile !== tile)!;

        // do a quick BFS to find the callInTile
        const searchTiles = [ moveTo ];
        const searched = new Set();
        while (searchTiles.length > 0) {
            const searchTile = searchTiles.shift()!; // will exist because above check

            if (!searched.has(searchTile)) {
                searched.add(searchTile);

                if (searchTile.isBalcony) { // add its neighbors to be searched
                    searchTiles.push(...searchTile.getNeighbors());
                }
                else {
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
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateCallIn(
        player: Player,
        job: "Bartender" | "Brawler" | "Sharpshooter",
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-callIn -->>

        if (!this.canCallIn) {
            return `${this} cannot call in any more Cowboys this turn.`;
        }

        // make sure they are not trying to go above the limit
        const count = this.owner.cowboys.filter((c) => c.job === job && !c.isDead).length;
        if (count >= this.game.maxCowboysPerJob) {
            return `You cannot call in any more '${job}' Cowboys (max of ${this.game.maxCowboysPerJob})`;
        }

        // <<-- /Creer-Merge: invalidate-callIn -->>
        return arguments;
    }

    /**
     * Tells the YoungGun to call in a new Cowboy of the given job to the open
     * Tile nearest to them.
     *
     * @param player - The player that called this.
     * @param job - The job you want the Cowboy being brought to have.
     * @returns The new Cowboy that was called in if valid. They will not be
     * added to any `cowboys` lists until the turn ends. Null otherwise.
     */
    protected async callIn(
        player: Player,
        job: "Bartender" | "Brawler" | "Sharpshooter",
    ): Promise<Cowboy> {
        // <<-- Creer-Merge: callIn -->>

        // clear the open tile before moving the young gun to it
        if (this.callInTile.cowboy) {
            this.callInTile.cowboy.damage(Infinity);
        }

        if (this.callInTile.furnishing) {
            this.callInTile.furnishing.damage(Infinity);
        }

        this.canCallIn = false;

        const cowboy = this.manager.create.Cowboy({
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

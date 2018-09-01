import { IBaseGameObjectRequiredData } from "~/core/game";
import { ICowboyProperties } from "./";
import { Furnishing } from "./furnishing";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
import { TileDirection } from "~/core/game/mixins/tiled";
// <<-- /Creer-Merge: imports -->>

/**
 * The job that this Cowboy does, and dictates how they fight and interact
 * within the Saloon.
 */
export type CowboyJob = "Bartender" | "Brawler" | "Sharpshooter";

/**
 * A person on the map that can move around and interact within the saloon.
 */
export class Cowboy extends GameObject {
    /**
     * If the Cowboy can be moved this turn via its owner.
     */
    public canMove!: boolean;

    /**
     * The direction this Cowboy is moving while drunk. Will be 'North',
     * 'East', 'South', or 'West' when drunk; or '' (empty string) when not
     * drunk.
     */
    public drunkDirection!: string;

    /**
     * How much focus this Cowboy has. Different Jobs do different things with
     * their Cowboy's focus.
     */
    public focus!: number;

    /**
     * How much health this Cowboy currently has.
     */
    public health!: number;

    /**
     * If this Cowboy is dead and has been removed from the game.
     */
    public isDead!: boolean;

    /**
     * If this Cowboy is drunk, and will automatically walk.
     */
    public isDrunk!: boolean;

    /**
     * The job that this Cowboy does, and dictates how they fight and interact
     * within the Saloon.
     */
    public readonly job!: "Bartender" | "Brawler" | "Sharpshooter";

    /**
     * The Player that owns and can control this Cowboy.
     */
    public readonly owner: Player;

    /**
     * The Tile that this Cowboy is located on.
     */
    public tile?: Tile;

    /**
     * How many times this unit has been drunk before taking their siesta and
     * reseting this to 0.
     */
    public tolerance!: number;

    /**
     * How many turns this unit has remaining before it is no longer busy and
     * can `act()` or `play()` again.
     */
    public turnsBusy!: number;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Cowboy is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        args: ICowboyProperties & {
            // <<-- Creer-Merge: constructor-args -->>
            owner: Player;
            tile: Tile;
            // <<-- /Creer-Merge: constructor-args -->>
        },
        required: IBaseGameObjectRequiredData,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>

        this.owner = args.owner;
        this.tile = args.tile;

        this.canMove = true;
        this.health = 10;
        this.tile.cowboy = this;

        // NOTE: don't add to the cowboys arrays so it doesn't resize during a
        // player's turn
        this.manager.spawnedCowboys.push(this); // just tell the game we spawned

        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * String coercion override.
     *
     * @returns string stating what this cowboy is
     */
    public toString(): string {
        return `'${this.job}' ${this.gameObjectName} #${this.id}`;
    }

    /**
     * Damages this cowboy for some amount of damage, setting isDead if it dies
     *
     * @param damage How much damage to do to this
     */
    public damage(damage: number): void {
        this.health = Math.max(0, this.health - damage);
        if (this.health === 0) {
            this.isDead = true;
            this.canMove = false;
            this.drunkDirection = "";
            this.isDrunk = false;
            this.turnsBusy = this.game.maxTurns;

            if (this.tile) {
                this.tile.cowboy = undefined;
            }
            this.tile = undefined;
            this.owner.opponent.kills++;
        }
    }

    /**
     * Gets this cowboy drunk
     *
     * @param drunkDirection The valid string direction to set this.drunkDirection
     */
    public getDrunk(drunkDirection: string): void {
        this.owner.addRowdiness(1);

        this.canMove = false;

        if (this.owner.siesta === 0) { // then they did not start a siesta, so they actually get drunk
            this.isDrunk = true;
            this.turnsBusy = this.game.turnsDrunk;
            this.drunkDirection = drunkDirection;
            this.focus = 0;
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invalidation function for act. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile you want this Cowboy to act on.
     * @param drunkDirection - The direction the bottle will cause drunk
     * cowboys to be in, can be 'North', 'East', 'South', or 'West'.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateAct(
        player: Player,
        tile: Tile,
        drunkDirection: "" | "North" | "East" | "South" | "West" = "",
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-act -->>

        let invalid = this.invalidate(player, tile);
        if (invalid) {
            return invalid;
        }

        if (this.turnsBusy > 0) {
            return `${this} is busy and cannot act this turn for ${this.turnsBusy} more turns.`;
        }

        // job specific acts
        switch (this.job) {
            case "Bartender":
                invalid = this.invalidateBartender(player, tile, drunkDirection);
                break;
            case "Brawler":
                return `${this} is a Brawler and cannot act`;
            case "Sharpshooter":
                invalid = this.invalidateSharpshooter(player, tile);
        }

        if (invalid) {
            return invalid;
        }

        // <<-- /Creer-Merge: invalidate-act -->>
        return arguments;
    }

    /**
     * Does their job's action on a Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile you want this Cowboy to act on.
     * @param drunkDirection - The direction the bottle will cause drunk
     * cowboys to be in, can be 'North', 'East', 'South', or 'West'.
     * @returns True if the act worked, false otherwise.
     */
    protected async act(
        player: Player,
        tile: Tile,
        drunkDirection: "" | "North" | "East" | "South" | "West" = "",
    ): Promise<boolean> {
        // <<-- Creer-Merge: act -->>

        switch (this.job) {
            case "Sharpshooter":
                return this.actSharpshooter(player, tile);
            case "Bartender":
                return this.actBartender(player, tile, drunkDirection);
        }

        throw new Error("cowboy.act should not reach this point!");

        // <<-- /Creer-Merge: act -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param tile - The Tile you want to move this Cowboy to.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateMove(
        player: Player,
        tile: Tile,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-move -->>

        const invalid = this.invalidate(player, tile);
        if (invalid) {
            return invalid;
        }

        if (!this.canMove) {
            return `${this} has already moved.`;
        }

        if (tile) { // check if blocked or not adjacent
            if (this.tile && !this.tile.hasNeighbor(tile)) {
                return `${tile} is not adjacent to ${this.tile}`;
            }
            else if (tile.isBalcony) {
                return `${tile} is a balcony and cannot be moved onto.`;
            }
            else if (tile.cowboy) {
                return `${tile} is blocked by ${tile.cowboy} and cannot be moved into.`;
            }
            else if (tile.furnishing) {
                return `${tile} is blocked by ${tile.furnishing} and cannot be moved into.`;
            }
        }

        // <<-- /Creer-Merge: invalidate-move -->>
        return arguments;
    }

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param player - The player that called this.
     * @param tile - The Tile you want to move this Cowboy to.
     * @returns True if the move worked, false otherwise.
     */
    protected async move(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: move -->>

        if (!this.tile) {
            throw new Error("Cowboy.move called in illegal state!");
        }

        this.tile.cowboy = undefined; // remove me from the tile I was on
        tile.cowboy = this;
        this.tile = tile; // and move me to the new tile
        this.canMove = false; // and mark me as having moved this turn

        if (this.tile.bottle) {
            this.tile.bottle.break();
        }

        // sharpshooters loose focus when they move
        if (this.job === "Sharpshooter") {
            this.focus = 0;
        }

        return true;

        // <<-- /Creer-Merge: move -->>
    }

    /**
     * Invalidation function for play. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player - The player that called this.
     * @param piano - The Furnishing that is a piano you want to play.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidatePlay(
        player: Player,
        piano: Furnishing,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-play -->>

        const invalid = this.invalidate(player, this.tile);
        if (invalid) {
            return invalid;
        }

        if (this.turnsBusy > 0) {
            return `${this} is busy and cannot act this turn for ${this.turnsBusy} more turns.`;
        }

        if (!piano || !piano.isPiano) {
            return `${piano} is not a piano to play`;
        }

        if (piano.isPlaying) {
            return `${piano} is already playing music this turn.`;
        }

        if (piano.isDestroyed) {
            return `${piano} is destroyed and cannot be played.`;
        }

        if (!piano || !piano.tile || !piano.tile.hasNeighbor(this.tile)) {
            return `${piano} is not adjacent to ${this}`;
        }

        // <<-- /Creer-Merge: invalidate-play -->>
        return arguments;
    }

    /**
     * Sits down and plays a piano.
     *
     * @param player - The player that called this.
     * @param piano - The Furnishing that is a piano you want to play.
     * @returns True if the play worked, false otherwise.
     */
    protected async play(
        player: Player,
        piano: Furnishing,
    ): Promise<boolean> {
        // <<-- Creer-Merge: play -->>

        piano.isPlaying = true;
        this.turnsBusy = 1;
        this.owner.score++;
        piano.damage(1);

        return true;

        // <<-- /Creer-Merge: play -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Checks if this Cowboy can do things based on the player and tile
     * (can move, can act, acn play, etc).
     *
     * @param player - The player commanding this Cowboy.
     * @param tile - The tile trying to do something to.
     * @returns The reason this is invalid (still in need of formatting),
     * undefined if valid.
     */
    private invalidate(player: Player, tile: Tile | undefined): string | undefined {
        if (this.owner !== player) {
            return `${this} is not owned by you.`;
        }
        if (this.isDead) {
            return `${this} is dead.`;
        }
        if (this.isDrunk) {
            return `${this} is drunk, can cannot be directly controlled by you.`;
        }
        if (this.owner.siesta > 0) {
            return `${this} is asleep because of their siesta and cannot be controlled by you.`;
        }
        if (!tile) {
            return `${tile} is not a valid Tile.`;
        }
    }

    /**
     * Tries to invalidate the args for the Sharpshooter's act.
     *
     * @see Cowboy.act
     * @param player - The player making the cowboy act.
     * @param tile - The tile the cowboy wants to act on.
     * @returns The invalid reason if invalid (format not invoked against it),
     * undefined if valid.
     */
    private invalidateSharpshooter(player: Player, tile: Tile): string | undefined {
        if (!this.tile) {
            return `${this} must be on a tile`;
        }

        if (this.focus < 1) {
            return `${this} needs focus to act. Currently has ${this.focus} focus.`;
        }

        if (!this.tile.getAdjacentDirection(tile)) {
            return `${tile} is not adjacent to the Tile that ${this} is on (${this.tile}).`;
        }
    }

    /**
     * Makes a Sharpshooter cowboy act.
     *
     * @see Cowboy.act
     * @param player - The player making the cowboy act.
     * @param tile - The tile the cowboy wants to act on.
     * @returns True because it worked.
     */
    private actSharpshooter(player: Player, tile: Tile): true {

        let shot = tile;
        let distance = this.focus;
        while (shot && distance > 0) { // shoot things
            distance--; // yes we could do this above but it reads stupid

            if (!shot || shot.isBalcony) {
                break; // we are done
            }

            if (shot.cowboy) {
                shot.cowboy.damage(this.game.sharpshooterDamage);
            }

            if (shot.furnishing) {
                shot.furnishing.damage(this.game.sharpshooterDamage);
            }

            if (shot.bottle) {
                shot.bottle.break();
            }

            if (!this.tile) {
                throw new Error("Sharpshooter's act invoked illegally");
            }

            const adjacentDirection = this.tile.getAdjacentDirection(tile);
            if (!adjacentDirection) {
                throw new Error("Sharpshooter act on illegal tile direction");
            }
            shot = shot.getNeighbor(adjacentDirection);
        }

        this.focus = 0;
        this.turnsBusy = 1;

        return true;
    }

    /**
     * Tries to invalidate the args for the Bartender's act.
     *
     * @see Cowboy.act
     * @param player - The player making the cowboy act.
     * @param tile - The tile the cowboy wants to act on.
     * @param drunkDirection - The direction the player wants drunks hit by the
     * bottle to go.
     * @returns The invalid reason if invalid (format not invoked against it),
     * undefined if valid.
     */
    private invalidateBartender(
        player: Player,
        tile: Tile,
        drunkDirection: "" | TileDirection,
    ): string | undefined {
        if (!drunkDirection) {
            return "drunkDirection cannot be empty for a Bartender to act.";
        }

        if (!this.tile) {
            return `${this} has no tile.`;
        }

        // make sure the tile is an adjacent tile
        if (!this.tile.hasNeighbor(tile)) {
            return `${tile} is not adjacent to the Tile that ${this} is on (${this.tile}).`;
        }
    }

    /**
     * Makes a Bartender cowboy act.
     *
     * @see Cowboy.act
     * @param player - The player making the cowboy act.
     * @param tile - The tile the cowboy wants to act on.
     * @param drunkDirection - The direction the player wants drunks hit by the
     * bottle to go.
     * @returns True because it worked.
     */
    private actBartender(player: Player, tile: Tile, drunkDirection: string): true {
        // check to make sure the tile the bottle spawns on would not cause it to instantly break
        // because if so, don't create it, just instantly get the cowboy there drunk
        if (!tile.isPathableToBottles() || tile.bottle) { // don't spawn a bottle, just splash the beer at them
            if (tile.cowboy) {
                tile.cowboy.getDrunk(drunkDirection);
            }

            if (tile.bottle) {
                tile.bottle.break();
            }
        }
        else { // the adjacent tile is empty, so spawn one
            if (!this.tile) {
                throw new Error("Bartender act called in illegal state!");
            }

            const direction = this.tile.getAdjacentDirection(tile);

            if (!direction) {
                throw new Error("Could not get direction between tiles!");
            }

            this.manager.create.bottle({
                tile,
                drunkDirection,
                direction,
            });
        }

        this.turnsBusy = this.game.bartenderCooldown;

        return true;
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { ICowboyProperties } from "./";
import { Furnishing } from "./furnishing";
import { GameObject, IGameObjectConstructorArgs } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface ICowboyConstructorArgs
extends IGameObjectConstructorArgs, ICowboyProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * A person on the map that can move around and interact within the saloon.
 */
export class Cowboy extends GameObject {
    /**
     * If the Cowboy can be moved this turn via its owner.
     */
    public canMove!: boolean;

    /**
     * The direction this Cowboy is moving while drunk. Will be 'North', 'East',
     * 'South', or 'West' when drunk; or '' (empty string) when not drunk.
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
    public readonly job!: string;

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
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: ICowboyConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>

        this.canMove = true;
        this.health = 10;
        this.tile.cowboy = this;

        // NOTE: don't add to the cowboys arrays so it doesn't resize during a 
        // player's turn
        this.game.spawnedCowboys.push(this); // just tell the game we spawned

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Invalidation function for act. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player The player that called this.
     * @param tile The Tile you want this Cowboy to act on.
     * @param drunkDirection The direction the bottle will cause drunk cowboys
     * to be in, can be 'North', 'East', 'South', or 'West'.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateAct(
        player: Player,
        tile: Tile,
        drunkDirection: string = "",
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
            case "Brawler":
                return `${this} is a Brawler and cannot act`;
        }
        return this["invalidate" + this.job.replace(" ", "")].apply(this, arguments);

        // <<-- /Creer-Merge: invalidate-act -->>
        return arguments;
    }

    /**
     * Does their job's action on a Tile.
     *
     * @param player The player that called this.
     * @param tile The Tile you want this Cowboy to act on.
     * @param drunkDirection The direction the bottle will cause drunk cowboys
     * to be in, can be 'North', 'East', 'South', or 'West'.
     * @returns True if the act worked, false otherwise.
     */
    protected async act(
        player: Player,
        tile: Tile,
        drunkDirection: string = "",
    ): Promise<boolean> {
        // <<-- Creer-Merge: act -->>

        return this["act" + this.job.replace(" ", "")].apply(this, arguments);

        // <<-- /Creer-Merge: act -->>
    }

    /**
     * Invalidation function for move. Try to find a reason why the passed in
     * parameters are invalid, and return a human readable string telling them
     * why it is invalid.
     *
     * @param player The player that called this.
     * @param tile The Tile you want to move this Cowboy to.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidateMove(player: Player, tile: Tile): string | IArguments {
        // <<-- Creer-Merge: invalidate-move -->>

        const invalid = this.invalidate(player, tile);
        if(invalid) {
            return invalid;
        }

        if(!this.canMove) {
            return `${this} has already moved.`;
        }

        if(tile) { // check if blocked or not adjacent
            if(this.tile && !this.tile.hasNeighbor(tile)) {
                return `${tile} is not adjacent to ${this.tile}`;
            }
            else if(tile.isBalcony) {
                return `${tile} is a balcony and cannot be moved onto.`;
            }
            else if(tile.cowboy) {
                return `${tile} is blocked by ${tile.cowboy} and cannot be moved into.`;
            }
            else if(tile.furnishing) {
                return `${tile} is blocked by ${tile.furnishing} and cannot be moved into.`;
            }
        }

        // <<-- /Creer-Merge: invalidate-move -->>
        return arguments;
    }

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param player The player that called this.
     * @param tile The Tile you want to move this Cowboy to.
     * @returns True if the move worked, false otherwise.
     */
    protected async move(player: Player, tile: Tile): Promise<boolean> {
        // <<-- Creer-Merge: move -->>


        this.tile.cowboy = null; // remove me from the tile I was on
        tile.cowboy = this;
        this.tile = tile; // and move me to the new tile
        this.canMove = false; // and mark me as having moved this turn

        if(this.tile.bottle) {
            this.tile.bottle.break();
        }

        // sharpshooters loose focus when they move
        if(this.job === "Sharpshooter") {
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
     * @param player The player that called this.
     * @param piano The Furnishing that is a piano you want to play.
     * @returns a string that is the invalid reason, if the arguments are
     * invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    protected invalidatePlay(
        player: Player,
        piano: Furnishing,
    ): string | IArguments {
        // <<-- Creer-Merge: invalidate-play -->>

        const invalid = this.invalidate(player, this.tile);
        if(invalid) {
            return invalid;
        }

        if(this.turnsBusy > 0) {
            return `${this} is busy and cannot act this turn for ${this.turnsBusy} more turns.`;
        }

        if(!piano || !piano.isPiano) {
            return `${piano} is not a piano to play`;
        }

        if(piano.isPlaying) {
            return `${piano} is already playing music this turn.`;
        }

        if(piano.isDestroyed) {
            return `${piano} is destroyed and cannot be played.`;
        }

        if(!piano || !piano.tile || !piano.tile.hasNeighbor(this.tile)) {
            return `${piano} is not adjacent to ${this}`;
        }

        // <<-- /Creer-Merge: invalidate-play -->>
        return arguments;
    }

    /**
     * Sits down and plays a piano.
     *
     * @param player The player that called this.
     * @param piano The Furnishing that is a piano you want to play.
     * @returns True if the play worked, false otherwise.
     */
    protected async play(player: Player, piano: Furnishing): Promise<boolean> {
        // <<-- Creer-Merge: play -->>

        piano.isPlaying = true;
        this.turnsBusy = 1;
        this.owner.score++;
        piano.damage(1);

        return true;

        // <<-- /Creer-Merge: play -->>
    }

    // <<-- Creer-Merge: functions -->>

    /**
     * Checks if this Cowboy can do things based on the player and tile (can move, can act, acn play, etc)
     * @param player - the player commanding this Cowboy
     * @param tile - the tile trying to do something to
     * @returns the reason this is invalid (still in need of formatting), undefined if valid
     */
    private invalidate(player: Player, tile: Tile): string | undefined {
        if (this.owner !== player) {
            return `${this} is not owned by you.`;
        }
        if (this.isDead) {
            return `${this} is dead.`;
        }
        if (this.isDrunk) {
            return `${this} is drunk, can cannot be directly controlled by you.`;
        }
        if (this.siesta > 0) {
            return `${this} is asleep because of their siesta and cannot be controlled by you.`;
        }
        if (!tile) {
            return `${tile} is not a valid Tile.`;
        }
    }

    /**
     * Damages this cowboy for some amount of damage, setting isDead if it dies
     *
     * @param damage How much damage to do to this
     */
    private damage(damage: number): void {
        this.health = Math.max(0, this.health - damage);
        if(this.health === 0) {
            this.isDead = true;
            this.canMove = false;
            this.tile.cowboy = null;
            this.tile = null;
            this.owner.opponent.kills++;
        }
    }

    /**
     * Tries to invalidate the args for the Sharpshooter's act
     *
     * @see Cowboy#act
     * @param player The player making the cowboy act
     * @param tile The tile the cowboy wants to act on
     * @returns The invalid reason if invalid (format not invoked against it), undefined if valid
     */
    private invalidateSharpshooter(player: Player, tile: Tile): string | undefined {
        if (this.focus < 1) {
            return `${this} needs focus to act. Currently has ${this.focus} focus.`;
        }

        if (!this.tile.adjacentDirection(tile)) {
            return `${tile} is not adjacent to the Tile that {this} is on (${this.tile}).`;
        }
    }

    /**
     * Makes a Sharpshooter cowboy act
     *
     * @see Cowboy#act
     * @param player The player making the cowboy act
     * @param tile The tile the cowboy wants to act on
     * @returns true because it worked
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

            shot = shot.getNeighbor(this.tile.adjacentDirection(tile));
        }

        this.focus = 0;
        this.turnsBusy = 1;

        return true;
    }

    /**
     * Tries to invalidate the args for the Bartender's act
     *
     * @see Cowboy#act
     * @param player The player making the cowboy act
     * @param tile The tile the cowboy wants to act on
     * @param drunkDirection The direction the player wants drunks hit by the bottle to go
     * @param args Dictionary of actual args to update
     * @returns The invalid reason if invalid (format not invoked against it), undefined if valid
     */
    private invalidateBartender(
        player: Player,
        tile: Tile,
        drunkDirection: string,
    ): string | Error {
        let validDrunkDirection = false;
        const simple = drunkDirection[0].toLowerCase();
        for(var i = 0; i < this.game.tileDirections.length; i++) {
            const direction = this.game.tileDirections[i];
            const dir = direction[0].toLowerCase(); // so we can check just the first two letters if they are the same, so we can be lax on input

            if(simple === dir) {
                validDrunkDirection = direction;
                break;
            }
        }

        if(!validDrunkDirection) {
            return `${drunkDirection} is not a valid direction to send drunk Cowboys hit by ${this}'s Bottles.`.format({this: this, drunkDirection});
        }

        // make sure the tile is an adjacent tile
        if(!this.tile.adjacentDirection(tile)) {
            return `${tile} is not adjacent to the Tile that {this} is on (${this.tile}).`;
        }

        args.drunkDirection = validDrunkDirection;
    },

    /**
     * makes a Bartender cowboy act
     *
     * @see Cowboy#act
     * @param {Player} player - the player making the cowboy act
     * @param {Tile} tile - the tile the cowboy wants to act on
     * @param {string} drunkDirection - the direction the player wants drunks hit by the bottle to go
     * @returns {boolean} true because it worked
     */
    actBartender: function(player, tile, drunkDirection) {
        // check to make sure the tile the bottle spawns on would not cause it to instantly break
        // because if so, don't create it, just instantly get the cowboy there drunk
        if(!tile.isPathableToBottles() || tile.bottle) { // don't spawn a bottle, just splash the beer at them
            if(tile.cowboy) {
                tile.cowboy.getDrunk(drunkDirection);
            }

            if(tile.bottle) {
                tile.bottle.break();
            }
        }
        else { // the adjacent tile is empty, so spawn one
            var bottle = this.game.create("Bottle", {
                tile: tile,
                drunkDirection: drunkDirection,
                direction: this.tile.adjacentDirection(tile),
            });
        }

        this.turnsBusy = this.game.bartenderCooldown;

        return true;
    },

    /**
     * Tries to invalidate the args for the Bartender's act
     *
     * @returns {string} it's always invalid
     */
    invalidateBrawler: function() {
        return "Brawlers cannot act.";
    },

    /**
     * Gets this cowboy drunk
     *
     * @param {string} drunkDirection - the valid string direction to set this.drunkDirection
     */
    getDrunk: function(drunkDirection) {
        this.owner.addRowdiness(1);

        if(this.owner.siesta === 0) { // then they did not start a siesta, so they actually get drunk
            this.isDrunk = true;
            this.turnsBusy = this.game.turnsDrunk;
            this.drunkDirection = drunkDirection;
            this.focus = 0;
            this.canMove = false;
        }
    }

    /**
     * String coercion override
     *
     * @override
     * @returns string stating what this cowboy is
     */
    public toString(): string {
        return `'{this.job}' {gameObjectName} #{id}".format(this)`;
    }

    // <<-- /Creer-Merge: functions -->>
}

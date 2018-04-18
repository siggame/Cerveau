// Cowboy: A person on the map that can move around and interact within the saloon.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Cowboy: A person on the map that can move around and interact within the saloon.
let Cowboy = Class(GameObject, {
    /**
     * Initializes Cowboys.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * If the Cowboy can be moved this turn via its owner.
         *
         * @type {boolean}
         */
        this.canMove = this.canMove || false;

        /**
         * The direction this Cowboy is moving while drunk. Will be 'North', 'East', 'South', or 'West' when drunk; or '' (empty string) when not drunk.
         *
         * @type {string}
         */
        this.drunkDirection = this.drunkDirection || "";

        /**
         * How much focus this Cowboy has. Different Jobs do different things with their Cowboy's focus.
         *
         * @type {number}
         */
        this.focus = this.focus || 0;

        /**
         * How much health this Cowboy currently has.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * If this Cowboy is dead and has been removed from the game.
         *
         * @type {boolean}
         */
        this.isDead = this.isDead || false;

        /**
         * If this Cowboy is drunk, and will automatically walk.
         *
         * @type {boolean}
         */
        this.isDrunk = this.isDrunk || false;

        /**
         * The job that this Cowboy does, and dictates how they fight and interact within the Saloon.
         *
         * @type {string}
         */
        this.job = this.job || "";

        /**
         * The Player that owns and can control this Cowboy.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The Tile that this Cowboy is located on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;

        /**
         * How many times this unit has been drunk before taking their siesta and reseting this to 0.
         *
         * @type {number}
         */
        this.tolerance = this.tolerance || 0;

        /**
         * How many turns this unit has remaining before it is no longer busy and can `act()` or `play()` again.
         *
         * @type {number}
         */
        this.turnsBusy = this.turnsBusy || 0;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.canMove = true;
        this.health = 10;
        this.tile.cowboy = this;

        // NOTE: don't add to the cowboys arrays so they don't resize during a turn
        this.game.spawnedCowboys.push(this); // just tell the game we spawned

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Cowboy",


    /**
     * Invalidation function for act
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want this Cowboy to act on.
     * @param {string} drunkDirection - The direction the bottle will cause drunk cowboys to be in, can be 'North', 'East', 'South', or 'West'.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateAct: function(player, tile, drunkDirection, args) {
        // <<-- Creer-Merge: invalidateAct -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player, tile);
        if(invalid) {
            return invalid;
        }

        if(this.turnsBusy > 0) {
            return `${this} is busy and cannot act this turn for ${this.turnsBusy} more turns.`;
        }

        // job specific acts
        return this["invalidate" + this.job.replace(" ", "")].apply(this, arguments);

        // <<-- /Creer-Merge: invalidateAct -->>
    },

    /**
     * Does their job's action on a Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want this Cowboy to act on.
     * @param {string} drunkDirection - The direction the bottle will cause drunk cowboys to be in, can be 'North', 'East', 'South', or 'West'.
     * @returns {boolean} True if the act worked, false otherwise.
     */
    act: function(player, tile, drunkDirection) {
        // <<-- Creer-Merge: act -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        return this["act" + this.job.replace(" ", "")].apply(this, arguments);

        // <<-- /Creer-Merge: act -->>
    },


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want to move this Cowboy to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player, tile);
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

        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want to move this Cowboy to.
     * @returns {boolean} True if the move worked, false otherwise.
     */
    move: function(player, tile) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

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
    },


    /**
     * Invalidation function for play
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Furnishing} piano - The Furnishing that is a piano you want to play.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidatePlay: function(player, piano, args) {
        // <<-- Creer-Merge: invalidatePlay -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const invalid = this._invalidate(player, this.tile);
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

        // <<-- /Creer-Merge: invalidatePlay -->>
    },

    /**
     * Sits down and plays a piano.
     *
     * @param {Player} player - the player that called this.
     * @param {Furnishing} piano - The Furnishing that is a piano you want to play.
     * @returns {boolean} True if the play worked, false otherwise.
     */
    play: function(player, piano) {
        // <<-- Creer-Merge: play -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        piano.isPlaying = true;
        this.turnsBusy = 1;
        this.owner.score++;
        piano.damage(1);

        return true;

        // <<-- /Creer-Merge: play -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Checks if this Cowboy can do things based on the player and tile (can move, can act, acn play, etc)
     * @param {Player} player - the player commanding this Cowboy
     * @param {Tile} tile - the tile trying to do something to
     * @returns {string|undefined} the reason this is invalid (still in need of formatting), undefined if valid
     */
    _invalidate: function(player, tile) {
        if(!player || player !== this.game.currentPlayer) {
            return "{player} it is not your turn.";
        }
        else if(this.owner !== player) {
            return "{this} is not owned by you.";
        }
        else if(this.isDead) {
            return "{this} is dead.";
        }
        else if(this.isDrunk) {
            return "{this} is drunk, can cannot be directly controlled by you.";
        }
        else if(this.siesta > 0) {
            return "{this} is asleep because of their siesta and cannot be controlled by you.";
        }
        else if(!tile) {
            return "{tile} is not a valid Tile.";
        }
    },

    /**
     * Damages this cowboy for some amount of damage, setting isDead if it dies
     *
     * @param {number} damage - how much damage to do to this
     */
    damage: function(damage) {
        this.health = Math.max(0, this.health - damage);
        if(this.health === 0) {
            this.isDead = true;
            this.canMove = false;
            this.tile.cowboy = null;
            this.tile = null;
            this.owner.opponent.kills++;
        }
    },

    /**
     * Tries to invalidate the args for the Sharpshooter's act
     *
     * @see Cowboy#act
     * @param {Player} player - the player making the cowboy act
     * @param {Tile} tile - the tile the cowboy wants to act on
     * @returns {string|undefined} the invalid reason if invalid (format not invoked against it), undefined if valid
     */
    invalidateSharpshooter: function(player, tile) {
        if(this.focus < 1) {
            return `${this} needs focus to act. Currently has ${this.focus} focus.`;
        }

        if(!this.tile.adjacentDirection(tile)) {
            return `${tile} is not adjacent to the Tile that {this} is on (${this.tile}).`;
        }
    },

    /**
     * makes a Sharpshooter cowboy act
     *
     * @see Cowboy#act
     * @param {Player} player - the player making the cowboy act
     * @param {Tile} tile - the tile the cowboy wants to act on
     * @returns {boolean} true because it worked
     */
    actSharpshooter: function(player, tile) {
        var shot = tile;
        var distance = this.focus;
        while(shot && distance > 0) { // shoot things
            distance--; // yes we could do this above but it reads stupid

            if(!shot || shot.isBalcony) {
                break; // we are done
            }

            if(shot.cowboy) {
                shot.cowboy.damage(this.game.sharpshooterDamage);
            }

            if(shot.furnishing) {
                shot.furnishing.damage(this.game.sharpshooterDamage);
            }

            if(shot.bottle) {
                shot.bottle.break();
            }

            shot = shot.getNeighbor(this.tile.adjacentDirection(tile));
        }

        this.focus = 0;
        this.turnsBusy = 1;

        return true;
    },

    /**
     * Tries to invalidate the args for the Bartender's act
     *
     * @see Cowboy#act
     * @param {Player} player - the player making the cowboy act
     * @param {Tile} tile - the tile the cowboy wants to act on
     * @param {string} drunkDirection - the direction the player wants drunks hit by the bottle to go
     * @param {Object} args - dictionary of actual args to update
     * @returns {string|undefined} the invalid reason if invalid (format not invoked against it), undefined if valid
     */
    invalidateBartender: function(player, tile, drunkDirection, args) {
        let validDrunkDirection = false;
        var simple = drunkDirection[0].toLowerCase();
        for(var i = 0; i < this.game.tileDirections.length; i++) {
            var direction = this.game.tileDirections[i];
            var dir = direction[0].toLowerCase(); // so we can check just the first two letters if they are the same, so we can be lax on input

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
     * Called when a brawler wants to act
     *
     * @see Cowboy#act
     * @returns {boolean} false, Brawlers cannot act
     */
    actBrawler: function() {
        return false;
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
    },

    /**
     * string coercion override
     *
     * @override
     * @returns {string} string stating what this cowboy is
     */
    toString: function() {
        return "'{job}' {gameObjectName} #{id}".format(this);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Cowboy;

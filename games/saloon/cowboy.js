// Cowboy: A person on the map that can move around and interact within the saloon.

var Class = require("classe");
var log = require(__basedir + "/gameplay/log");
var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Cowboy: A person on the map that can move around and interact within the saloon.
var Cowboy = Class(GameObject, {
    /**
     * Initializes Cowboys.
     *
     * @param {Object} data - a simple mapping passsed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

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
     * Does their job's action on a Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want this Cowboy to act on.
     * @param {string} drunkDirection - The direction the bottle will cause drunk cowboys to be in, can be 'North', 'East', 'South', or 'West'.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the act worked, false otherwise.
     */
    act: function(player, tile, drunkDirection, asyncReturn) {
        // <<-- Creer-Merge: act -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var reason = this._check(player, tile);

        if(this.turnsBusy > 0) {
            reason = "{this} is busy and cannot act this turn for {this.turnsBusy} more turns.";
        }

        // job specific acts
        if(!reason) {
            reason = this["act" + this.job.replace(" ", "")].apply(this, arguments);
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                player,
                tile,
            }));
        }

        return true;

        // <<-- /Creer-Merge: act -->>
    },

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile you want to move this Cowboy to.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the move worked, false otherwise.
     */
    move: function(player, tile, asyncReturn) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var reason = this._check(player, tile);

        if(!this.canMove) {
            reason = "{this} has already moved.";
        }
        else if(tile) { // check if blocked or not adjacent
            if(this.tile && !this.tile.getNeighbors().contains(tile)) {
                reason = "{tile} is not adjacent to {this.tile}";
            }
            else if(tile.isBalcony) {
                reason = "{tile} is a balcony and cannot be moved onto.";
            }
            else if(tile.cowboy) {
                reason = "{tile} is blocked by {tile.cowboy} and cannot be moved into.";
            }
            else if(tile.furnishing) {
                reason = "{tile} is blocked by {tile.furnishing} and cannot be moved into.";
            }
        }

        if(this.isDead) {
            reason = "{this} is dead and cannot move.";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                player,
                tile,
            }));
        }

        // if we got here it was valid!
        this.tile.cowboy = null; // remove me from the tile I was on
        tile.cowboy = this;
        this.tile = tile; // and move me to the new tile
        this.canMove = false; // and mark me as having moved this turn

        if(this.job === "Sharpshooter") {
            this.focus = 0;
        }

        return true;

        // <<-- /Creer-Merge: move -->>
    },

    /**
     * Sits down and plays a piano.
     *
     * @param {Player} player - the player that called this.
     * @param {Furnishing} piano - The Furnishing that is a piano you want to play.
     * @param {function} asyncReturn - if you nest orders in this function you must return that value via this function in the order's callback.
     * @returns {boolean} True if the play worked, false otherwise.
     */
    play: function(player, piano, asyncReturn) {
        // <<-- Creer-Merge: play -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var reason = this._check(player, piano && piano.tile);

        if(this.turnsBusy > 0) {
            reason = "{this} is busy and cannot act this turn for {this.turnsBusy} more turns.";
        }
        else if(!piano || !piano.isPiano) {
            reason = "{piano} is not a piano to play";
        }

        if(reason) {
            return this.game.logicError(false, reason.format({
                this: this,
                player,
                piano,
            }));
        }

        // if we got here the play() was valid. play that piano!

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
    _check: function(player, tile) {
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
            this.tile.cowboy = null;
            this.tile = null;
        }
    },

    /**
     * makes a Sharpshooter cowboy act
     *
     * @see Cowboy#act
     * @param {Player} player - the player making the cowboy act
     * @param {Tile} tile - the tile the cowboy wants to act on
     * @returns {string|undefined} the invalid reason if invalid (format not invoked against it), undefined if valid
     */
    actSharpshooter: function(player, tile) {
        if(this.focus < 1) {
            return "{this} needs focus to act. Currently has {this.focus} focus.";
        }

        var adjacentDirection;
        if(tile) { // make sure the tile is a valid target for the Sharpshooter to fire at
            adjacentDirection = this.tile.adjacentDirection(tile);
            if(!adjacentDirection) {
                return "{tile} is not adjacent to the Tile {this} is on ({this.tile}).";
            }
        }

        // if we got here the sharpshooter act is valid
        var shot = tile;
        while(shot && this.focus > 0) { // shoot things
            this.focus--; // yes we could do this above but it reads stupid
            shot = shot["tile" + adjacentDirection];
            if(!shot || shot.isBalcony) {
                break; // we are done
            }

            if(shot.cowboy) {
                shot.cowboy.damage(1);
            }

            if(shot.furnishing) {
                shot.furnishing.damage(1);
            }
        }

        this.focus = 0;
        this.turnsBusy = 1;
    },

    /**
     * makes a Bartender cowboy act
     *
     * @see Cowboy#act
     * @param {Player} player - the player making the cowboy act
     * @param {Tile} tile - the tile the cowboy wants to act on
     * @param {string} drunkDirection - the direction the player wants drunks hit by the bottle to go
     * @returns {string|undefined} the invalid reason if invalid (format not invoked against it), undefined if valid
     */
    actBartender: function(player, tile, drunkDirection) {
        var validDrunkDirection = false;
        var simple = drunkDirection.toLowerCase()[0];
        for(var i = 0; i < this.game.tileDirections.length; i++) {
            var direction = this.game.tileDirections[i];
            var dir = direction.toLowerCase()[0]; // so we can check just the first two letters if they are the same, so we can be lax on input

            if(simple === dir) {
                validDrunkDirection = direction;
                break;
            }
        }

        if(!validDrunkDirection) {
            return "{drunkDirection} is not a valid direction to send drunk Cowboys hit by {this}'s Bottles.".format({this: this, drunkDirection});
        }

        var adjacentDirection;
        if(tile) { // make sure the tile is a valid target for the Bartender to spawn a bottle on
            adjacentDirection = this.tile.adjacentDirection(tile);
            if(!adjacentDirection) {
                return "{tile} is not adjacent to the Tile {this} is on ({this.tile}).";
            }
        }

        // if we got here the bartender's act is valid
        var bottle = this.game.create("Bottle", {
            tile: tile,
            drunkDirection: validDrunkDirection,
            direction: adjacentDirection,
        });

        this.turnsBusy = 5;
    },

    /**
     * Called when a brawler wants to act
     *
     * @see Cowboy#act
     * @returns {string} invalid reason string
     */
    actBrawler: function() {
        return "{this} cannot act because they are a 'Brawler'.";
    },

    /**
     * string coercian override
     * @override
     * @returns {string} string stating what this cowboy is
     */
    toString: function() {
        return "'{job}' {gameObjectName} #{id}".format(this);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Cowboy;

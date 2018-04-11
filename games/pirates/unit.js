// Unit: A unit group in the game. This may consist of a ship and any number of crew.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Unit: A unit group in the game. This may consist of a ship and any number of crew.
let Unit = Class(GameObject, {
    /**
     * Initializes Units.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * Whether this Unit has performed its action this turn.
         *
         * @type {boolean}
         */
        this.acted = this.acted || false;

        /**
         * How many crew are on this Tile. This number will always be <= crewHealth.
         *
         * @type {number}
         */
        this.crew = this.crew || 0;

        /**
         * How much total health the crew on this Tile have.
         *
         * @type {number}
         */
        this.crewHealth = this.crewHealth || 0;

        /**
         * How much gold this Unit is carrying.
         *
         * @type {number}
         */
        this.gold = this.gold || 0;

        /**
         * How many more times this Unit may move this turn.
         *
         * @type {number}
         */
        this.moves = this.moves || 0;

        /**
         * The Player that owns and can control this Unit, or null if the Unit is neutral.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * (Merchants only) The path this Unit will follow. The first element is the Tile this Unit will move to next.
         *
         * @type {Array.<Tile>}
         */
        this.path = this.path || [];

        /**
         * If a ship is on this Tile, how much health it has remaining. 0 for no ship.
         *
         * @type {number}
         */
        this.shipHealth = this.shipHealth || 0;

        /**
         * (Merchants only) The Port this Unit is moving to.
         *
         * @type {Port}
         */
        this.targetPort = this.targetPort || null;

        /**
         * The Tile this Unit is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.acted = data.acted || true;
        this.crew = data.crew || 0;
        this.crewHealth = data.crewHealth || this.crew * this.game.crewHealth;
        this.gold = data.gold || 0;
        this.moves = data.moves || 0;
        this.owner = data.owner || null;
        this.path = data.path || [];
        this.shipHealth = data.shipHealth || this.game.shipHealth;
        this.targetPort = data.targetPort || null;
        this.tile = data.tile || null;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Unit",


    /**
     * Invalidation function for attack
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @param {string} target - Whether to attack 'crew', 'ship', or 'port'. Crew deal damage to crew, and ships deal damage to ships and ports. Consumes any remaining moves.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateAttack: function(player, tile, target, args) {
        // <<-- Creer-Merge: invalidateAttack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: try to invalidate the game logic for Unit's attack function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateAttack -->>
    },

    /**
     * Attacks either crew, a ship, or a port on a Tile in range.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @param {string} target - Whether to attack 'crew', 'ship', or 'port'. Crew deal damage to crew, and ships deal damage to ships and ports. Consumes any remaining moves.
     * @returns {boolean} True if successfully attacked, false otherwise.
     */
    attack: function(player, tile, target) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's attack function here
        return false;

        // <<-- /Creer-Merge: attack -->>
    },


    /**
     * Invalidation function for build
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to build the Port on.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateBuild: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateBuild -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: try to invalidate the game logic for Unit's build function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateBuild -->>
    },

    /**
     * Builds a Port on the given Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to build the Port on.
     * @returns {boolean} True if successfully constructed a Port, false otherwise.
     */
    build: function(player, tile) {
        // <<-- Creer-Merge: build -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's build function here
        return false;

        // <<-- /Creer-Merge: build -->>
    },


    /**
     * Invalidation function for bury
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - How much gold this Unit should bury.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateBury: function(player, amount, args) {
        // <<-- Creer-Merge: invalidateBury -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, false);
        if(reason) {
            return reason;
        }

        if(this.tile.type !== "land" || this.tile.port) {
            return `Ye can't bury gold at ${this.tile}!`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateBury -->>
    },

    /**
     * Buries gold on this Unit's Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - How much gold this Unit should bury.
     * @returns {boolean} True if successfully buried, false otherwise.
     */
    bury: function(player, amount) {
        // <<-- Creer-Merge: bury -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(amount <= 0) {
            amount = this.gold;
        }
        else {
            amount = Math.min(this.gold, amount);
        }

        this.tile.gold += amount;
        this.gold -= amount;

        return true;

        // <<-- /Creer-Merge: bury -->>
    },


    /**
     * Invalidation function for deposit
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - The amount of gold to deposit. Amounts <= 0 will deposit all the gold on this Unit.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateDeposit: function(player, amount, args) {
        // <<-- Creer-Merge: invalidateDeposit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: try to invalidate the game logic for Unit's deposit function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateDeposit -->>
    },

    /**
     * Puts gold into an adjacent Port. If that Port is the Player's main port, the gold is added to that Player. If that Port is owned by merchants, adds to the investment.
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - The amount of gold to deposit. Amounts <= 0 will deposit all the gold on this Unit.
     * @returns {boolean} True if successfully deposited, false otherwise.
     */
    deposit: function(player, amount) {
        // <<-- Creer-Merge: deposit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's deposit function here
        return false;

        // <<-- /Creer-Merge: deposit -->>
    },


    /**
     * Invalidation function for dig
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - How much gold this Unit should take. Amounts <= 0 will dig up as much as possible.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateDig: function(player, amount, args) {
        // <<-- Creer-Merge: invalidateDig -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        
        // Developer: try to invalidate the game logic for Unit's dig function here
        
        // Checking to make sure its the players turn
        if(!player || player !== this.game.currentPlayer)
        {
            return `Avast ye, its not yer turn, ${player}!`;
        }

        // Checking to see if the player is the owner.
        if(player !== this.owner)
        {
            return `Avast ye, ${this} isnt yers!`;
        }
        // Checking to see if the tile is anything other than a land type.
        if(this.tile.type !== "land")
        {
            return "Avast ye, Ye can't dig in the Sea!";
        }
        // Checking to see if the tile has gold to be dug up.
        else if (this.tile.gold === 0)
        {
            return "Avest ye, there be no booty in ground!";
        } 
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateDig -->>
    },

    /**
     * Digs up gold on this Unit's Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - How much gold this Unit should take. Amounts <= 0 will dig up as much as possible.
     * @returns {boolean} True if successfully dug up, false otherwise.
     */
    dig: function(player, amount) {
        // <<-- Creer-Merge: dig -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's dig function here

        // If the amount requested is <= 0 or greater than what is current give all.
        if(amount <= 0 || amount > this.tile.gold)
        {
            // Adds the amount of gold from the current tile to the Unit.
            this.gold += this.tile.gold;
            // Sets the gold on tile to 0.
            this.tile.gold = 0;
            return true;
        }
        // Else if amount is less than what is there take that amount.
        else if(amount > 0 && amount <= this.tile.gold)
        {
            // Adds amount requested to Unit.
            this.gold += amount;
            // Subtracts amount from Tile's gold
            this.tile.gold -= amount;
            return true;
        }
        return false;

        // <<-- /Creer-Merge: dig -->>
    },


    /**
     * Invalidation function for move
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Unit should move to.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateMove: function(player, tile, args) {
        // <<-- Creer-Merge: invalidateMove -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, false);
        if(reason) {
            return reason;
        }

        const ship = this.shipHealth > 0;
        if(this.moves <= 0) {
            return `${this}'s crew are too tired to travel any further.`;
        }
        if(this.acted) {
            return `${this} cannot move after acting. The men are too tired!`;
        }
        if(!tile) {
            return `${this} must have a destination to move to.`;
        }
        if(this.tile.tileEast !== tile && this.tile.tileNorth !== tile && this.tile.tileWest !== tile && this.tile.tileSouth !== tile) {
            return `${tile} be too far for ${this} to move to.`;
        }
        if(tile.unit && tile.unit.owner !== player && tile.unit.owner !== null) {
            return `${this} refuses to share the same ground with a living foe.`;
        }
        if(!ship && tile.type === "water" && !tile.port) {
            return `${this} has no ship and can't walk on water!`;
        }
        if(ship && tile.type === "land") {
            return `Land ho! ${this} belongs in the sea! Use 'Unit.split' if you want to move just your crew ashore.`;
        }
        if(ship && tile.shipHealth > 0) {
            return `There's a ship there. If ye move ${this} to ${tile}, ye'll scuttle yer ship!`;
        }
        if(!ship && tile.ship && this.acted) {
            return `${this} already acted and is too tired to board that ship.`;
        }
        if(tile.port && tile.port.owner !== player) {
            return `${this} cannot enter an enemy port!`;
        }
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Unit should move to.
     * @returns {boolean} True if it moved, false otherwise.
     */
    move: function(player, tile) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(tile.unit) {
            // Calculate remaining moves
            let move = tile.unit.moves;
            if(move > this.moves - 1) {
                move = this.moves - 1;
            }
            tile.unit.moves = move;

            // Move over crew and gold
            tile.unit.crew += this.crew;
            tile.unit.crewHealth += this.crewHealth;
            tile.unit.gold += this.gold;

            // Remove this crew
            this.tile.unit = null;
            this.tile = null;

            // If boarding a ship, consume an action
            if(tile.unit.shipHealth > 0) {
                tile.acted = true;
            }
        }
        else {
            // Move this unit to that tile
            this.tile.unit = null;
            this.tile = tile;
            tile.unit = this;
            this.moves -= 1;
        }

        return true;

        // <<-- /Creer-Merge: move -->>
    },


    /**
     * Invalidation function for rest
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to move the crew to.
     * @param {number} amount - The number of crew to move onto that Tile. Amount <= 0 will move all the crew to that Tile.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateRest: function(player, tile, amount, args) {
        // <<-- Creer-Merge: invalidateRest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, true);
        if(reason) {
            return reason;
        }

        // Search for a nearby port
        const found = this.owner.ports.find(port => {
            // Make sure port isn't destroyed
            if(!port.tile) {
                return false;
            }

            // Check if it's in range
            const radius = this.game.restRange;
            return Math.pow(this.tile.x - port.tile.x, 2) + Math.pow(this.tile.y - port.tile.y, 2) <= radius * radius;
        }, this);
        if(!found) {
            return `${this} has no nearby port to rest at. No home tavern means no free rum!`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateRest -->>
    },

    /**
     * Regenerates this Unit's health. Must be used in range of a port.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to move the crew to.
     * @param {number} amount - The number of crew to move onto that Tile. Amount <= 0 will move all the crew to that Tile.
     * @returns {boolean} True if successfully split, false otherwise.
     */
    rest: function(player, tile, amount) {
        // <<-- Creer-Merge: rest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Heal the units
        this.crewHealth += Math.ceil(this.game.crewHealth * this.game.healFactor) * this.crew;
        if(this.shipHealth > 0) {
            this.shipHealth += Math.ceil(this.game.shipHealth * this.game.healFactor);
        }

        // Make sure the unit can't do anything else this turn
        this.acted = true;
        this.moves = 0;

        return true;

        // <<-- /Creer-Merge: rest -->>
    },


    /**
     * Invalidation function for split
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to move the crew to.
     * @param {number} amount - The number of crew to move onto that Tile. Amount <= 0 will move all the crew to that Tile.
     * @param {number} gold - The amount of gold the crew should take with them. Gold < 0 will move all the gold to that Tile.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateSplit: function(player, tile, amount, gold, args) {
        // <<-- Creer-Merge: invalidateSplit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, true);
        if(reason) {
            return reason;
        }

        // Check to see if the crew has a move to move
        if(this.unit.moves === 0) {
            return `${this} can't split cause they be out of moves.`;
        }

        // Check to see if they have already acted.
        if(this.acted) {
            return `${this} crew are too tired to split!`;
        }

        // Check to see if it is not one of the tiles around in the current direction
        if(this.tile.tileEast !== tile && this.tile.tileNorth !== tile && this.tile.tileWest !== tile && this.tile.tileSouth !== tile) {
            return `${tile} be too far for ${this} to split to.`;
        }

        // Check to make sure target tile is a valid tile
        if(tile.type !== "land" && tile.unit.shipHealth <= 0 && tile.port === null) {
            return `${this} can't split here!`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateSplit -->>
    },

    /**
     * Moves a number of crew from this Unit to the given Tile. This will consume a move from those crew.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to move the crew to.
     * @param {number} amount - The number of crew to move onto that Tile. Amount <= 0 will move all the crew to that Tile.
     * @param {number} gold - The amount of gold the crew should take with them. Gold < 0 will move all the gold to that Tile.
     * @returns {boolean} True if successfully split, false otherwise.
     */
    split: function(player, tile, amount, gold) {
        // <<-- Creer-Merge: split -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // TO-DO implement moving to ships and ports as well.
        // Set the owner of the new unit to current player
        tile.unit.owner = this.owner;

        if(tile.type === "water" && tile.unit.shipHealth > 0) {
            tile.unit.acted = true;
        }

        // Adjust the amount of crew to split
        if(amount <= 0) {
            amount = this.crew;
        }
        else {
            amount = Math.min(amount, this.crew);
        }

        // Adjust the amount of gold to move
        if(gold < 0) {
            gold = this.gold;
        }
        else {
            gold = Math.min(gold, this.gold);
        }

        // Some helpful constants
        const movePercent = amount / this.crew;
        const stayPercent = 1 - movePercent;

        // Move crew to new tile
        tile.unit.crew += this.crew;
        this.crew -= amount;

        // Give new Unit health from old one
        tile.unit.crewHealth += Math.ceil(this.crewHealth * movePercent);
        this.crewHealth = Math.floor(this.crewHealth * stayPercent);

        // Move gold to new Unit
        tile.unit.gold += gold;
        this.gold -= gold;

        // Set moves for the units that moved
        tile.moves = Math.min(this.moves - 1, tile.moves);

        if(movePercent >= 1) {
            // Disassociating from old Tile if all the crew moved
            this.owner = null;
            if(this.shipHealth <= 0) {
                // If no units are left over, remove the unit
                this.tile.unit = null;
                this.tile = null;
            }
        }

        return true;

        // <<-- /Creer-Merge: split -->>
    },


    /**
     * Invalidation function for withdraw
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - The amount of gold to withdraw. Amounts <= 0 will withdraw everything.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateWithdraw: function(player, amount, args) {
        // <<-- Creer-Merge: invalidateWithdraw -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, true);
        if(reason) {
            return reason;
        }

        if(this.tile !== player.startingPort) {
            return `Argh, ${this} cannot be takin' gold from anywhere but yer starting port!`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateWithdraw -->>
    },

    /**
     * Takes gold from the Player. You can only withdraw from your main port.
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - The amount of gold to withdraw. Amounts <= 0 will withdraw everything.
     * @returns {boolean} True if successfully withdrawn, false otherwise.
     */
    withdraw: function(player, amount) {
        // <<-- Creer-Merge: withdraw -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(amount <= 0) {
            // Take all the gold
            this.gold += player.gold;
            player.gold = 0;
        }
        else if(player.gold >= amount) {
            // Take some of the gold
            this.gold += amount;
            player.gold -= amount;
        }
        else if(player.gold <= amount) {
            // amount > player.gold, so just take it all
            this.gold += player.gold;
            player.gold = 0;
        }

        // Developer: Put your game logic for the Unit's withdraw function here
        return true;

        // <<-- /Creer-Merge: withdraw -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Tries to invalidate args for an action function
     *
     * @param {Player} player - the player commanding this Unit
     * @param {boolean} [checkAction] - true to check if this Unit has an action
     * @returns {string|undefined} the reason this is invalid, undefined if looks valid so far
     */
    _invalidate: function(player, checkAction) {
        if(!player || player !== this.game.currentPlayer) {
            return `Avast ye, it ain't yer turn, ${player}.`;
        }

        if(this.owner !== player) {
            return `${this} ain't among yer crew.`;
        }

        if(checkAction && this.acted) {
            return `${this} can't perform another action this turn.`;
        }
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Unit;

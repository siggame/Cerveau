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
         * @type {Tile}
         */
        this.path = this.path || null;

        /**
         * If a ship is on this Tile, how much health it has remaining. 0 for no ship.
         *
         * @type {number}
         */
        this.shipHealth = this.shipHealth || 0;

        /**
         * The Tile this Unit is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // put any initialization logic here. the base variables should be set from 'data' above

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

        // Developer: try to invalidate the game logic for Unit's bury function here
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

        // Developer: Put your game logic for the Unit's bury function here
        return false;

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

        // Developer: try to invalidate the game logic for Unit's move function here
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

        // Developer: Put your game logic for the Unit's move function here
        return false;

        // <<-- /Creer-Merge: move -->>
    },


    /**
     * Invalidation function for split
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to move the crew to.
     * @param {number} amount - The number of crew to move onto that Tile. Amount <= 0 will move all the crew to that Tile.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateSplit: function(player, tile, amount, args) {
        // <<-- Creer-Merge: invalidateSplit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: try to invalidate the game logic for Unit's split function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateSplit -->>
    },

    /**
     * Move a number of crew to Tile. This will consume a move from those crew.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to move the crew to.
     * @param {number} amount - The number of crew to move onto that Tile. Amount <= 0 will move all the crew to that Tile.
     * @returns {boolean} True if successfully split, false otherwise.
     */
    split: function(player, tile, amount) {
        // <<-- Creer-Merge: split -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Developer: Put your game logic for the Unit's split function here
        return false;

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
		if (this.tile != player.startingPort) {
			return "Argh, Yee cannot be takin gold from anywhere but yer starting port!";
		}
		if (typeof(amount) != "number") {
			return "Argh, Amount is of the wrong type!";
		}
		if (typeof(player) != "player") {
			return "That Player isn't of type player!";
		}
        // Developer: try to invalidate the game logic for Unit's withdraw function here
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
		if (this.tile == player.startingPort) {
			if (amount <= 0) {
				player.gold = 0;
				return true;
			} else if (player.gold >= amount) {
				player.gold -= amount;
				return true;
			} else if (player.gold <= amount) {
				player.gold = 0;
				return true;
			}
		}
        // Developer: Put your game logic for the Unit's withdraw function here
        return false;

        // <<-- /Creer-Merge: withdraw -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Unit;

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
         * (Merchants only) The number of turns this merchant ship won't be able to move. They will still attack. Merchant ships are stunned when they're attacked.
         *
         * @type {number}
         */
        this.stunTurns = this.stunTurns || 0;

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
        this.shipHealth = data.shipHealth || 0;
        this.targetPort = data.targetPort || null;
        this.tile = data.tile || null;
        this.stunTurns = data.stunTurns || 0;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Unit",


    /**
     * Invalidation function for attack
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @param {string} target - Whether to attack 'crew' or 'ship'. Crew deal damage to crew and ships deal damage to ships. Consumes any remaining moves.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateAttack: function(player, tile, target, args) {
        // <<-- Creer-Merge: invalidateAttack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, true);
        if(reason) {
            return reason;
        }

        if(!tile) {
            return `${this} needs to know which tile to attack!`;
        }

        let t = target.charAt(0).toUpperCase();
        if(t === "C") {
            if(!tile.unit) {
                return `There be nothin' for ${this} to attack on ${tile}!`;
            }
            if(tile.unit.player === player) {
                return `${this} doesn't have time for a mutany! Don't be attackin' yer own men!`;
            }
            if(tile.unit.crew <= 0) {
                return `${tile} has got no crew for you to attack!`;
            }

            let dx = this.tile.x - tile.x;
            let dy = this.tile.y - tile.y;
            let distSq = dx * dx + dy * dy;
            if(distSq > this.game.crewRange * this.game.crewRange) {
                return `${this} isn't in range for that attack. Yer swords don't reach off yonder!`;
            }
        }
        else if(t === "S") {
            if(!tile.unit) {
                return `There be nothin' for ${this} to attack on ${tile}!`;
            }
            if(tile.unit.shipHealth <= 0) {
                return `There be no ship for ${this} to attack.`;
            }
            if(this.shipHealth <= 0) {
                return `${this} has no ship to perform the attack.`;
            }
            if(tile.unit.player === player) {
                return `${this} doesn't have time for a mutany! Don't be attackin' yer own ship!`;
            }

            let dx = this.tile.x - tile.x;
            let dy = this.tile.y - tile.y;
            let distSq = dx * dx + dy * dy;
            if(distSq > this.game.shipRange * this.game.shipRange) {
                return `${this} isn't in range for that attack. Ye don't wanna fire blindly into the wind!`;
            }
        }
        else {
            return `${this} needs to attack somethin' valid ('ship' or 'crew'), not '${target}'.`;
        }

        // Developer: try to invalidate the game logic for Unit's attack function here
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateAttack -->>
    },

    /**
     * Attacks either the 'crew' or 'ship' on a Tile in range.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile to attack.
     * @param {string} target - Whether to attack 'crew' or 'ship'. Crew deal damage to crew and ships deal damage to ships. Consumes any remaining moves.
     * @returns {boolean} True if successfully attacked, false otherwise.
     */
    attack: function(player, tile, target) {
        // <<-- Creer-Merge: attack -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        target = target.charAt(0).toUpperCase();

        let deadCrew = 0;
        let deadShips = 0;
        let gold = 0;
        let merchant = tile.unit.targetPort !== null;
        if(target === "C") {
            // Crew attacking crew
            tile.unit.crewHealth -= this.game.crewDamage * this.crew;
            tile.unit.crewHealth = Math.max(0, tile.unit.crewHealth);

            // For counting the dead accurately
            if(tile.unit.crew > tile.unit.crewHealth) {
                deadCrew = tile.unit.crew - tile.unit.crewHealth;
                tile.unit.crew = tile.unit.crewHealth;
            }

            // Check if the crew was completely destroyed
            if(tile.unit.crewHealth <= 0) {
                if(tile.unit.shipHealth <= 0) {
                    gold += tile.unit.gold;

                    // Mark it as dead
                    tile.unit.tile = null;
                    tile.unit = null;
                }
                else {
                    tile.unit.owner = null;
                    tile.unit.shipHealth = 1;

                    // Make sure it's not a merchant ship anymore either
                    tile.unit.targetPort = null;
                    tile.unit.path = [];
                }
            }
        }
        else {
            // Ship attacking ship
            tile.unit.shipHealth -= this.game.shipDamage;
            tile.unit.shipHealth = Math.max(0, tile.unit.shipHealth);

            // Check if ship was destroyed
            if(tile.unit.shipHealth <= 0) {
                deadShips += 1;
                gold += tile.unit.gold;

                // Mark it as dead
                tile.unit.tile = null;
                tile.unit = null;
            }
        }

        // Infamy

        this.acted = true;
        this.gold += gold;

        // Calculate the infamy factor
        let factor = 1;
        if(!merchant) {
            // Calculate each player's net worth
            let allyWorth = player.netWorth() + player.gold;
            let opponentWorth = player.opponent.netWorth() + player.opponent.gold;
            opponentWorth += deadCrew * this.game.crewCost + deadShips * this.game.shipCost;

            if(allyWorth > opponentWorth) {
                factor = 0.5;
            }
            else if(allyWorth < opponentWorth) {
                factor = 2;
            }
        }

        // Calculate infamy
        let infamy = deadCrew * this.game.crewCost + deadShips * this.game.shipCost;
        infamy *= factor;

        if(!merchant) {
            infamy = Math.min(infamy, player.opponent.infamy);
            player.opponent.infamy -= infamy;
        }

        player.infamy += infamy;

        if(merchant && tile.unit) {
            tile.unit.stunTurns = 2;
        }

        return true;

        // <<-- /Creer-Merge: attack -->>
    },


    /**
     * Invalidation function for bury
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - How much gold this Unit should bury. Amounts <= 0 will bury as much as possible.
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateBury: function(player, amount, args) {
        // <<-- Creer-Merge: invalidateBury -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, false);
        if(reason) {
            return reason;
        }

        if(this.tile.type !== "land") {
            return `${this} can't bury gold on the sea.`;
        }

        if(this.tile.port) {
            return `${this} can't bury gold in ports.`;
        }

        let dx = this.tile.x - player.port.tile.x;
        let dy = this.tile.y - player.port.tile.y;
        let distSq = dx * dx + dy * dy;
        if(distSq < this.game.minInterestDistance * this.game.minInterestDistance) {
            return `${this} is too close to home! Ye gotta bury yer loot far away from yer port.`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateBury -->>
    },

    /**
     * Buries gold on this Unit's Tile. Gold must be a certain distance away for it to get interest (Game.minInterestDistance).
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - How much gold this Unit should bury. Amounts <= 0 will bury as much as possible.
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

        const reason = this._invalidate(player, false);
        if(reason) {
            return reason;
        }

        const tile = player.port.tile;
        if(this.tile !== tile && this.tile.tileEast !== tile && this.tile.tileNorth !== tile && this.tile.tileWest !== tile && this.tile.tileSouth !== tile) {
            return `Arr, ${this} has to deposit yer booty in yer home port, matey!`;
        }

        if(this.gold <= 0) {
            return `Shiver me timbers! ${this} doesn't have any booty to deposit!`;
        }

        if(amount < 0) {
            return `Cor blimey, ${this} can't deposit a negative amount of yer plunder! If ye wanna withdraw gold, then ye gotta use 'Unit.withdraw'.`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateDeposit -->>
    },

    /**
     * Puts gold into an adjacent Port. If that Port is the Player's port, the gold is added to that Player. If that Port is owned by merchants, it adds to that Port's investment.
     *
     * @param {Player} player - the player that called this.
     * @param {number} amount - The amount of gold to deposit. Amounts <= 0 will deposit all the gold on this Unit.
     * @returns {boolean} True if successfully deposited, false otherwise.
     */
    deposit: function(player, amount) {
        // <<-- Creer-Merge: deposit -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(amount > 0 && amount < this.gold) {
            player.gold += amount;
            this.gold -= amount;
            return true;
        }
        else {
            player.gold += this.gold;
            this.gold = 0;
            return true;
        }

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

        const reason = this._invalidate(player, false);
        if(reason) {
            return reason;
        }

        // Checking to see if the tile is anything other than a land type.
        if(this.tile.type !== "land") {
            return `${this} can't dig in the sea!`;
        }

        // Checking to see if the tile has gold to be dug up.
        if(this.tile.gold === 0) {
            return `There be no booty for ${this} to plunder.`;
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

        // If the amount requested is <= 0 or greater than what is current give all.
        if(amount <= 0 || amount > this.tile.gold) {
            // Adds the amount of gold from the current tile to the Unit.
            this.gold += this.tile.gold;
            // Sets the gold on tile to 0.
            this.tile.gold = 0;
            return true;
        }
        // Else if amount is less than what is there take that amount.
        else {
            // Adds amount requested to Unit.
            this.gold += amount;
            // Subtracts amount from Tile's gold
            this.tile.gold -= amount;
            return true;
        }

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
            return `${this} can't move after acting. The men are too tired!`;
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
            return `Land ho! ${this} belongs in the sea! Use 'Unit.split' if ye want to move just yer crew ashore.`;
        }
        if(ship && tile.shipHealth > 0) {
            return `There be a ship there. If ye move ${this} to ${tile}, ye'll scuttle yer ship!`;
        }
        if(!ship && tile.ship && this.acted) {
            return `${this} already acted, and it be too tired to board that ship.`;
        }
        if(tile.port && tile.port.owner !== player) {
            return `${this} can't enter an enemy port!`;
        }
        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateMove -->>
    },

    /**
     * Moves this Unit from its current Tile to an adjacent Tile. If this Unit merges with another one, the other Unit will be destroyed and its tile will be set to null. Make sure to check that your Unit's tile is not null before doing things with it.
     *
     * @param {Player} player - the player that called this.
     * @param {Tile} tile - The Tile this Unit should move to.
     * @returns {boolean} True if it moved, false otherwise.
     */
    move: function(player, tile) {
        // <<-- Creer-Merge: move -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(tile.unit) {
            this.moves--;
            this.mergeOnto(tile.unit);
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
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateRest: function(player, args) {
        // <<-- Creer-Merge: invalidateRest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        const reason = this._invalidate(player, true);
        if(reason) {
            return reason;
        }

        // Check if it's in range
        const radius = this.game.restRange;
        if(Math.pow(this.tile.x - player.port.tile.x, 2) + Math.pow(this.tile.y - player.port.tile.y, 2) > radius * radius) {
            return `${this} has no nearby port to rest at. No home tavern means no free rum!`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateRest -->>
    },

    /**
     * Regenerates this Unit's health. Must be used in range of a port.
     *
     * @param {Player} player - the player that called this.
     * @returns {boolean} True if successfully rested, false otherwise.
     */
    rest: function(player) {
        // <<-- Creer-Merge: rest -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Heal the units
        this.crewHealth += Math.ceil(this.game.crewHealth * this.game.healFactor) * this.crew;
        this.crewHealth = Math.min(this.crewHealth, this.crew * this.game.crewHealth);
        if(this.shipHealth > 0) {
            this.shipHealth += Math.ceil(this.game.shipHealth * this.game.healFactor);
            this.shipHealth = Math.min(this.shipHealth, this.game.shipHealth);
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

        if(!tile) {
            return `${this} can't split onto null!`;
        }

        // Check to see if the crew has a move to move
        if(this.moves <= 0) {
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

        // Create a new unit
        let newUnit = this.game.create("Unit", {
            owner: player,
            tile: tile,
        });

        // Check if boarding a ship
        if(tile.type === "water" && tile.unit.shipHealth > 0) {
            newUnit.acted = true;
        }

        // Adjust the amount of crew to split
        if(amount <= 0) {
            amount = this.crew;
        }
        else {
            amount = Math.min(amount, this.crew);
        }

        // Some helpful constants
        const movePercent = amount / this.crew;
        const stayPercent = 1 - movePercent;

        // Adjust the amount of gold to move
        if(gold < 0 || (movePercent >= 1 && this.shipHealth <= 0)) {
            gold = this.gold;
        }
        else {
            gold = Math.min(gold, this.gold);
        }

        // Move crew to new tile
        newUnit.crew += amount;
        this.crew -= amount;

        // Give new Unit health from old one
        newUnit.crewHealth += Math.ceil(this.crewHealth * movePercent);
        this.crewHealth = Math.floor(this.crewHealth * stayPercent);

        // Move gold to new Unit
        newUnit.gold += gold;
        this.gold -= gold;

        // Set moves for the units that moved
        newUnit.moves = this.moves - 1;

        if(movePercent >= 1) {
            // Disassociating from old Tile if all the crew moved
            this.owner = null;
            if(this.shipHealth <= 0) {
                // If no units are left over, remove the unit
                this.tile.unit = null;
                this.tile = null;
            }
        }

        // Check if merging with another unit
        if(tile.unit) {
            tile.unit.mergeOnto(newUnit);
        }
        else {
            tile.unit = newUnit;
            this.game.newUnits.push(newUnit);
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

        if(!this.tile.port) {
            return `Arr, there be no port on the tile ${this} is on.`;
        }

        if(this.tile.port !== player.port) {
            return `Arr, ${this} can't be takin' gold from anywhere but yer starting port!`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateWithdraw -->>
    },

    /**
     * Takes gold from the Player. You can only withdraw from your own Port.
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
            return `Avast, it isn't yer turn, ${player}.`;
        }

        if(this.owner !== player) {
            return `${this} isn't among yer crew.`;
        }

        if(checkAction && this.acted) {
            return `${this} can't perform another action this turn.`;
        }

        if(!this.tile || this.crew === 0) {
            return `Ye can't control ${this}.`;
        }
    },

    mergeOnto: function(other) {
        this.tile.unit = null;
        other.tile.unit = this;
        this.tile = other.tile;
        other.tile = null;

        this.crew += other.crew;
        this.crewHealth += other.crewHealth;
        this.shipHealth += other.shipHealth;
        this.gold += other.gold;
        this.acted &= other.acted;
        this.moves = Math.min(this.moves, other.moves);
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Unit;

// Port: A port on a Tile.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Port: A port on a Tile.
let Port = Class(GameObject, {
    /**
     * Initializes Ports.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        GameObject.init.apply(this, arguments);

        /**
         * Whether this Port has created a Unit this turn.
         *
         * @type {boolean}
         */
        this.cooldown = this.cooldown || false;

        /**
         * Whether this Port can be destroyed.
         *
         * @type {number}
         */
        this.destroyable = this.destroyable || 0;

        /**
         * (Merchants only) How much gold this Port has accumulated. Once this port can afford to create a ship, it will spend gold to construct one.
         *
         * @type {number}
         */
        this.gold = this.gold || 0;

        /**
         * How much health this Port has.
         *
         * @type {number}
         */
        this.health = this.health || 0;

        /**
         * (Merchants only) How much gold this Port accumulates each turn.
         *
         * @type {number}
         */
        this.investment = this.investment || 0;

        /**
         * The owner of this Port, or null if owned by merchants.
         *
         * @type {Player}
         */
        this.owner = this.owner || null;

        /**
         * The Tile this Port is on.
         *
         * @type {Tile}
         */
        this.tile = this.tile || null;


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.cooldown = data.cooldown || false;
        this.destroyable = data.destroyable || false;
        this.gold = data.gold || 0;
        this.health = data.health || this.game.portHealth;
        this.investment = data.investment || 0;
        this.owner = data.owner || null;
        this.tile = data.tile || null;

        //<<-- /Creer-Merge: init -->>
    },

    gameObjectName: "Port",


    /**
     * Invalidation function for spawn
     * Try to find a reason why the passed in parameters are invalid, and return a human readable string telling them why it is invalid
     *
     * @param {Player} player - the player that called this.
     * @param {string} type - What type of Unit to create ('crew' or 'ship').
     * @param {Object} args - a key value table of keys to the arg (passed into this function)
     * @returns {string|undefined} a string that is the invalid reason, if the arguments are invalid. Otherwise undefined (nothing) if the inputs are valid.
     */
    invalidateSpawn: function(player, type, args) {
        // <<-- Creer-Merge: invalidateSpawn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(this.owner !== player) {
            return "This ain't yer port.";
        }

        if(player !== this.game.currentPlayer) {
            return `Avast ye, it ain't yer turn, ${player}.`;
        }

        let t = type.charAt(0).toUpperCase();
        if(t === "C") { // Crew
            if(player.gold <= this.game.crewCost) {
                return "Ye don't have enough gold to spawn a crew." ;
            }
        }
        else if(t === "S") { // Ships
            if(player.gold <= this.game.shipCost) {
                return "Ye don't have enough gold to spawn a ship." ;
            }

            if(this.tile.unit && this.tile.unit.shipHealth > 0) {
                return "There don't be enough space in a port for two ships";
            }
        }
        else { // Invalid
            return `'${type}' ain't a unit type, scallywag! Ye gotta use 'crew' or 'ship'.`;
        }

        return undefined; // meaning valid

        // <<-- /Creer-Merge: invalidateSpawn -->>
    },

    /**
     * Spawn a Unit on this port.
     *
     * @param {Player} player - the player that called this.
     * @param {string} type - What type of Unit to create ('crew' or 'ship').
     * @returns {boolean} True if Unit was created successfully, false otherwise.
     */
    spawn: function(player, type) {
        // <<-- Creer-Merge: spawn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        type = type.charAt(0).toUpperCase();

        // Make sure there's a unit on this tile
        if(!this.tile.unit) {
            this.tile.unit = this.game.create("Unit", {
                owner: player,
                tile: this.tile,
            });
            this.game.newUnits.push(this.tile.unit);
        }

        if(type === "C")		{
            this.tile.unit.crew++;
            this.tile.unit.crewHealth += this.game.crewHealth;
            this.tile.unit.acted = true;
            this.tile.unit.moves = 0;
            player.gold -= this.game.crewCost;

        }
        if(type === "S")		{
            this.tile.unit.shipHealth = this.game.shipHealth;
            this.tile.unit.acted = true;
            this.tile.unit.moves = 0;
            player.gold -= this.game.shipCost;
        }

        return true;

        // <<-- /Creer-Merge: spawn -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Port;

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
         * For players, how much more gold this Port can spend this turn. For merchants, how much gold this Port has accumulated (it will spawn a ship when the Port can afford one).
         *
         * @type {number}
         */
        this.gold = this.gold || 0;

        /**
         * (Merchants only) How much gold was invested into this Port. Investment determines the strength and value of the next ship.
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

        this.gold = data.gold || 0;
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
            return `${this} isn't yer port.`;
        }

        if(player !== this.game.currentPlayer) {
            return `Avast, it ain't yer turn, ${player}.`;
        }

        let t = type.charAt(0).toUpperCase();
        if(t === "C") { // Crew
            if(player.gold < this.game.crewCost) {
                return `Ye don't have enough gold to spawn a crew at ${this}.`;
            }

            if(this.gold < this.game.crewCost) {
                return `${this} can't spend enough gold to spawn a crew this turn! Ye gotta wait til next turn.`;
            }
        }
        else if(t === "S") { // Ships
            if(player.gold < this.game.shipCost) {
                return `Ye don't have enough gold to spawn a ship at ${this}.`;
            }

            if(this.gold < this.game.crewCost) {
                return `${this} can't spend enough gold to spawn a ship this turn! Ye gotta wait til next turn.`;
            }

            if(this.tile.unit && this.tile.unit.shipHealth > 0) {
                return `Blimey! There isn't enough space in ${this} to spawn a ship.`;
            }
        }
        else { // Invalid
            return `'${type}' isn't a unit type, scallywag! Ye gotta use 'crew' or 'ship'.`;
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
                owner: null,
                tile: this.tile,
            });
            this.game.newUnits.push(this.tile.unit);
        }

        if(type === "C")		{
            this.tile.unit.crew++;
            this.tile.unit.crewHealth += this.game.crewHealth;
            this.tile.unit.acted = true;
            this.tile.unit.moves = 0;
            this.tile.unit.owner = player;
            player.gold -= this.game.crewCost;
            this.gold -= this.game.crewCost;
        }
        else {
            this.tile.unit.shipHealth = this.game.shipHealth;
            this.tile.unit.acted = true;
            this.tile.unit.moves = 0;
            player.gold -= this.game.shipCost;
            this.gold -= this.game.shipCost;
        }

        return true;

        // <<-- /Creer-Merge: spawn -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    // You can add additional functions here. These functions will not be directly callable by client AIs

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Port;

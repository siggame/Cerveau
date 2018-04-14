// Game: Steal from merchants and become the most infamous pirate.

const Class = require("classe");
const log = require(`${__basedir}/gameplay/log`);
const TwoPlayerGame = require(`${__basedir}/gameplay/shared/twoPlayerGame`);
const TurnBasedGame = require(`${__basedir}/gameplay/shared/turnBasedGame`);
const TiledGame = require(`${__basedir}/gameplay/shared/tiledGame`);

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

// any additional requires you want can be required here safely between Creer re-runs

//<<-- /Creer-Merge: requires -->>

// @class Game: Steal from merchants and become the most infamous pirate.
let Game = Class(TwoPlayerGame, TurnBasedGame, TiledGame, {
    /**
     * Initializes Games.
     *
     * @param {Object} data - a simple mapping passed in to the constructor with whatever you sent with it. GameSettings are in here by key/value as well.
     */
    init: function(data) {
        TiledGame.init.apply(this, arguments);
        TurnBasedGame.init.apply(this, arguments);
        TwoPlayerGame.init.apply(this, arguments);

        /**
         * The rate buried gold increases each turn.
         *
         * @type {number}
         */
        this.buryInterestRate = this.buryInterestRate || 0;

        /**
         * How much gold it costs to construct a single crew.
         *
         * @type {number}
         */
        this.crewCost = this.crewCost || 0;

        /**
         * How much damage crew deal to each other.
         *
         * @type {number}
         */
        this.crewDamage = this.crewDamage || 0;

        /**
         * The maximum amount of health a crew member can have.
         *
         * @type {number}
         */
        this.crewHealth = this.crewHealth || 0;

        /**
         * The number of moves Units with only crew are given each turn.
         *
         * @type {number}
         */
        this.crewMoves = this.crewMoves || 0;

        /**
         * A crew's attack range. Range is circular.
         *
         * @type {number}
         */
        this.crewRange = this.crewRange || 0;

        /**
         * The player whose turn it is currently. That player can send commands. Other players cannot.
         *
         * @type {Player}
         */
        this.currentPlayer = this.currentPlayer || null;

        /**
         * The current turn number, starting at 0 for the first player's turn.
         *
         * @type {number}
         */
        this.currentTurn = this.currentTurn || 0;

        /**
         * A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
         *
         * @type {Object.<string, GameObject>}
         */
        this.gameObjects = this.gameObjects || {};

        /**
         * How much health a Unit recovers when they rest.
         *
         * @type {number}
         */
        this.healFactor = this.healFactor || 0;

        /**
         * The number of Tiles in the map along the y (vertical) axis.
         *
         * @type {number}
         */
        this.mapHeight = this.mapHeight || 0;

        /**
         * The number of Tiles in the map along the x (horizontal) axis.
         *
         * @type {number}
         */
        this.mapWidth = this.mapWidth || 0;

        /**
         * The maximum number of turns before the game will automatically end.
         *
         * @type {number}
         */
        this.maxTurns = this.maxTurns || 0;

        /**
         * How much gold merchant Ports get each turn.
         *
         * @type {number}
         */
        this.merchantGoldRate = this.merchantGoldRate || 0;

        /**
         * When a merchant ship spawns, the amount of additional gold it has relative to the Port's investment.
         *
         * @type {number}
         */
        this.merchantInterestRate = this.merchantInterestRate || 0;

        /**
         * The Euclidean distance buried gold must be from the Player's Port to accumulate interest.
         *
         * @type {number}
         */
        this.minInterestDistance = this.minInterestDistance || 0;

        /**
         * List of all the players in the game.
         *
         * @type {Array.<Player>}
         */
        this.players = this.players || [];

        /**
         * Every Port in the game. Merchant ports have owner set to null.
         *
         * @type {Array.<Port>}
         */
        this.ports = this.ports || [];

        /**
         * How far a Unit can be from a Port to rest. Range is circular.
         *
         * @type {number}
         */
        this.restRange = this.restRange || 0;

        /**
         * A unique identifier for the game instance that is being played.
         *
         * @type {string}
         */
        this.session = this.session || "";

        /**
         * How much gold it costs to construct a ship.
         *
         * @type {number}
         */
        this.shipCost = this.shipCost || 0;

        /**
         * How much damage ships deal to ships and ports.
         *
         * @type {number}
         */
        this.shipDamage = this.shipDamage || 0;

        /**
         * The maximum amount of health a ship can have.
         *
         * @type {number}
         */
        this.shipHealth = this.shipHealth || 0;

        /**
         * The number of moves Units with ships are given each turn.
         *
         * @type {number}
         */
        this.shipMoves = this.shipMoves || 0;

        /**
         * A ship's attack range. Range is circular.
         *
         * @type {number}
         */
        this.shipRange = this.shipRange || 0;

        /**
         * All the tiles in the map, stored in Row-major order. Use `x + y * mapWidth` to access the correct index.
         *
         * @type {Array.<Tile>}
         */
        this.tiles = this.tiles || [];

        /**
         * Every Unit in the game. Merchant units have targetPort set to a port.
         *
         * @type {Array.<Unit>}
         */
        this.units = this.units || [];


        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.maxTurns = data.maxTurns || 720;
        this.mapWidth = data.mapWidth || 40;
        this.mapHeight = data.mapHeight || 28;

        this.crewCost = data.crewCost || 200;
        this.shipCost = data.shipCost || 600;
        this.crewDamage = data.crewDamage || 1;
        this.shipDamage = data.shipDamage || 2;
        this.crewHealth = data.crewHealth || 4;
        this.shipHealth = data.shipHealth || 20;
        this.crewRange = data.crewRange || 1;
        this.shipRange = data.shipRange || 3;
        this.crewMoves = data.crewMoves || 2;
        this.shipMoves = data.shipMoves || 3;

        this.restRange = data.restRange || 1.5;
        this.healFactor = data.healFactor || 0.25;

        this.merchantGoldRate = data.merchantGoldRate || 100;
        this.buryInterestRate = data.buryInterestRate || 1.1;
        this.merchantInvestmentRate = data.merchantStartingInvestment || 1.1;
        this.minInterestDistance = data.minInterestDistance || 10;

        // Not visible to players
        this.merchantGold = this.shipCost;
        this.merchantBaseCrew = 3;
        this.merchantCost = this.shipCost * 4;
        this.startingGold = data.startingGold || 3 * this.crewCost + 3 * this.shipCost;

        // For units and structures created during a turn
        this.newUnits = [];

        //<<-- /Creer-Merge: init -->>
    },

    name: "Pirates",

    aliases: [
        //<<-- Creer-Merge: aliases -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        "MegaMinerAI-21-Pirates",
        //<<-- /Creer-Merge: aliases -->>
    ],



    /**
     * This is called when the game begins, once players are connected and ready to play, and game objects have been initialized. Anything in init() may not have the appropriate game objects created yet..
     */
    begin: function() {
        TiledGame.begin.apply(this, arguments);
        TurnBasedGame.begin.apply(this, arguments);
        TwoPlayerGame.begin.apply(this, arguments);

        //<<-- Creer-Merge: begin -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // Initialize the map and creates all the tiles
        TiledGame._initMap.call(this);

        // Generate the map
        this.generateMap();

        // Give players their starting gold
        for(let player of this.players) {
            player.gold = this.startingGold;
        }

        //<<-- /Creer-Merge: begin -->>
    },

    /**
     * This is called when the game has started, after all the begin()s. This is a good spot to send orders.
     */
    _started: function() {
        TiledGame._started.apply(this, arguments);
        TurnBasedGame._started.apply(this, arguments);
        TwoPlayerGame._started.apply(this, arguments);

        //<<-- Creer-Merge: _started -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // any logic for _started can be put here
        //<<-- /Creer-Merge: _started -->>
    },


    //<<-- Creer-Merge: added-functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * Invoked before the current player starts their turn
     *
     * @override
     * @returns {*} passes through the default return value
     */
    beforeTurn: function() {
        // Update all arrays
        this.updateArrays();

        // Call base class' beforeTurn function
        return TurnBasedGame.beforeTurn.apply(this, arguments);
    },

    /**
     * Invoked when the current player ends their turn. Perform in between game logic here
     *
     * @override
     * @returns {*} passes through the default return value
     */
    nextTurn: function() {
        // Update everything
        this.updateArrays();
        this.updateUnits();
        this.updateMerchants();
        this.updateOtherStuff();

        if(this.checkForWinner(false)) {
            // If somebody won, don't continue to the next turn
            return;
        }

        // Continue to the next player (normal next turn logic)
        return TurnBasedGame.nextTurn.apply(this, arguments);
    },

    /**
     * invoked when max turns are reached
     *
     * @override
     */
    _maxTurnsReached: function() {
        this.checkForWinner("Avast! Ye ran outta turns");
    },

    updateArrays: function() {
        // Properly add all new units
        for(let unit of this.newUnits) {
            this.units.push(unit);
            if(unit.owner) {
                unit.owner.units.push(unit);
            }
        }
        this.newUnits = [];

        // Unit arrays cleanup
        for(let i = 0; i < this.units.length; i++) {
            const unit = this.units[i];

            // Remove all invalid units
            if(!unit.tile) {
                if(unit.owner) {
                    // Remove this unit from its owner's units array
                    unit.owner.units.removeElement(unit);
                }

                // Remove this unit from the game's units array
                this.units.splice(i, 1);
                i--;
                continue;
            }
            else {
                // Make sure player units arrays are correct
                // I know this hurts to read...
                for(let player of this.players) {
                    let found = player.units.find(u => u.id === unit.id);

                    if(unit.owner !== player && found) {
                        // Remove the unit from the player's unit array if it's not their unit
                        player.units.removeElement(unit);
                    }
                    else if(unit.owner === player && !found) {
                        // Add the unit to the player's unit array if it is their unit
                        player.units.push(unit);
                    }
                }
            }
        }
    },

    updateUnits: function() {
        for(let unit of this.units) {
            // Reset the unit
            if(!unit.owner || unit.owner === this.currentPlayer) {
                unit.acted = false;
                unit.moves = Math.max(this.crewMoves, unit.shipHealth > 0 ? this.shipMoves : 0);
            }

            // Decrease turns stunned
            if(unit.stunTurns > 0) {
                unit.stunTurns--;
            }
            else if(!unit.owner && unit.targetPort) {
                // Move merchant units
                // Check current path
                let pathValid = true;
                if(unit.path && unit.path.length > 0) {
                    const next = unit.path[0];
                    if(next.unit || (next.port && next.owner)) {
                        pathValid = false;
                    }
                }
                else {
                    pathValid = false;
                }

                // Find path to target port (BFS)
                if(!pathValid) {
                    let open = [{
                        tile: unit.tile,
                        g: 1,
                        parent: null,
                    }];
                    let closed = {};

                    unit.path = [];
                    while(open.length > 0) {
                        // Pop the first open element (lowest distance)
                        let cur = open.shift();
                        if(cur.tile.id in closed) {
                            continue;
                        }
                        closed[cur.tile.id] = true;

                        // Check if at the target
                        if(cur.tile === unit.targetPort.tile) {
                            while(cur) {
                                if(cur.tile !== unit.tile) {
                                    unit.path.unshift(cur.tile);
                                }
                                cur = cur.parent;
                            }

                            break;
                        }

                        // Add neighbors
                        let neighbors = [];
                        neighbors.push({tile: cur.tile.tileNorth, cost: 1});
                        neighbors.push({tile: cur.tile.tileEast, cost: 1 + 1 / Math.min(10 * cur.g, 1000)});
                        neighbors.push({tile: cur.tile.tileSouth, cost: 1});
                        neighbors.push({tile: cur.tile.tileWest, cost: 1 + 1 / Math.min(10 * cur.g, 1000)});

                        let unsorted = false;
                        for(let neighbor of neighbors) {
                            if(neighbor.tile) {
                                // Don't path through land
                                if(neighbor.tile.type === "land") {
                                    continue;
                                }

                                // Don't path through player ports
                                if(neighbor.tile.port && neighbor.tile.port.owner) {
                                    continue;
                                }

                                // Don't path through friendly units unless it's a port
                                if(neighbor.tile.unit && !neighbor.tile.port) {
                                    continue;
                                }

                                open.push({
                                    tile: neighbor.tile,
                                    g: cur.g + neighbor.cost,
                                    parent: cur,
                                });
                                unsorted = true;
                            }
                        }

                        // Sort open list
                        if(unsorted) {
                            open.sort((a, b) => a.g - b.g);
                        }
                    }
                }

                // Make the merchant attack this turn's player if they have a unit in range
                let target = this.currentPlayer.units.find(u => {
                    // Only attack ships
                    if(u.shipHealth <= 0) {
                        return false;
                    }

                    // Check if in range
                    return Math.pow(unit.tile.x - u.tile.x, 2) + Math.pow(unit.tile.y - u.tile.y, 2) <= this.shipRange * this.shipRange;
                }, this);

                if(target) {
                    // Attack the target
                    target.shipHealth -= this.shipDamage;
                    if(target.shipHealth <= 0) {
                        target.tile.unit = null;
                        target.tile = null;
                    }
                }

                // Move the merchant
                if(unit.path.length > 0) {
                    // Check if it's at its destination
                    if(unit.path[0].port === unit.targetPort) {
                        // Mark it as dead
                        unit.tile.unit = null;
                        unit.tile = null;
                    }
                    else {
                        const tile = unit.path.shift();
                        unit.tile.unit = null;
                        unit.tile = tile;
                        tile.unit = unit;
                    }
                }
            }
        }
    },

    updateMerchants: function() {
        // Create units as needed
        let merchantPorts = this.ports.filter(p => !p.owner);
        for(let i = 0; i < merchantPorts.length; i++) {
            const port = merchantPorts[i];

            // Skip player-owned ports
            if(port.owner) {
                continue;
            }

            // Add gold to the port
            port.gold += this.merchantGoldRate;

            // Try to spawn a ship
            if(!port.tile.unit && port.gold >= this.merchantCost) {
                // Deduct gold
                port.gold -= this.merchantCost;

                // Calculate crew and gold
                let gold = this.merchantGold + port.investment * this.merchantInterestRate;
                let crew = this.merchantBaseCrew + Math.floor((port.investment * this.merchantInterestRate) / this.crewCost);

                // Get the opposite port of this one
                let targetPort = this.getTile(this.mapWidth - port.tile.x - 1, this.mapHeight - port.tile.y - 1).port;

                // Spawn the unit
                let unit = this.create("Unit", {
                    owner: null,
                    tile: port.tile,
                    crew: crew,
                    shipHealth: this.shipHealth / 2,
                    gold: gold,
                    targetPort: targetPort,
                });

                unit.tile.unit = unit;
                this.newUnits.push(unit);
                port.investment = 0;
            }
        }
    },

    updateOtherStuff: function() {
        for(let tile of this.tiles) {
            tile.gold *= this.buryInterestRate;
        }

        this.currentPlayer.port.gold = this.shipCost;
    },

    checkForWinner: function(secondaryReason) {
        let players = this.players.slice();

        // Primary win conditions: destroy your enemy's units and rob them of enough of their gold
        const loseReasons = players.reduce(((loseReasons, p) => {
            if(p.gold < this.shipCost && p.units.length === 0) {
                loseReasons[p.id] = "Crew be in Davy Jones' locker, and can't build a ship";
            }
            return loseReasons;
        }).bind(this), {});

        const losers = Object.keys(loseReasons);
        if(losers.length === players.length) {
            // Both players lost
            secondaryReason = "Ye killed each other";
        }
        else if(losers.length > 0) {
            // One player lost
            const loser = players.find(p => p.id === losers[0]);
            const reason = loseReasons[loser.id];
            this.declareWinner(loser.opponent, `Opponent lost: ${reason}`);
            this.declareLoser(loser, reason);
            return true;
        }

        // Max turns reached
        if(secondaryReason) {
            // Secondary win conditions
            // 1. Most infamy
            players.sort((a, b) => b.infamy - a.infamy);
            if(players[0].infamy > players[1].infamy) {
                this.declareWinner(players[0], `${secondaryReason}: Had the most infamy`);
                this.declareLoser(players[1], `${secondaryReason}: Had the least infamy`);
                return true;
            }

            // 2. Most net worth
            players.sort((a, b) => b.netWorth() - a.netWorth());
            if(players[0].netWorth() > players[1].netWorth()) {
                this.declareWinner(players[0], `${secondaryReason}: Had the highest net worth`);
                this.declareLoser(players[1], `${secondaryReason}: Had the lowest net worth`);
                return true;
            }

            // 3. Coin toss
            this._endGameViaCoinFlip(secondaryReason);
            return true;
        }
    },

    generateMap: function() {
        let portTiles = [];

        // Make sure there's enough tiles for all the ports to spawn on
        while(portTiles.length < 3) {
            // Fill the map
            for(let tile of this.tiles) {
                tile.type = "water";
            }

            // Generate some metaballs for the islands
            const ballGens = [this.cornerBalls, this.riverBalls, this.islandBalls];

            // Pick a metaball generator
            let ballInfo = ballGens[Math.floor(Math.random() * ballGens.length)].call(this);

            // Generate the islands from the metaballs
            let q = ballInfo.quads ? 2 : 1;
            for(let x = 0; x < this.mapWidth / 2; x++) {
                for(let y = 0; y < this.mapHeight / q; y++) {
                    let tile = this.getTile(x, y);
                    let energy = 0;
                    for(const ball of ballInfo.balls) {
                        let r = ball.r;
                        let dist = Math.sqrt(Math.pow(ball.x - x, 2) + Math.pow(ball.y - y, 2));
                        let d = Math.max(0.0001, Math.pow(dist, ballInfo.gooeyness)); // Can't be 0
                        energy += r / d;
                    }

                    if(energy >= ballInfo.threshold) {
                        tile.type = "land";
                        if(energy >= ballInfo.grassThreshold) {
                            tile.decoration = true;
                        }
                    }
                    else {
                        tile.type = "water";
                        if(energy <= ballInfo.seaThreshold) {
                            tile.decoration = true;
                        }
                    }
                }
            }

            // If the generator only generates one corner of the map, mirror vertically
            if(ballInfo.quads) {
                for(let x = 0; x < this.mapWidth / 2; x++) {
                    for(let y = 0; y < this.mapHeight / 2; y++) {
                        let orig = this.getTile(x, y);
                        let target = this.getTile(x, this.mapHeight - y - 1);
                        target.type = orig.type;
                    }
                }
            }

            // Make sure there's only one main body of water, no extra smaller ones
            this.fillLakes();

            // Find all possible port locations
            portTiles = this.tiles.filter(t => {
                // Check type
                if(t.type !== "water") {
                    return false;
                }

                // Make sure it's not too close to the center
                if(t.x > this.mapWidth / 4) {
                    return false;
                }

                // Check neighbors - make sure there's land and enough water
                let land = false;
                let water = 0;
                if(t.tileNorth && t.tileNorth.type === "land") {
                    land = true;
                }
                else if(t.tileNorth) {
                    water += 1;
                    if(t.tileNorth.tileEast && t.tileNorth.tileEast.type === "water") {
                        water += 1;
                    }
                    if(t.tileNorth.tileWest && t.tileNorth.tileWest.type === "water") {
                        water += 1;
                    }
                }
                if(t.tileEast && t.tileEast.type === "land") {
                    land = true;
                }
                else if(t.tileEast) {
                    water += 1;
                }
                if(t.tileSouth && t.tileSouth.type === "land") {
                    land = true;
                }
                else if(t.tileSouth) {
                    water += 1;
                    if(t.tileSouth.tileEast && t.tileSouth.tileEast.type === "water") {
                        water += 1;
                    }
                    if(t.tileSouth.tileWest && t.tileSouth.tileWest.type === "water") {
                        water += 1;
                    }
                }
                if(t.tileWest && t.tileWest.type === "land") {
                    land = true;
                }
                else if(t.tileWest) {
                    water += 1;
                }

                return land && water > 5;
            }, this);
        }

        // Place the starting port
        let selected = Math.floor(Math.random() * portTiles.length);
        let port = this.create("Port", {
            owner: this.players[0],
            tile: portTiles[selected],
            gold: this.shipCost,
        });
        portTiles.splice(selected, 1);
        port.tile.port = port;
        port.owner.port = port;
        this.ports.push(port);

        // Place merchant port
        portTiles = portTiles.filter(t => Math.pow(t.x - port.tile.x, 2) + Math.pow(t.y - port.tile.y, 2) > 4);
        selected = Math.floor(Math.random() * portTiles.length);
        port = this.create("Port", {
            owner: null,
            tile: portTiles[selected],
        });

        // Add the port to the game
        port.tile.port = port;
        portTiles.splice(selected, 1);
        this.ports.push(port);

        // Mirror the map
        for(let x = 0; x < this.mapWidth / 2; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                let orig = this.getTile(x, y);
                let target = this.getTile(this.mapWidth - x - 1, this.mapHeight - y - 1);

                // Copy tile data
                target.type = orig.type;
                target.decoration = orig.decoration;

                // Clone ports
                if(orig.port) {
                    port = this.create("Port", {
                        tile: target,
                        owner: orig.port.owner && orig.port.owner.opponent,
                        gold: orig.port.gold,
                    });
                    target.port = port;
                    this.ports.push(port);
                    if(port.owner) {
                        port.owner.port = port;
                    }
                    else {
                        // Stagger merchant ship spawning
                        port.gold += this.merchantGoldRate;
                    }
                }
            }
        }
    },

    fillLakes: function() {
        // Find the largest body of water and fill the rest
        let checked = {};
        let bodies = [];
        for(let x = 0; x < this.mapWidth / 2; x++) {
            for(let y = 0; y < this.mapHeight; y++) {
                const tile = this.getTile(x, y);

                // Only looking for bodies of water
                if(tile.type !== "water") {
                    continue;
                }

                // Don't check the same body twice
                if(checked[tile.id]) {
                    continue;
                }

                // Use BFS(ish) to find all the connected water
                let body = [];
                let open = [tile];
                while(open.length > 0) {
                    const cur = open.shift();

                    // Only add water to the body
                    if(cur.type !== "water") {
                        continue;
                    }

                    // Only check for bodies on half of the map
                    if(cur.x >= this.mapWidth / 2) {
                        continue;
                    }

                    // Make sure this tile only gets checked once
                    if(checked[cur.id]) {
                        continue;
                    }
                    checked[cur.id] = true;

                    // Add it to the current body of water
                    body.push(cur);

                    // Add its neighbors to get checked
                    let neighbors = [cur.tileNorth, cur.tileEast, cur.tileSouth, cur.tileWest];
                    for(let neighbor of neighbors) {
                        if(neighbor) {
                            open.push(neighbor);
                        }
                    }
                }

                // Add the current body to the list of bodies
                bodies.push(body);
            }
        }

        // Sort bodies by size (largest first), then remove the first element
        bodies.sort((a, b) => b.length - a.length);
        bodies.shift();

        // Fill the rest of the bodies
        for(let body of bodies) {
            for(let tile of body) {
                tile.type = "land";
                tile.decoration = false;
            }
        }
    },

    islandBalls: function() {
        let balls = [];
        const minRadius = 0.5;
        const maxRadius = 1.5;
        const maxOffset = this.mapWidth * 0.2;
        const additionalBalls = 20;
        const gooeyness = 1.0;
        const threshold = 3.5;
        const grassThreshold = 4.25;
        const seaThreshold = 2.0;
        const radiusRange = maxRadius - minRadius;

        // Generate balls
        let islandX = this.mapWidth * 0.25 + 0.5;
        for(let i = 0; i < additionalBalls; i++) {
            balls.push({
                x: islandX + Math.random() * maxOffset * 2 - maxOffset,
                y: Math.random() * (this.mapHeight - 1) + 0.5,
                r: Math.random() * radiusRange + minRadius,
            });
        }

        return {
            balls: balls,
            gooeyness: gooeyness,
            threshold: threshold,
            grassThreshold: grassThreshold,
            seaThreshold: seaThreshold,
            quads: false,
        };
    },

    riverBalls: function() {
        let balls = [];
        const minRadius = 0.5;
        const maxRadius = 4.0;
        const maxOffset = this.mapHeight / 2;
        const additionalBalls = 8;
        const gooeyness = 0.95;
        const threshold = 2.0;
        const grassThreshold = 2.4;
        const seaThreshold = 1.5;
        const radiusRange = maxRadius - minRadius;

        // Initial ball
        let islandX = 0.5;
        let islandY = (Math.random() < 0.5) ? 0.5 : (this.mapHeight - 0.5);
        balls.push({
            x: islandX,
            y: islandY,
            r: Math.random() * radiusRange + minRadius,
        });

        // Extra balls
        for(let i = 0; i < additionalBalls; i++) {
            balls.push({
                x: islandX,
                y: islandY + Math.random() * maxOffset * 2 - maxOffset,
                r: Math.random() * radiusRange + minRadius,
            });
        }

        return {
            balls: balls,
            gooeyness: gooeyness,
            threshold: threshold,
            grassThreshold: grassThreshold,
            seaThreshold: seaThreshold,
            quads: false,
        };
    },

    cornerBalls: function() {
        let balls = [];
        const minRadius = 0.75;
        const maxRadius = 1.25;
        const maxOffset = 10.0;
        const additionalBalls = 20;
        const gooeyness = 1.0;
        const threshold = 4.0;
        const grassThreshold = 5.0;
        const seaThreshold = 2.75;
        const radiusRange = maxRadius - minRadius;

        // Initial ball (top island)
        let islandX = 0.5;
        let islandY = 0.5;
        balls.push({
            x: islandX,
            y: islandY,
            r: Math.random() * radiusRange + minRadius,
        });

        // Extra balls (top island)
        for(let i = 0; i < additionalBalls; i++) {
            balls.push({
                x: islandX + Math.random() * maxOffset * 2 - maxOffset,
                y: islandY + Math.random() * maxOffset * 2 - maxOffset,
                r: Math.random() * radiusRange + minRadius,
            });
        }

        // Initial ball (bottom island)
        islandY = this.mapHeight - 0.5;
        balls.push({
            x: islandX,
            y: islandY,
            r: Math.random() * radiusRange + minRadius,
        });

        // Extra balls (bottom island)
        for(let i = 0; i < additionalBalls; i++) {
            balls.push({
                x: islandX + Math.random() * maxOffset * 2 - maxOffset,
                y: islandY - Math.random() * maxOffset,
                r: Math.random() * radiusRange + minRadius,
            });
        }

        return {
            balls: balls,
            gooeyness: gooeyness,
            threshold: threshold,
            grassThreshold: grassThreshold,
            seaThreshold: seaThreshold,
            quads: false,
        };
    },

    //<<-- /Creer-Merge: added-functions -->>

});

module.exports = Game;

// This file is where you should put logic to control the game and everything
// around it.
import { BaseClasses, PiratesGame, PiratesGameObjectFactory } from "./";

// <<-- Creer-Merge: imports -->>

import { filterInPlace } from "~/utils";
import { Tile } from "./tile";
import { Unit } from "./unit";

/** A node on the merchant path-finding stack */
interface IPath {
    tile: Tile;
    g: number;
    parent: IPath | undefined;
}

// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Pirates Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class PiratesGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-21-Pirates",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: PiratesGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: PiratesGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    /** The new units created DURING turns. */
    public readonly newUnits: Unit[] = [];

    // <<-- /Creer-Merge: public-methods -->>

    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        await super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>
        this.updateArrays();
        // <<-- /Creer-Merge: before-turn -->>
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to end-of-turn effects, and clean up arrays.
     */
    protected async afterTurn(): Promise<void> {
        await super.afterTurn();

        // <<-- Creer-Merge: after-turn -->>

        this.updateArrays();
        this.updateUnits();
        this.updateMerchants();
        this.updateOtherStuff();

        // <<-- /Creer-Merge: after-turn -->>
    }

    /**
     * Checks if the game is over in between turns.
     * This is invoked AFTER afterTurn() is called, but BEFORE beforeTurn()
     * is called.
     *
     * @returns True if the game is indeed over, otherwise if the game
     * should continue return false.
     */
    protected primaryWinConditionsCheck(): boolean {
        super.primaryWinConditionsCheck();

        // <<-- Creer-Merge: primary-win-conditions -->>

        // Primary win conditions: destroy your enemy's units and rob them of enough of their gold
        const killedOff = this.game.players.filter((p) => p.gold < this.game.shipCost && p.units.length === 0);

        if (killedOff.length === 2) {
            this.secondaryWinConditions("Ye killed each other");

            return true;
        }
        else if (killedOff.length === 1) {
            const loser = killedOff[0];
            this.declareWinner("Ye killed the other pirate!", loser.opponent);
            this.declareLoser("Crew be in Davy Jones' locker, and can't build a ship", loser);

            return true;
        }

        // <<-- /Creer-Merge: primary-win-conditions -->>

        return false; // If we get here no one won on this turn.
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryWinConditions(reason: string): void {
        // <<-- Creer-Merge: secondary-win-conditions -->>

        // clone the array as sorting is in place
        const players = this.game.players.slice();

        // 1. Most infamy
        players.sort((a, b) => b.infamy - a.infamy);
        if (players[0].infamy > players[1].infamy) {
            this.declareWinner(`${reason}: Had the most infamy`, players[0]);
            this.declareLoser(`${reason}: Had the least infamy`, players[1]);
        }

        // 2. Most net worth
        players.sort((a, b) => b.netWorth() - a.netWorth());
        if (players[0].netWorth() > players[1].netWorth()) {
            this.declareWinner(`${reason}: Had the highest net worth`, players[0]);
            this.declareLoser(`${reason}: Had the lowest net worth`, players[1]);
        }

        // 3. Coin toss (handled by default below)

        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    /**
     * Updates the arrays clients can see so they do not resize during turns.
     */
    private updateArrays(): void {
        // Properly add all new units
        for (const unit of this.newUnits) {
            this.game.units.push(unit);
            if (unit.owner) {
                unit.owner.units.push(unit);
            }
        }

        // now empty it as we've dumped all the new units into their arrays.
        this.newUnits.length = 0;

        // if the unit has a tile, it is alive, so keep it
        const keepAliveUnits = (unit: Unit) => Boolean(unit.tile);

        filterInPlace(this.game.units, keepAliveUnits);
        for (const player of this.game.players) {
            filterInPlace(player.units, keepAliveUnits);
        }
    }

    /** Updates units in-between turns */
    private updateUnits(): void {
        for (const unit of this.game.units) {
            // Reset the unit
            if (!unit.owner || unit.owner === this.game.currentPlayer) {
                unit.acted = false;
                unit.moves = Math.max(this.game.crewMoves, unit.shipHealth > 0
                    ? this.game.shipMoves
                    : 0,
                );
            }

            // Decrease turns stunned
            if (unit.stunTurns > 0) {
                unit.stunTurns--;
            }
            else if (!unit.owner && unit.targetPort) {
                // Move merchant units
                // Check current path
                let pathValid = true;
                if (unit.path && unit.path.length > 0) {
                    const next = unit.path[0];
                    if (next.unit || (next.port && next.port.owner)) {
                        pathValid = false;
                    }
                }
                else {
                    pathValid = false;
                }

                if (!unit.tile) {
                    throw new Error(`${unit} has not Tile to update from!`);
                }

                // Find path to target port (BFS)
                if (!pathValid) {
                    const open: IPath[] = [{
                        tile: unit.tile,
                        g: 1,
                        parent: undefined,
                    }];

                    const closed = new Set<Tile>();

                    unit.path = [];
                    while (open.length > 0) {
                        // Pop the first open element (lowest distance)
                        let current: IPath | undefined = open.shift() as IPath; // must exist from above check
                        if (closed.has(current.tile)) {
                            continue;
                        }
                        closed.add(current.tile);

                        // Check if at the target
                        if (current.tile === unit.targetPort.tile) {
                            while (current) {
                                if (current.tile !== unit.tile) {
                                    unit.path.unshift(current.tile);
                                }
                                current = current.parent;
                            }

                            break;
                        }

                        // Add neighbors
                        const neighbors = [
                            { tile: current.tile.tileNorth, cost: 1 },
                            { tile: current.tile.tileEast, cost: 1 / Math.min(current.g * 10, 1000) + 1 },
                            { tile: current.tile.tileSouth, cost: 1 },
                            { tile: current.tile.tileWest, cost: 1 / Math.min(current.g * 10, 1000) + 1},
                        ];

                        let unsorted = false;
                        for (const neighbor of neighbors) {
                            if (neighbor.tile) {
                                // Don't path through land
                                if (neighbor.tile.type === "land") {
                                    continue;
                                }

                                // Don't path through player ports
                                if (neighbor.tile.port && neighbor.tile.port.owner) {
                                    continue;
                                }

                                // Don't path through friendly units unless it's a port
                                if (neighbor.tile.unit && !neighbor.tile.port) {
                                    continue;
                                }

                                open.push({
                                    tile: neighbor.tile,
                                    g: current.g + neighbor.cost,
                                    parent: current,
                                });
                                unsorted = true;
                            }
                        }

                        // Sort open list
                        if (unsorted) {
                            open.sort((a, b) => a.g - b.g);
                        }
                    }
                }

                // Make the merchant attack this turn's player if they have a unit in range
                const target = this.game.currentPlayer.units.find((u) => {
                    // Only attack ships
                    if (u.shipHealth <= 0) {
                        return false;
                    }

                    // Check if in range
                    const range = (unit.tile.x - u.tile.x) ** 2 + (unit.tile.y - u.tile.y) ** 2;

                    return range <= this.game.shipRange ** 2;
                });

                if (target) {
                    // Attack the target
                    target.shipHealth -= this.game.shipDamage;
                    if (target.shipHealth <= 0 && !target.tile.port) {
                        target.tile.unit = undefined;
                        target.tile = undefined;
                    }

                    target.shipHealth = Math.max(0, target.shipHealth);
                }

                // Move the merchant
                if (unit.path.length > 0) {
                    // Check if it's at its destination
                    if (unit.path[0].port === unit.targetPort) {
                        // Mark it as dead
                        unit.tile.unit = undefined;
                        unit.tile = undefined;
                    }
                    else {
                        const tile = unit.path.shift() as Tile; // must exist from above check
                        unit.tile.unit = undefined;
                        unit.tile = tile;
                        tile.unit = unit;
                    }
                }
            }
        }
    }

    /**
     * Updates the merchants in the game, moving them and updating their gold.
     */
    private updateMerchants(): void {
        const merchantGold = this.game.shipCost;
        const merchantBaseCrew = 3;
        const merchantCost = this.game.shipCost * 4;

        // Create units as needed
        const merchantPorts = this.game.ports.filter((p) => !p.owner);
        for (const port of merchantPorts) {
            // Skip player-owned ports
            if (port.owner) {
                continue;
            }

            // Add gold to the port
            port.gold += this.game.merchantGoldRate;

            // Try to spawn a ship
            if (!port.tile.unit && port.gold >= merchantCost) {
                // Deduct gold
                port.gold -= merchantCost;

                // Calculate crew and gold
                const gold = merchantGold + (port.investment * this.game.merchantInterestRate);
                const invested = Math.floor(port.investment * this.game.merchantInterestRate / this.game.crewCost);
                const crew = merchantBaseCrew + invested;

                // Get the opposite port of this one
                const target = this.game.getTile(
                    this.game.mapWidth - port.tile.x - 1,
                    this.game.mapHeight - port.tile.y - 1,
                );

                if (!target) {
                    throw new Error("Merchange has no opposite target!");
                }

                const targetPort = target.port;

                // Spawn the unit
                const unit = this.create.unit({
                    owner: undefined,
                    tile: port.tile,
                    crew,
                    crewHealth: crew * this.game.crewHealth,
                    shipHealth: this.game.shipHealth / 2,
                    gold,
                    targetPort,
                });

                unit.tile.unit = unit;
                this.newUnits.push(unit);
                port.investment = 0;
            }
        }
    }

    /** Update other variables in-between turns */
    private updateOtherStuff(): void {
        for (const tile of this.game.tiles) {
            const gold = tile.gold * this.game.buryInterestRate;
            tile.gold = Math.min(gold, this.game.settings.maxTileGold);

            if (tile.unit && tile.unit.tile !== tile) {
                tile.unit = undefined; // it died
            }
        }

        this.game.currentPlayer.port.gold = this.game.shipCost;
    }

    // <<-- /Creer-Merge: protected-private-methods -->>
}

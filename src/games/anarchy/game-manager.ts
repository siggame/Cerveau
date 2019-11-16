// This file is where you should put logic to control the game and everything
// around it.
import { AnarchyGame, AnarchyGameObjectFactory, BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
import { BuildingArgs } from "./";
import { Building } from "./building";
import { FireDepartment } from "./fire-department";
import { Player } from "./player";
import { PoliceDepartment } from "./police-department";
import { Warehouse } from "./warehouse";
import { WeatherStation } from "./weather-station";
// <<-- /Creer-Merge: imports -->>

/**
 * Manages the game logic around the Anarchy Game.
 * This is where you could do logic for checking if the game is over, update
 * the game between turns, and anything that ties all the "stuff" in the game
 * together.
 */
export class AnarchyGameManager extends BaseClasses.GameManager {
    /** Other strings (case insensitive) that can be used as an ID */
    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-16-Anarchy",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    /** The game this GameManager is managing */
    public readonly game!: AnarchyGame;

    /** The factory that must be used to initialize new game objects */
    public readonly create!: AnarchyGameObjectFactory;

    // <<-- Creer-Merge: public-methods -->>

    /**
     * Creates a building of the specified type.
     *
     * @param type - The type of building to create. Must be the class name.
     * @param data - The initialization data for that building.
     * @returns A new building of that type.
     */
    public createBuilding(
        type: "FireDepartment" | "PoliceDepartment" | "Warehouse" | "WeatherStation" | string,
        data: BuildingArgs,
    ): Building {
        let building: Building | undefined;
        switch (type) {
            case "FireDepartment":
                building = this.create.fireDepartment(data);
                building.owner.fireDepartments.push(building as FireDepartment);
                break;
            case "PoliceDepartment":
                building = this.create.policeDepartment(data);
                building.owner.policeDepartments.push(building as PoliceDepartment);
                break;
            case "Warehouse":
                building = this.create.warehouse(data);
                building.owner.warehouses.push(building as Warehouse);
                break;
            case "WeatherStation":
                building = this.create.weatherStation(data);
                building.owner.weatherStations.push(building as WeatherStation);
                break;
            default:
                throw new Error(`${type} is not a valid building type to create`);
        }

        this.game.buildingsGrid[building.x][building.y] = building;
        this.game.buildings.push(building);
        building.owner.buildings.push(building);

        return building;
    }

    // <<-- /Creer-Merge: public-methods -->>

    /**
     * This is called BEFORE each player's runTun function is called
     * (including the first turn).
     * This is a good place to get their player ready for their turn.
     */
    protected async beforeTurn(): Promise<void> {
        await super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>

        for (const player of this.game.players) {
            player.bribesRemaining = this.game.baseBribesPerTurn;
        }

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
        const playersBurnedDownBuildings = new Map<Player, number>();
        const fireSpreads: Array<{
            /** The building to spread to. */
            building: Building;
            /** The fire they will accumulate. */
            fire: number;
        }> = [];

        for (const player of this.game.players) {
            playersBurnedDownBuildings.set(player, 0);
        }

        for (const building of this.game.buildings) {
            if (building.fire > 0) {
                building.health = Math.max(0, building.health - building.fire); // it takes fire damage

                if (building.health <= 0) {
                    const num = playersBurnedDownBuildings.get(building.owner);
                    if (num === undefined) {
                        continue; // dead building
                    }
                    playersBurnedDownBuildings.set(building.owner, num);
                }

                // Try to spread the fire
                if (this.game.currentForecast.intensity > 0) {
                    const buildingSpreadingTo = building.getNeighbor(this.game.currentForecast.direction);
                    if (buildingSpreadingTo) {
                        fireSpreads.push({
                            building: buildingSpreadingTo,
                            fire: Math.min(building.fire, this.game.currentForecast.intensity),
                        });
                    }
                }

                // it dies down after dealing damage
                building.fire = Math.max(0, building.fire - this.game.settings.firePerTurnReduction);
            }

            if (building instanceof Warehouse && building.exposure > 0 && !building.bribed) {
                // then they didn't act, so their exposure drops
                building.exposure = Math.max(building.exposure - this.game.settings.exposurePerTurnReduction, 0);
            }

            building.bribed = false;
        }

        // spread fire, now that everything has taken fire damage
        for (const fireSpread of fireSpreads) {
            fireSpread.building.fire = Math.max(fireSpread.building.fire, fireSpread.fire);
        }

        if (this.game.nextForecast) {
            // if there is a next turn, update the current forecast
            this.game.currentForecast = this.game.nextForecast;
        }
        // Turn isn't incremented until super statement
        this.game.nextForecast = this.game.forecasts[this.game.currentTurn + 1];

        for (const player of this.game.players) {
            const num = playersBurnedDownBuildings.get(player) || 0;
            player.bribesRemaining = this.game.baseBribesPerTurn + num;
        }

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
        let loser: Player | undefined;
        let gameOver = false;
        for (const player of this.game.players) {
            if (player.headquarters.health <= 0) { // then it burned down, and they have lost
                if (loser) {
                    // someone else already lost this turn...
                    // so they both lost their headquarters this turn,
                    // so check secondary win conditions (and the game is over)
                    this.secondaryWinConditions("Both headquarters reached zero health on the same turn");
                    gameOver = true;
                    loser = undefined;
                    break;
                }
                loser = player;
            }
        }

        if (gameOver) {
            if (loser) {
                this.declareLoser("Headquarters reached zero health.", loser);
                this.declareWinner("Reduced health of enemy's headquarters to zero.", loser.opponent);
            }

            return true; // the game is over
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

        // 1. Check if one player's HQ has more heath than the other
        const headquarters = this.game.players
            .map((p) => p.headquarters)
            .sort((a, b) => b.health - a.health);

        if (headquarters[0].health !== headquarters[1].health) {
            this.declareWinner(`${reason} - Your headquarters had the most health remaining.`, headquarters[0].owner);
            this.declareLoser(`${reason} - Your headquarters had less health remaining than another player.`,
                              headquarters[1].owner);

            return;
        }

        // 2. Else, check if one player has more building alive than the other
        const buildingsAlive = this.game.players
            .map((p) => p.buildings.filter((b) => b.health > 0))
            .sort((a, b) => b.length - a.length);

        if (buildingsAlive[0].length !== buildingsAlive[1].length) {
            // store the winner as the loser could be lost in this scope if their array is empty
            const winner = buildingsAlive[0][0].owner;
            this.declareWinner(`${reason} - You had the most buildings not burned down.`, winner);
            this.declareLoser(`${reason} - You had more buildings burned down than another player.`, winner.opponent);

            return;
        }

        // 3. Else, check if one player has a higher sum of the buildings' healths
        const buildingsHealthSum = this.game.players
            .map((p) => p.buildings.reduce((sum, b) => sum + b.health, 0));

        if (buildingsHealthSum[0] !== buildingsHealthSum[1]) {
            const winner = this.game.players[buildingsHealthSum[0] > buildingsHealthSum[1]
                ? 0
                : 1
            ];
            this.declareWinner(`${reason} - You had the highest health sum among your Buildings.`, winner);
            this.declareLoser(`${reason} - You had a lower health sum than the other player.`, winner.opponent);

            return;
        }

        // else all their buildings are identical,
        // so they are probably the same AIs, so just random chance

        // <<-- /Creer-Merge: secondary-win-conditions -->>

        // This will end the game.
        // If no winner it determined above, then a random one will be chosen.
        super.secondaryWinConditions(reason);
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

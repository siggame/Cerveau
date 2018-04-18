// This file is where you should put logic to control the game and everything
// around it.
import { AnarchyGame, AnarchyGameObjectFactory, BaseClasses } from "./";

// <<-- Creer-Merge: imports -->>
import { Building, IBuildingConstructorArgs } from "./building";
import { FireDepartment } from "./fire-department";
import { Player } from "./player";
import { PoliceDepartment } from "./police-department";
import { Warehouse } from "./warehouse";
import { WeatherStation } from "./weather-station";
// <<-- /Creer-Merge: imports -->>

export class AnarchyGameManager extends BaseClasses.GameManager {
    /** The name of this game (used as an ID internally) */
    public static get gameName(): string {
        return "Anarchy";
    }

    /** The number of players that must connect to play this game */
    public static get requiredNumberOfPlayers(): number {
        // <<-- Creer-Merge: required-number-of-players -->>
        // override this if you want to set a different number of players
        return super.requiredNumberOfPlayers;
        // <<-- /Creer-Merge: required-number-of-players -->>
    }

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

    public createBuilding(
        type: "FireDepartment" | "PoliceDepartment" | "Warehouse" | "WeatherStation" | string,
        data: IBuildingConstructorArgs,
    ): Building {
        let building: Building | undefined;
        switch (type) {
            case "FireDepartment":
                building = this.create.FireDepartment(data);
                building.owner.fireDepartments.push(building as FireDepartment);
                break;
            case "PoliceDepartment":
                building = this.create.PoliceDepartment(data);
                building.owner.policeDepartments.push(building as PoliceDepartment);
                break;
            case "Warehouse":
                building = this.create.Warehouse(data);
                building.owner.warehouses.push(building as Warehouse);
                break;
            case "WeatherStation":
                building = this.create.WeatherStation(data);
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
        super.beforeTurn();

        // <<-- Creer-Merge: before-turn -->>

        for (const player of this.game.players) {
            player.bribesRemaining = this.game.baseBribesPerTurn;
        }

        // <<-- /Creer-Merge: before-turn -->>
    }

    /**
     * This is called AFTER each player's turn ends. Before the turn counter
     * increases.
     * This is a good place to check if they won the game during their turn,
     * and do end-of-turn effects.
     */
    protected async nextTurn(): Promise<void> {
        // <<-- Creer-Merge: next-turn -->>
        const playersBurnedDownBuildings = new Map<Player, number>();
        const fireSpreads: Array<{
            building: Building;
            fire: number;
        }> = [];

        for (const player of this.game.players) {
            playersBurnedDownBuildings.set(player, 0);
        }

        for (const building of this.game.buildings) {
            if (building.fire > 0) {
                building.health = Math.max(0, building.health - building.fire); // it takes fire damage

                if (building.health <= 0) {
                    playersBurnedDownBuildings.set(building.owner, playersBurnedDownBuildings.get(building.owner)!);
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

        // now that every building has been damaged, check for winner via burning down Headquarters
        let loser: Player | undefined;
        let gameOver = false;
        for (const player of this.game.players) {
            if (player.headquarters.health <= 0) { // then it burned down, and they have lost
                if (loser) {
                    // someone else already lost this turn...
                    // so they both lost their headquarters this turn,
                    // so check secondary win conditions (and the game is over)
                    this.secondaryGameOver("Both headquarters reached zero health on the same turn");
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

            // the game is over!
            this.endGame();
        }

        if (!this.isGameOver()) {

            // spread fire, now that everything has taken fire damage
            for (const fireSpread of fireSpreads) {
                fireSpread.building.fire = Math.max(fireSpread.building.fire, fireSpread.fire);
            }

            this.game.currentForecast = this.game.nextForecast!;
            // Turn isn't incremented until super statement
            this.game.nextForecast = this.game.forecasts[this.game.currentTurn + 1];

            for (const player of this.game.players) {
                player.bribesRemaining = this.game.baseBribesPerTurn + playersBurnedDownBuildings.get(player)!;
            }
        }

        // <<-- /Creer-Merge: next-turn -->>

        super.nextTurn(); // this actually makes their turn end
    }

    /**
     * Called when the game needs to end, but primary game ending conditions
     * are not met (like max turns reached). Use this to check for secondary
     * game win conditions to crown a winner.
     * @param reason The reason why a secondary victory condition is happening
     */
    protected secondaryGameOver(reason: string): void {
        // <<-- Creer-Merge: secondary-game-over -->>

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

        // <<-- /Creer-Merge: secondary-game-over -->>

        this.makePlayerWinViaCoinFlip("Identical AIs played the game.");
    }

    // <<-- Creer-Merge: protected-private-methods -->>

    // any additional protected/private methods you need can be added here

    // <<-- /Creer-Merge: protected-private-methods -->>
}

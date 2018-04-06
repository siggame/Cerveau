import { AnarchyGameObjectFactory, BaseClasses, Game } from "./";

// creer merge
import { Building, FireDepartment, IBuildingConstructorArgs,
    Player, PoliceDepartment, Warehouse, WeatherStation } from "./";
// /creer merge

export class GameManager extends BaseClasses.GameManager {
    public static get gameName(): string {
        return "Anarchy";
    }

    public static get aliases(): string[] {
        return [
            // <<-- Creer-Merge: aliases -->>
            "MegaMinerAI-16-Anarchy",
            // <<-- /Creer-Merge: aliases -->>
        ];
    }

    public readonly game!: Game;
    public readonly create!: AnarchyGameObjectFactory;

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

    protected async beforeTurn(): Promise<void> {
        super.beforeTurn();

        for (const player of this.game.players) {
            player.bribesRemaining = this.game.baseBribesPerTurn;
        }
    }

    protected async nextTurn(): Promise<void> {
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
            if (player.headquarters!.health <= 0) { // then it burned down, and they have lost
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

        super.nextTurn();
    }

    protected maxTurnsReached(): void {
        this.secondaryGameOver(`Max turns reached (${this.game.maxTurns}).`);
        super.maxTurnsReached();
    }

    private secondaryGameOver(reason: string): void {
        // 1. Check if one player's HQ has more heath than the other
        const headquarters = this.game.players
            .map((p) => p.headquarters!)
            .sort((a, b) => b.health - a.health);

        if (headquarters[0].health !== headquarters[1].health) {
            this.declareWinner("Your headquarters had the most health remaining.", headquarters[0].owner);
            this.declareLoser("Your headquarters had less health remaining than another player.",
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
            this.declareWinner("You had the most buildings not burned down.", winner);
            this.declareLoser("You had more buildings burned down than another player.", winner.opponent);
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
            this.declareWinner("You had the highest health sum among your Buildings.", winner);
            this.declareLoser("You had a lower health sum than the other player.", winner.opponent);
            return;
        }

        // else all their buildings are identical,
        // so they are probably the same AIs, so just random chance
        this.makePlayerWinViaCoinFlip("AIs played the game.");
    }

    // TODO: add creer merge fields
}

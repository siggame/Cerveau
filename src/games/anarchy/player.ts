// Player: A player in this game. Every AI controls one player.

import { IBaseGameObjectRequiredData } from "src/core/game";
import { AI, Building, FireDepartment, GameObject,
    IBaseAnarchyPlayer, PoliceDepartment, Warehouse, WeatherStation } from "./";

// <<-- Creer-Merge: requires -->>
// any additional requires you want can be required here safely between cree runs
// <<-- /Creer-Merge: requires -->>

// @class Player: A player in this game. Every AI controls one player.
export class Player extends GameObject implements IBaseAnarchyPlayer {
    public readonly ai!: AI;

    public timeRemaining: number = this.timeRemaining || 0;
    public readonly name: string = this.name || "";
    public readonly clientType: string = this.clientType || "";
    public lost: boolean = this.lost || false;
    public reasonLost: string = this.reasonLost || "";
    public won: boolean = this.won || false;
    public reasonWon: string = this.reasonWon || "";

    /**
     * How many bribes this player has remaining to use during their turn. Each
     * action a Building does costs 1 bribe. Any unused bribes are lost at the
     * end of the player's turn.
     */
    public bribesRemaining: number = this.bribesRemaining || 0;

    /**
     * All the buildings owned by this player.
     */
    public readonly buildings: Building[] = this.buildings || [];

    /**
     * All the FireDepartments owned by this player.
     */
    public readonly fireDepartments: FireDepartment[] = this.fireDepartments || [];

    /**
     * The Warehouse that serves as this player's headquarters and has extra
     * health. If this gets destroyed they lose.
     */
    public headquarters?: Building;

    /**
     * This player's opponent in the game.
     */
    public readonly opponent!: Player;

    /**
     * All the PoliceDepartments owned by this player.
     */
    public readonly policeDepartments: PoliceDepartment[] = this.policeDepartments || [];

    /**
     * All the warehouses owned by this player. Includes the Headquarters.
     */
    public readonly warehouses: Warehouse[] = this.warehouses || [];

    /**
     * All the WeatherStations owned by this player.
     */
    public readonly weatherStations: WeatherStation[] = this.weatherStations || [];

    /**
     * Initializes Players.
     * @param data the data
     * @param required iot
     */
    constructor(data: {}, required: IBaseGameObjectRequiredData) { // players can never be created with custom data
        super(data, required);

        // <<-- Creer-Merge: init -->>

        // put any initialization logic here. the base variables should be set from 'data' above

        // <<-- /Creer-Merge: init -->>
    }

    // <<-- Creer-Merge: added-functions -->>

    // You can add additional functions here. These functions will not be directly callable by client AIs

    // <<-- /Creer-Merge: added-functions -->>

}

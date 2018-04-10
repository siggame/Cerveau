// Player: A player in this game. Every AI controls one player.

import { IBaseGameObjectRequiredData } from "~/core/game";
import { AI, Building, FireDepartment, GameObject,
    IBaseAnarchyPlayer, PoliceDepartment, Warehouse, WeatherStation } from "./";

// <<-- Creer-Merge: requires -->>
// any additional requires you want can be required here safely between cree runs
// <<-- /Creer-Merge: requires -->>

// @class Player: A player in this game. Every AI controls one player.
export class Player extends GameObject implements IBaseAnarchyPlayer {
    public readonly ai!: AI;

    public timeRemaining!: number;
    public readonly name!: string;
    public readonly clientType!: string;
    public lost!: boolean;
    public reasonLost!: string;
    public won!: boolean;
    public reasonWon!: string;

    /**
     * How many bribes this player has remaining to use during their turn. Each
     * action a Building does costs 1 bribe. Any unused bribes are lost at the
     * end of the player's turn.
     */
    public bribesRemaining!: number;

    /**
     * All the buildings owned by this player.
     */
    public readonly buildings!: Building[];

    /**
     * All the FireDepartments owned by this player.
     */
    public readonly fireDepartments!: FireDepartment[];

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
    public readonly policeDepartments!: PoliceDepartment[];

    /**
     * All the warehouses owned by this player. Includes the Headquarters.
     */
    public readonly warehouses!: Warehouse[];

    /**
     * All the WeatherStations owned by this player.
     */
    public readonly weatherStations!: WeatherStation[];

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

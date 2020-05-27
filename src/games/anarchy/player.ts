import { BaseGameObjectRequiredData } from "~/core/game";
import { BaseAnarchyPlayer, PlayerConstructorArgs } from "./";
import { AI } from "./ai";
import { Building } from "./building";
import { FireDepartment } from "./fire-department";
import { GameObject } from "./game-object";
import { PoliceDepartment } from "./police-department";
import { Warehouse } from "./warehouse";
import { WeatherStation } from "./weather-station";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements BaseAnarchyPlayer {
    /** The AI controlling this Player. */
    public readonly ai!: AI;

    /**
     * How many bribes this player has remaining to use during their turn. Each
     * action a Building does costs 1 bribe. Any unused bribes are lost at the
     * end of the player's turn.
     */
    public bribesRemaining!: number;

    /**
     * All the buildings owned by this player.
     */
    public buildings!: Building[];

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * All the FireDepartments owned by this player.
     */
    public fireDepartments!: FireDepartment[];

    /**
     * The Warehouse that serves as this player's headquarters and has extra
     * health. If this gets destroyed they lose.
     */
    public headquarters!: Warehouse;

    /**
     * If the player lost the game or not.
     */
    public lost!: boolean;

    /**
     * The name of the player.
     */
    public readonly name!: string;

    /**
     * This player's opponent in the game.
     */
    public readonly opponent!: Player;

    /**
     * All the PoliceDepartments owned by this player.
     */
    public policeDepartments!: PoliceDepartment[];

    /**
     * The reason why the player lost the game.
     */
    public reasonLost!: string;

    /**
     * The reason why the player won the game.
     */
    public reasonWon!: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * All the warehouses owned by this player. Includes the Headquarters.
     */
    public warehouses!: Warehouse[];

    /**
     * All the WeatherStations owned by this player.
     */
    public weatherStations!: WeatherStation[];

    /**
     * If the player won the game or not.
     */
    public won!: boolean;

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a Player is created.
     *
     * @param args - Initial value(s) to set member variables to.
     * @param required - Data required to initialize this (ignore it).
     */
    constructor(
        // never directly created by game developers
        args: PlayerConstructorArgs,
        required: Readonly<BaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    // Any public functions can go here for other things in the game to use.
    // NOTE: Client AIs cannot call these functions, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

import { IBaseGameObjectRequiredData } from "~/core/game";
import { IBasePiratesPlayer } from "./";
import { AI } from "./ai";
import { GameObject } from "./game-object";
import { Port } from "./port";
import { Unit } from "./unit";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements IBasePiratesPlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * The amount of gold this Player has in reserve.
     */
    public gold!: number;

    /**
     * The amount of infamy this Player has.
     */
    public infamy!: number;

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
     * The Port owned by this Player.
     */
    public readonly port!: Port;

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
     * Every Unit owned by this Player.
     */
    public units!: Unit[];

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
        args: Readonly<IBasePiratesPlayer>,
        required: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super(args, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Calculates the net worth of this player.
     *
     * @returns The net worth of this player.
     */
    public netWorth(): number {
        let worth = this.gold;
        for (const unit of this.units) {
            // Ignore dead units
            if (!unit.tile) {
                continue;
            }

            // Calculate net worth of unit
            if (unit.shipHealth > 0) {
                worth += this.game.shipCost;
            }

            worth += unit.crew * this.game.crewCost + unit.gold;
        }

        return worth;
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: protected-private-functions -->>
}

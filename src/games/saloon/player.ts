import { BaseGameObjectRequiredData } from "~/core/game";
import { BaseSaloonPlayer, PlayerConstructorArgs } from "./";
import { AI } from "./ai";
import { Cowboy } from "./cowboy";
import { GameObject } from "./game-object";
import { YoungGun } from "./young-gun";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * A player in this game. Every AI controls one player.
 */
export class Player extends GameObject implements BaseSaloonPlayer {
    /** The AI controlling this Player */
    public readonly ai!: AI;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    public readonly clientType!: string;

    /**
     * Every Cowboy owned by this Player.
     */
    public cowboys!: Cowboy[];

    /**
     * How many enemy Cowboys this player's team has killed.
     */
    public kills!: number;

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
     * The reason why the player lost the game.
     */
    public reasonLost!: string;

    /**
     * The reason why the player won the game.
     */
    public reasonWon!: string;

    /**
     * How rowdy their team is. When it gets too high their team takes a
     * collective siesta.
     */
    public rowdiness!: number;

    /**
     * How many times their team has played a piano.
     */
    public score!: number;

    /**
     * 0 when not having a team siesta. When greater than 0 represents how many
     * turns left for the team siesta to complete.
     */
    public siesta!: number;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    public timeRemaining!: number;

    /**
     * If the player won the game or not.
     */
    public won!: boolean;

    /**
     * The YoungGun this Player uses to call in new Cowboys.
     */
    public readonly youngGun!: YoungGun;

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

    /**
     * Adds rowdiness to the player, which may cause a siesta
     *
     * @param rowdiness The amount of rowdiness to add
     */
    public addRowdiness(rowdiness: number): void {
        this.rowdiness += rowdiness;

        if (this.rowdiness >= this.game.rowdinessToSiesta) {
            this.rowdiness = 0;
            this.siesta = this.game.siestaLength;

            // siesta!
            for (const cowboy of this.cowboys) {
                if (cowboy.isDead) {
                    continue;
                }

                cowboy.turnsBusy = this.game.siestaLength;
                cowboy.isDrunk = true;
                // they don't move in a direction during a siesta
                cowboy.drunkDirection = "";
                cowboy.canMove = false;
                cowboy.focus = 0;
            }
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}

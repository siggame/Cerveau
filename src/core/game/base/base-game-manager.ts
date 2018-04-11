import { Event, Signal } from "ts-typed-events";
import { BaseClient } from "~/core/clients/";
import { DeltaMergeable } from "~/core/game";
import { RandomNumberGenerator } from "~/core/game/random-number-generator";
import { BaseGame } from "./base-game";
import { IBaseGameNamespace } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { BaseGameObjectFactory } from "./base-game-object-factory";
import { IBaseGameSettings } from "./base-game-settings";
import { IBasePlayer } from "./base-player";

/**
 * the base game plugin new games should inherit from.
 */
export class BaseGameManager {
    public static get gameName(): string {
        return "BaseGame";
    }

    public static get requiredNumberOfPlayers(): number {
        return 0;
    }

    public static get aliases(): string[] {
        return [];
    }

    /**
     * A factory that can create game objects for this manager's game.
     */
    public readonly create: BaseGameObjectFactory;

    /**
     * The game this GameManager is managing
     */
    public readonly game: BaseGame;

    /**
     * This is aa Pseudo-Random Number Generator that is synced with the game
     * clients and game log to perform random but tracked events from a stored
     * seed.
     */
    public readonly random: RandomNumberGenerator;

    private isOver = false;
    private nextGameObjectID = 0;

    /** Mapping of a player to their client */
    private playerToClient = new Map<IBasePlayer, BaseClient>();

    constructor(
        private readonly namespace: IBaseGameNamespace,
        settings: IBaseGameSettings,
        clients: BaseClient[],
        rootDeltaMergeable: DeltaMergeable,
        sessionID: string,
        gameStarted: Signal,
        private gameOverCallback: () => void,
    ) {
        if (!settings.randomSeed) {
            // tslint:disable-next-line:no-math-random - because this is the only place we use old random
            settings.randomSeed = Math.random().toString(36).substring(2);
        }
        this.random = new RandomNumberGenerator(settings.randomSeed);

        const invalidateRun = (player: IBasePlayer,
                               gameObject: BaseGameObject,
                               functionName: string,
                               args: Map<string, any>,
        ) => {
            return this.invalidateRun(player, gameObject, functionName, args);
        };

        for (const client of clients) {
            client.aiManager!.invalidateRun = invalidateRun;
        }

        const gameCreated = new Event<{game: BaseGame, gameObjectsDeltaMergeable: DeltaMergeable}>();

        gameCreated.once(({ game }) => {
            (this.game as any) = game; // will happen synchronously, but TS doesn't know
        });

        // TODO this needs to be ready BEFORE the game...
        this.create = new this.namespace.GameObjectFactory(
            this.namespace,
            this.generateNextGameObjectID,
            gameCreated,
        );

        this.game = new this.namespace.Game(settings, {
            namespace,
            clients,
            rootDeltaMergeable,
            manager: this,
            playerIDs: clients.map(() => this.generateNextGameObjectID()),
            schema: this.namespace.gameObjectsSchema.Game,
            gameCreated,
            sessionID,
        });

        for (const client of clients) {
            client.events.disconnected.once(() => this.playerDisconnected(client.player!));
            this.playerToClient.set(client.player!, client);
        }

        gameStarted.once(() => this.start());
    }

    /**
     * declares some player(s) as having lost, and assumes when a player looses
     * the rest could still be competing to win.
     * @param reason the reason they lost
     * @param loser the player that lost the game
     * @param losers additional player(s) that lost the game
     */
    public declareLoser(reason: string, loser: IBasePlayer, ...losers: IBasePlayer[]): void {
        losers.push(loser);
        for (const player of losers) {
            this.setPlayerLost(player, reason);
        }
    }

    /**
     * declares some player(s) as having won, and assumes when a player wins the
     * rest have lost if they have not won already
     * @param reason the reason they won
     * @param winner the winner of the game
     * @param winners additional the player(s) that won the game
     */
    public declareWinner(reason: string, winner: IBasePlayer, ...winners: IBasePlayer[]): void {
        winners.push(winner);
        for (const player of winners) {
            player.lost = false;
            player.reasonLost = "";
            player.won = true;
            player.reasonWon = reason;
        }

        this.checkForGameOver();
    }

    /**
     * End the game via coin flip (1 random winner, the rest lose)
     *
     * @param [reason="Draw"] - optional reason why win via coin flip is happening
     */
    public makePlayerWinViaCoinFlip(reason: string = "Draw"): void {
        // Win via coin flip - if we got here no player won via game rules.
        // They probably played identically to each other.
        const players = this.game!.players.filter((p) => !p.won && !p.lost);

        const winnerIndex = this.random.int(players.length);
        for (let i = 0; i < players.length; i++) {
            if (i === winnerIndex) {
                this.declareWinner(`${reason} - Won via coin flip.`, players[i]);
            }
            else {
                this.declareLoser(`${reason} - Lost via coin flip.`, players[i]);
            }
        }
    }

    /**
     * You **MUST** call this to let everything know the game is over and
     * all the clients should be notified
     * @param reason the reason the game is over to set for any players that
     * have not already won or lost the game
     */
    public endGame(reason: string = "Draw"): void {
        const playingPlayers = this.game.players.filter((p) => !p.won && !p.lost);
        if (playingPlayers.length > 0) {
            this.declareLoser(reason, playingPlayers.pop()!, ...playingPlayers);
        }

        this.isOver = true;
        this.gameOverCallback();
    }

    /**
     * Checks if the game is over
     * @returns true if the game is over, false otherwise
     */
    public isGameOver(): boolean {
        return this.isOver;
    }

    /**
     * Invoked when the game starts and we should send orders.
     * The Game and this GameManager will have already been constructed
     */
    protected start(): void {
        // pass, intended to be overridden
    }

    /**
     * Generates a new id string for a new game object
     * @returns a string for the new id. **must be unique**s
     */
    protected generateNextGameObjectID = () => {
        // returns this._nextGameObjectID then increments by 1 (that's how post++ works FYI)
        return String(this.nextGameObjectID++);
    }

    /**
     * Invoked any time an AI wants to run some game object function.
     * If a string is returned that is the reason why it is invalid.
     * @param player the player invoking the function
     * @param gameObject the game object being invoked on
     * @param functionName the string name of the function
     * @param args the key/value pair args to the function
     * @returns a string if the run is invalid, nothing if valid
     */
    protected invalidateRun(
        player: IBasePlayer,
        gameObject: BaseGameObject,
        functionName: string,
        args: Map<string, any>,
    ): string | undefined {
        // all runs are valid by default
        return undefined;
    }

    /**
     * Called when a client disconnected to remove the client from the game and
     * check if they have a player and if removing them alters the game
     * @param player - the player whose client disconnected
     */
    private playerDisconnected(player: IBasePlayer): void {
        if (player && !this.isOver) {
            this.declareLoser("Disconnected during gameplay.", player);

            const losers = this.game.players.filter((p) => p.lost);
            if (losers.length === this.game.players.length - 1) {
                // then only one player is left in the game, he wins!

                // and this is them!
                const winner = this.game.players.find((p) => !p.lost)!;

                const allLosersDisconnected = losers
                    .filter(
                        (p) => this.playerToClient.get(p)!.hasDisconnected(),
                    )
                    .length === losers.length;

                const allLosersTimedOut = losers
                    .filter(
                        (p) => this.playerToClient.get(p)!.hasTimedOut(),
                    )
                    .length === losers.length;

                let reasonWon = "All other players lost.";
                if (allLosersDisconnected) {
                    reasonWon = "All other players disconnected.";
                }
                if (allLosersTimedOut) {
                    reasonWon = "All other players timed out.";
                }

                this.declareWinner(reasonWon, winner);
                this.endGame();
            }
        }
    }

    /**
     * The player that lost the game
     * @param loser the loser
     * @param reason the reason they lost
     */
    private setPlayerLost(loser: IBasePlayer, reason: string): void {
        loser.lost = true;
        loser.reasonLost = reason;
        loser.won = false;
        loser.reasonWon = "";
    }

    /**
     * Does a basic check if this game is over because there is a winner (all
     * other players have lost). For game logic related winner checking you
     * should write your own checkForWinner() function on the sub class.
     */
    private checkForGameOver(): void {
        if (this.game.players.find((p) => p.won)) { // someone has won, so let's end this
            this.isOver = true;

            for (const player of this.game!.players) {
                if (!player.won && !player.lost) { // then they are going to loose
                    this.setPlayerLost(player, "Other player won");
                }
            }
        }
    }
}

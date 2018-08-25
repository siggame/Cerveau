import { Event, Signal } from "ts-typed-events";
import { BaseClient } from "~/core/clients/";
import { BaseGameSettingsManager, DeltaMergeable } from "~/core/game";
import { RandomNumberGenerator } from "~/core/game/random-number-generator";
import { MutableRequired } from "~/utils";
import { BaseGame } from "./base-game";
import { IBaseGameNamespace } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { BaseGameObjectFactory } from "./base-game-object-factory";
import { IBasePlayer } from "./base-player";

type MutableGame = MutableRequired<BaseGame>;

/**
 * the base game plugin new games should inherit from.
 */
export class BaseGameManager {
    /** A list of aliases (case insensitive) that map to this game name. */
    public static get aliases(): string[] {
        return [];
    }

    /** The number of players required for this game to play. */
    public static get requiredNumberOfPlayers(): number {
        return 0;
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

    /** If the game this managers is over. */
    private isOver = false;

    /** The next game object id to use for new game objects. */
    private nextGameObjectID = 0;

    /** Mapping of a player to their client. */
    private playerToClient = new Map<IBasePlayer, BaseClient>();

    /**
     * Creates a new game manager, and in turn it's game. Should be done by
     * the Session.
     *
     * @param namespace - The namespace this manager is a part of.
     * @param settingsManager - The current settings to use.
     * @param clients - The clients in this game, including spectators.
     * @param rootDeltaMergeable - The root delta mergeable to subscribe to.
     * @param sessionID - The id of the session we are in.
     * @param gameStarted - A signal to emit once the game is created.
     * @param gameOverCallback - A callback to invoke once the game is over.
     */
    constructor(
        private readonly namespace: IBaseGameNamespace,
        settingsManager: BaseGameSettingsManager,
        clients: BaseClient[],
        rootDeltaMergeable: DeltaMergeable,
        sessionID: string,
        gameStarted: Signal,
        private gameOverCallback: () => void,
    ) {
        const settings = settingsManager.values;

        if (!settings.randomSeed) {
            // This is the only place we use old random
            // tslint:disable-next-line:no-math-random insecure-random
            settings.randomSeed = Math.random().toString(36).substring(2);
        }
        this.random = new RandomNumberGenerator(settings.randomSeed);

        const invalidateRun = (player: IBasePlayer,
                               gameObject: BaseGameObject,
                               functionName: string,
                               args: Map<string, unknown>,
        ) => {
            return this.invalidateRun(player, gameObject, functionName, args);
        };

        for (const client of clients) {
            if (client.aiManager) {
                client.aiManager.invalidateRun = invalidateRun;
            }
        }

        const gameCreated = new Event<{
            game: BaseGame;
            gameObjectsDeltaMergeable: DeltaMergeable;
        }>();

        // This will happen synchronously, but TS can't know that.
        gameCreated.once(({ game }) => {
            (this.game as MutableGame) = game;
        });

        this.create = new this.namespace.GameObjectFactory(
            this.namespace,
            this.generateNextGameObjectID,
            gameCreated,
        );

        this.game = new this.namespace.Game(settingsManager, {
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
            if (client.player) {
                client.events.disconnected.once(() => {
                    if (!client.player) {
                        throw new Error("Client disconnected without player!");
                    }

                    this.playerDisconnected(client.player);
                });

                this.playerToClient.set(client.player, client);
            }
        }

        gameStarted.once(() => this.start());
    }

    /**
     * Declares some player as having lost, and assumes when a player looses
     * the rest could still be competing to win.
     *
     * @param reason - The reason they lost.
     * @param loser - The player that lost the game.
     */
    public declareLoser(
        reason: string,
        loser: IBasePlayer,
    ): void {
        this.declareLosers(reason, loser);
    }

    /**
     * Declares some player(s) as having lost, and assumes when a player looses
     * the rest could still be competing to win.
     *
     * @param reason - The reason they lost.
     * @param losers - The player(s) that lost the game.
     */
    public declareLosers(
        reason: string,
        ...losers: IBasePlayer[]
    ): void {
        for (const player of losers) {
            this.setPlayerLost(player, reason);
        }
    }

    /**
     * Declares some player(s) as having won, and assumes when a player wins
     * the rest have lost if they have not won already.
     *
     * @param reason - The reason they won.
     * @param winner - The player that won the game.
     */
    public declareWinner(
        reason: string,
        winner: IBasePlayer,
    ): void {
        this.declareWinners(reason, winner);
    }

    /**
     * Declares some player(s) as having won, and assumes when a player wins
     * the rest have lost if they have not won already.
     *
     * @param reason - The reason they won.
     * @param winners - The player(s) that won the game.
     */
    public declareWinners(
        reason: string,
        ...winners: IBasePlayer[]
    ): void {
        for (const player of winners) {
            player.lost = false;
            player.reasonLost = "";
            player.won = true;
            player.reasonWon = reason;
        }

        this.checkForGameOver();
    }

    /**
     * End the game via coin flip (1 random winner, the rest lose).
     *
     * @param reason - An optional reason why win via coin flip is happening.
     */
    public makePlayerWinViaCoinFlip(reason: string = "Draw"): void {
        // Win via coin flip - if we got here no player won via game rules.
        // They probably played identically to each other.
        const players = this.game.players.filter((p) => !p.won && !p.lost);

        if (players.length > 0) {
            if (players.length === this.game.players.length) {
                // no winners yet, so a random one wins
                const winnerIndex = this.random.int(players.length);
                // this has the side effect of removing it from players
                const winner = players.splice(winnerIndex, 1)[0];

                this.declareWinner(`${reason} - Won via coin flip.`, winner);
            }

            // the rest of the players lose
            this.declareLosers(`${reason} - Lost via coin flip.`, ...players);
        }

        this.endGame();
    }

    /**
     * You **MUST** call this to let everything know the game is over and
     * all the clients should be notified
     *
     * @param reason - The reason the game is over to set for any players that
     * have not already won or lost the game.
     */
    public endGame(reason: string = "Draw"): void {
        if (!this.isOver) {
            const playingPlayers = this.game.players.filter((p) => !p.won && !p.lost);
            if (playingPlayers.length > 0) {
                this.declareLosers(reason, ...playingPlayers);
            }

            this.isOver = true;
            this.gameOverCallback();
        }
    }

    /**
     * Checks if the game is over.
     *
     * @returns True if the game is over, false otherwise.
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
     * Generates a new id string for a new game object.
     *
     * @returns A string for the new id. **Must be unique**
     */
    protected generateNextGameObjectID = () => {
        // returns this.nextGameObjectID then increments by 1
        return String(this.nextGameObjectID++);
    }

    /**
     * Invoked any time an AI wants to run some game object function.
     * If a string is returned that is the reason why it is invalid.
     *
     * @param player - The player invoking the function.
     * @param gameObject - The game object being invoked on.
     * @param functionName - The string name of the function.
     * @param args - The key/value pair args to the function.
     * @returns A string if the run is invalid, nothing if valid.
     */
    protected invalidateRun(
        player: IBasePlayer,
        gameObject: BaseGameObject,
        functionName: string,
        args: Map<string, unknown>,
    ): string | undefined {
        // all runs are valid by default
        return undefined;
    }

    /**
     * Called when a client disconnected to remove the client from the game and
     * checks if they have a player and if removing them alters the game.
     *
     * @param player - The player whose client disconnected.
     */
    private playerDisconnected(player: IBasePlayer): void {
        if (player && !this.isOver) {
            this.declareLoser("Disconnected during gameplay.", player);

            const losers = this.game.players.filter((p) => p.lost);
            if (losers.length === this.game.players.length - 1) {
                // then only one player is left in the game, he wins!

                // and this is them!
                const winner = this.game.players.find((p) => !p.lost);

                if (!winner) {
                    throw new Error("No winner found when one should exist!");
                }

                const allLosersDisconnected = losers
                    .filter(
                        (p) => this.unsafeGetClient(p).hasDisconnected(),
                    )
                    .length === losers.length;

                const allLosersTimedOut = losers
                    .filter(
                        (p) => this.unsafeGetClient(p).hasTimedOut(),
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
        if (this.game.players.find((p) => p.won)) {
            for (const player of this.game.players) {
                if (!player.won && !player.lost) {
                    // then they are going to loose because the game is over
                    this.setPlayerLost(player, "Other player won");
                }
            }
        }
    }

    /**
     * Gets a client for a given player, or throws an Error if non exists.
     * @param player - The player to get the client for.
     * @returns A client, always.
     */
    private unsafeGetClient(player: IBasePlayer): BaseClient {
        const client = this.playerToClient.get(player);

        if (!client) {
            throw new Error(`No client for player ${player}`);
        }

        return client;
    }
}

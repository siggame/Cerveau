import {
    Delta,
    FinishedDelta,
    Gamelog,
    OrderDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import delay from "delay";
import { writeFile } from "fs-extra";
import { join } from "path";
import { Event, events } from "ts-typed-events";
import { Profiler } from "v8-profiler"; // should be safe as it's from @types
import { BaseClient, BasePlayingClient, ClientInfo } from "~/core/clients";
import { Config } from "~/core/config";
import { BaseAIManager } from "~/core/game/base/base-ai-manager";
import { BaseGame } from "~/core/game/base/base-game";
import { BaseGameManager } from "~/core/game/base/base-game-manager";
import { BaseGameNamespace } from "~/core/game/base/base-game-namespace";
import { BaseGameSanitizer } from "~/core/game/base/base-game-sanitizer";
import { BaseGameSettingsManager } from "~/core/game/base/base-game-settings";
import { DeltaManager } from "~/core/game/delta-manager";
import { GamelogScribe } from "~/core/game/gamelog/gamelog-scribe";
import {
    filenameFor,
    getURL,
    getVisualizerURL,
} from "~/core/game/gamelog/gamelog-utils";
import { logger } from "~/core/logger";
import { Immutable, isObjectEmpty, momentString } from "~/utils";

/** Data about when a session ends. */
export interface SessionEnded {
    /** The clients as the game ended. */
    clientInfos: Immutable<ClientInfo[]>;
    /** The gamelog resulting from the game. */
    gamelog: Immutable<Gamelog>;
}

const TIMEOUT_PADDING = 30 * 1000; // 30 sec padding for internal computations

let profiler: Profiler | undefined;
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
void import("v8-profiler")
    .then((imported) => {
        profiler = imported;
    })
    .catch((err) => {
        if (Config.RUN_PROFILER) {
            logger.error("Error importing profiler with RUN_PROFILER enabled");
            logger.error(err as Error);

            process.exit(1);
        }
    });

/**
 * Session: the server that handles of communications between a game and its
 * clients, on a separate thread than the lobby.
 */
export class Session {
    /** The events this Session emits. */
    public readonly events = events({
        /** Emitted once everything is setup and the game should start. */
        start: new Event(),

        /**
         * Emitted once the game is over, however not before the session is
         * over and the gamelog is ready.
         */
        gameOver: new Event(),

        /** Emitted once this session is over and we can be deleted. */
        ended: new Event<Error | SessionEnded>(),

        // -- Events proxies through from AIs in our game -- \\
        aiOrdered: new Event<Immutable<OrderDelta["data"]>>(),
        aiRan: new Event<Immutable<RanDelta["data"]>>(),
        aiFinished: new Event<Immutable<FinishedDelta["data"]>>(),
    });

    /** The session ID. */
    public readonly id: string;

    /** The name of the game we are playing. */
    public readonly gameName: string;

    /** If a fatal error occurred, it is stored here. */
    private fatal?: Error;

    /** All the clients in this game. */
    private readonly clients: ReadonlyArray<BaseClient>;

    /**
     * The scribe that logs events (deltas) from the game, to make the gamelog.
     */
    private readonly gamelogScribe: GamelogScribe;

    /** The manager for the game. */
    private readonly gameManager: BaseGameManager;

    /** The namespace of the game we are running. */
    private readonly gameNamespace: Immutable<BaseGameNamespace>;

    /** The game we are running. The GameManager actually creates it. */
    private readonly game: BaseGame;

    /** The manager of deltas for the game, which the game logger will log. */
    private readonly deltaManager = new DeltaManager();

    /** A timeout to self terminate in case a game gets "stuck". */
    private timeout?: NodeJS.Timer;

    /**
     * Initializes a new session with data to create and run the game.
     *
     * @param args - The initialization args required to hookup a game.
     * @param args.id - The id of the session (room name).
     * @param args.gameNamespace - The namespace of the game we are playing.
     * @param args.gameSettingsManager - The settings for this game.
     * @param args.clients - The clients in this game.
     */
    constructor(args: {
        /** The id of this session. Passed around as session: string often. */
        id: string;
        /** The namespace of this game to create new instances from. */
        gameNamespace: Immutable<BaseGameNamespace>;
        /** The already active game manager that holds AIs. */
        gameSettingsManager: BaseGameSettingsManager;
        /** The clients connected to this session. Includes spectators and players. */
        clients: ReadonlyArray<BaseClient>;
    }) {
        this.id = args.id;
        this.gameNamespace = args.gameNamespace;
        this.gameName = args.gameNamespace.gameName;
        this.clients = args.clients;

        // Now we have all our clients, so let's make the structures to play
        // the game with.

        const n = this.gameNamespace.GameManager.requiredNumberOfPlayers;

        // NOTE: the game only knows about clients playing, this session will
        // care about spectators sending them deltas a such.
        // Therefore, the game never needs to know of their existence.
        const nonSpectators = this.clients.filter(
            (c) => !c.isSpectating,
        ) as BasePlayingClient[];

        const playingClients = new Array<BasePlayingClient>(n);
        const noIndexClients = [] as typeof nonSpectators;
        for (const client of nonSpectators) {
            const index = client.playerIndex;
            if (index === undefined) {
                noIndexClients.push(client);
            } else {
                playingClients[index] = client;
            }
        }

        // now we've filled in the clients that requested index, backfill those that did not
        for (let i = 0; i < n; i++) {
            const client = playingClients[i];
            if (client) {
                continue;
            }

            const clientNeedingIndex = noIndexClients.shift();
            if (!clientNeedingIndex) {
                break; // no more clients to add
            }
            playingClients[i] = clientNeedingIndex;
        }

        const gameSanitizer = new BaseGameSanitizer(args.gameNamespace);
        for (const client of playingClients) {
            client.aiManager = new BaseAIManager(
                client,
                gameSanitizer,
                args.gameNamespace,
            );

            client.aiManager.events.ordered.on((ordered) => {
                this.events.aiOrdered.emit(ordered);
            });

            client.aiManager.events.finished.on((finished) => {
                this.events.aiFinished.emit(finished);
            });

            client.aiManager.events.ran.on((ran) => {
                this.events.aiRan.emit(ran);
            });
        }

        if (Config.RUN_PROFILER && profiler) {
            profiler.startProfiling();
        }

        if (Config.SESSION_TIMEOUTS_ENABLED) {
            this.startTimeout(args.gameSettingsManager);
        }

        const started = new Event();

        this.gameManager = new args.gameNamespace.GameManager(
            args.gameNamespace,
            args.gameSettingsManager,
            playingClients,
            this.deltaManager.rootDeltaMergeable,
            this.id,
            started,
            () => this.handleGameOver(),
        );
        this.game = this.gameManager.game;

        this.gamelogScribe = new GamelogScribe(
            this.game,
            args.gameNamespace.gameVersion,
            this,
            playingClients,
            this.deltaManager,
        );
        this.gamelogScribe.events.logged.on(this.sendDeltas);

        logger.info(`${this.gameName} - ${this.id} is starting.`);
        this.events.start.emit();

        for (const client of this.clients) {
            void client.send({
                event: "start",
                data: { playerID: client.player && client.player.id },
            });
        }

        started.emit();
    }

    /**
     * When a fatal (unhandled) error occurs we need to exit and kill all
     * clients, and then end this session.
     *
     * @param err - The unhandled error.
     * @returns Once all the cleanup is done.
     */
    public async kill(err: Error | string): Promise<void> {
        logger.error(String(err));
        const fatal = typeof err === "string" ? new Error(err) : err;

        this.fatal = fatal;

        await Promise.all(
            [...this.clients].map((client) => {
                return client.disconnect(
                    `An unhandled fatal error occurred on the server:

${fatal.message}`,
                );
            }),
        );

        await this.end();
    }

    /**
     * Called when the game ends, so that this thread "ends".
     *
     * @param gamelog - The gamelog we made to send back to the master thread.
     */
    private async end(gamelog?: Readonly<Gamelog>): Promise<void> {
        if (this.timeout) {
            // then we are done, so we cannot timeout
            clearTimeout(this.timeout);
        }

        await this.stopProfiler();

        // TODO: find a way to make this delay un-needed.
        // As it stands without it some clients won't get the last event "over"
        // and sit and listen forever
        await delay(1000); // 1 second

        const message = `${this.gameName} - ${this.id} is over.`;
        if (gamelog) {
            logger.info(message);
        } else {
            logger.warn(`${message} But no gamelog!`);
        }

        this.events.ended.emit(
            this.fatal ||
                (gamelog
                    ? {
                          gamelog,
                          clientInfos: this.getClientInfos(),
                      }
                    : new Error("No gamelog!")),
        );
    }

    /**
     * Stops the profiler and generates a profile if running.
     *
     * @returns A promise that resolves once the profile is written to disk,
     * or immediately if no profiler is running.
     */
    private stopProfiler(): Promise<void> {
        return new Promise((resolve) => {
            if (!Config.RUN_PROFILER || !profiler) {
                resolve();

                return;
            }

            const profile = profiler.stopProfiling();
            profile.export((err, result) => {
                if (err) {
                    resolve();
                    return;
                }

                const dateTime = momentString();
                writeFile(
                    join(
                        Config.LOGS_DIR,
                        "profiles/",
                        `${this.gameName}-${this.id}-${dateTime}.cpuprofile`,
                    ),
                    result,
                    () => {
                        profile.delete();
                        resolve();
                    },
                );
            });

            resolve();
        });
    }

    /**
     * Starts a timeout to automatically kill this game session if the game
     * goes on too long. Useful for game servers hosted over long periods of
     * time so they clean up zombie sessions.
     *
     * @param gameSettingsManager - The game settings for this session.
     */
    private startTimeout(gameSettingsManager: BaseGameSettingsManager): void {
        const maxTimePerPlayer = gameSettingsManager.getMaxPlayerTime();
        const { requiredNumberOfPlayers } = this.gameNamespace.GameManager;
        const maxTime = maxTimePerPlayer * requiredNumberOfPlayers;

        // We now know the maximum number amount of time that all clients
        // can use accumulatively. However we need to account for server-side
        // processing time, so do a rough approximation and double it.
        // some padding for internal computations
        let timeoutTime = maxTime * 2 * 1e-6 + TIMEOUT_PADDING; // convert ns to ms

        if (timeoutTime <= 0) {
            // It is invalid, so they probably set a custom timeout time of 0,
            // so we'll default to 30min as that is a reasonable amount of
            // debug time.
            timeoutTime = 1.8e6; // 30 minutes as ms
        }

        this.timeout = setTimeout(() => {
            this.timeout = undefined;
            // if this triggers the game of this session timed out, so kill it
            void this.kill(`Game session timed out after ${timeoutTime} ms.`);
        }, timeoutTime);
    }

    // private updateDeltas(type: "over", data?: undefined): void;

    /**
     * When the game state changes the clients need to know, and we need to
     * check if that game ended when its state changed.
     *
     * @param delta - The Delta to send to all clients.
     */
    private readonly sendDeltas = (delta: Immutable<Delta>): void => {
        if (!isObjectEmpty(delta.game)) {
            for (const client of this.clients) {
                // TODO: different deltas by player for hidden object games
                void client.send(
                    client.sendMetaDeltas
                        ? { event: "meta-delta", data: delta }
                        : { event: "delta", data: delta.game },
                );
            }
        }

        if (this.gameManager.isGameOver()) {
            // We no longer need to send deltas because the game is over and
            // the last delta was just sent above.
            this.gamelogScribe.events.logged.off(this.sendDeltas);
        }
    };

    /**
     * Called when the game has ended (is over) and the clients need to know,
     * and the gamelog needs to be generated.
     */
    private handleGameOver(): void {
        this.events.gameOver.emit();

        const gamelog = this.gamelogScribe.gamelog;

        const gamelogFilename = filenameFor(gamelog);
        const gamelogURL = getURL(gamelogFilename);

        const visualizerURL = getVisualizerURL(gamelogFilename);
        const message =
            visualizerURL &&
            `---
Your gamelog is viewable at:
${visualizerURL}
---`;

        for (const client of this.clients) {
            void client.send({
                event: "over",
                data: { gamelogURL, visualizerURL, message },
            });
        }

        void this.end(gamelog);
    }

    /**
     * Gets the current client infos for all out clients.
     *
     * @returns A new array of client infos for soft client information.
     */
    private getClientInfos(): ClientInfo[] {
        return this.clients.map((client, index) => ({
            name: client.name,
            spectating: client.isSpectating,

            ...(client.player
                ? {
                      index,
                      won: client.player.won,
                      lost: client.player.lost,
                      reason:
                          client.player.reasonWon || client.player.reasonLost,
                      disconnected:
                          (!client.player.won && client.hasDisconnected()) ||
                          false,
                      timedOut:
                          (!client.player.won && client.hasTimedOut()) ||
                          false,
                  }
                : null),
        }));
    }
}

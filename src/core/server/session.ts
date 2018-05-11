import * as delay from "delay";
import { writeFile } from "fs-extra";
import { join } from "path";
import { Event, events, Signal } from "ts-typed-events";
import { Profiler } from "v8-profiler"; // should be safe as it's from @types
import { BaseClient } from "~/core/clients";
import { Config } from "~/core/config";
import { BaseAIManager } from "~/core/game/base/base-ai-manager";
import { BaseGame } from "~/core/game/base/base-game";
import { BaseGameManager } from "~/core/game/base/base-game-manager";
import { IBaseGameNamespace } from "~/core/game/base/base-game-namespace";
import { BaseGameSanitizer } from "~/core/game/base/base-game-sanitizer";
import { BaseGameSettingsManager } from "~/core/game/base/base-game-settings";
import { DeltaManager } from "~/core/game/delta-manager";
import { IDelta, IFinishedDeltaData, IGamelog,
         IOrderedDeltaData, IRanDeltaData,
       } from "~/core/game/gamelog/gamelog-interfaces";
import { GamelogScribe } from "~/core/game/gamelog/gamelog-scribe";
import { filenameFor, getURL, getVisualizerURL,
       } from "~/core/game/gamelog/gamelog-utils";
import { logger } from "~/core/log";
import { isObjectEmpty, momentString } from "~/utils";

let profiler: Profiler | undefined;
import("v8-profiler")
    .then((imported) => {
        profiler = imported;
    })
    .catch((err) => {
        if (Config.RUN_PROFILER) {
            logger.error("Error importing profiler with RUN_PROFILER enabled");
            logger.error(err);

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
        /** Emitted once everything is setup and the game should start */
        start: new Signal(),

        /**
         * Emitted once the game is over, however not before the session is
         * over and the gamelog is ready.
         */
        gameOver: new Signal(),

        /** Emitted once this session is over and we can be deleted. */
        ended: new Event<Error | IGamelog>(),

        // -- Events proxies through from AIs in our game -- \\
        aiOrdered: new Event<IOrderedDeltaData>(),
        aiRan: new Event<IRanDeltaData>(),
        aiFinished: new Event<IFinishedDeltaData>(),
    });

    /** The session ID. */
    public readonly id: string;

    /** The name of the game we are playing. */
    public readonly gameName: string;

    /** If a fatal error occurred, it is stored here. */
    private fatal?: Error;

    /** All the clients in this game. */
    private readonly clients: BaseClient[];

    /**
     * The scribe that logs events (deltas) from the game, to make the gamelog.
     */
    private readonly gamelogScribe: GamelogScribe;

    /** The manager for the game. */
    private readonly gameManager: BaseGameManager;

    /** The namespace of the game we are running. */
    private readonly gameNamespace: IBaseGameNamespace;

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
     */
    constructor(args: {
        id: string;
        gameNamespace: IBaseGameNamespace;
        gameSettingsManager: BaseGameSettingsManager;
        clients: BaseClient[];
    }) {
        this.id = args.id;
        this.gameNamespace = args.gameNamespace;
        this.gameName = args.gameNamespace.gameName;
        this.clients = args.clients;

        // Now we have all our clients, so let's make the structures to play
        // the game with.

        // NOTE: the game only knows about clients playing, this session will
        // care about spectators sending them deltas a such.
        // Therefore, the game never needs to know of their existence.
        const playingClients = this.clients.filter((c) => !c.isSpectating);

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

        const started = new Signal();

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
            this, playingClients,
            this.deltaManager,
        );
        this.gamelogScribe.events.logged.on(this.sendDeltas);

        logger.info(`${this.gameName} - ${this.id} is starting.`);
        this.events.start.emit();

        for (const client of this.clients) {
            client.send("start", {
                playerID: client.player && client.player.id,
            });
        }

        started.emit();
    }

    /**
     * When a fatal (unhandled) error occurs we need to exit and kill all
     * clients, and then end this session.
     *
     * @param err - the unhandled error
     * @returns once all the cleanup is done
     */
    public async kill(err: Error | string): Promise<void> {
        logger.error(String(err));
        this.fatal = typeof err === "string"
            ? new Error(err)
            : err;

        await Promise.all([...this.clients].map((client) => {
            return client.disconnect(
`An unhandled fatal error occurred on the server:

${this.fatal!.message}`,
            );
        }));

        return await this.end();
    }

    /**
     * Called when the game ends, so that this thread "ends"
     * @param gamelog The gamelog we made to send back to the master thread.
     */
    private async end(gamelog?: IGamelog): Promise<void> {
        if (this.timeout) {
            // then we are done, so we cannot timeout
            clearTimeout(this.timeout);
        }

        await this.stopProfiler();

        // TODO: find a way to make this delay un-needed.
        // As it stands without it some clients won't get the last event "over"
        // and sit and listen forever
        await delay(1000); // 1 second

        logger.info(`${this.gameName} - ${this.id} is over, exiting.`);

        this.events.ended.emit(this.fatal || gamelog!);
    }

    /**
     * Stops the profiler and generates a profile if running.
     *
     * @returns A promise that resolves once the profile is written to disk,
     * or immediately if no profiler is running.
     */
    private stopProfiler(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!Config.RUN_PROFILER || !profiler) {
                return resolve();
            }

            const profile = profiler.stopProfiling();
            profile.export((error, result) => {
                const dateTime = momentString();
                writeFile(
                    join(
                        Config.LOGS_DIR,
                        "profiles/",
                        `${this.gameName}-${this.id}-${dateTime}.cpuprofile`,
                    ),
                    result,
                    (err) => {
                        profile.delete();
                        resolve();
                    },
                );
            });
            return resolve();
        });
    }

    /**
     * Starts a timeout to automatically kill this game session if the game
     * goes on too long. Useful for game servers hosted over long periods of
     * time so they clean up zombie sessions.
     *
     * @param gameSettingsManager The game settings for this session
     */
    private startTimeout(gameSettingsManager: BaseGameSettingsManager): void {
        const maxTimePerPlayer = gameSettingsManager.getMaxPlayerTime();
        const { requiredNumberOfPlayers } = this.gameNamespace.GameManager;
        const maxTime = maxTimePerPlayer * requiredNumberOfPlayers;

        // We now know the maximum number amount of time that all clients
        // can use accumulatively. However we need to account for server-side
        // processing time, so do a rough approximation and double it.
        let timeoutTime = maxTime * 2 * 1e-6; // convert ns to ms

        if (timeoutTime <= 0) {
            // It is invalid, so they probably set a custom timeout time of 0,
            // so we'll default to 30min as that is a reasonable amount of
            // debug time.
            timeoutTime = 1.8e6; // 30 minutes as ms
        }

        this.timeout = setTimeout(() => {
            this.timeout = undefined;
            // if this triggers the game of this session timed out, so kill it
            this.kill(`Game session timed out after ${timeoutTime} ms.`);
        }, timeoutTime);
    }

    // private updateDeltas(type: "over", data?: undefined): void;

    /**
     * When the game state changes the clients need to know, and we need to
     * check if that game ended when its state changed.
     * @param type - the type of delta that ocurred
     * @param [data] - any additional data about what caused the delta
     */
    private readonly sendDeltas = (delta: IDelta) => {
        if (!isObjectEmpty(delta.game)) {
            for (const client of this.clients) {
                // TODO: different deltas by player for hidden object games
                client.send("delta", client.sendMetaDeltas
                    ? delta
                    : delta.game || {},
                );
            }
        }

        if (this.gameManager.isGameOver()) {
            // We no longer need to send deltas because the game is over and
            // the last delta was just sent above.
            this.gamelogScribe.events.logged.off(this.sendDeltas);
        }
    }

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
        const message = visualizerURL &&
`---
Your gamelog is viewable at:
${visualizerURL}
---`;

        for (const client of this.clients) {
            client.send("over", { gamelogURL, visualizerURL, message });
        }

        this.end(gamelog);
    }
}

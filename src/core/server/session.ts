import * as delay from "delay";
// import { writeFile } from "fs";
// import * as moment from "moment";

import { isMaster } from "cluster";
import { Event, events, Signal } from "ts-typed-events";
import { Config } from "~/core/args";
import { BaseClient } from "~/core/clients";
import { DeltaManager } from "~/core/game/delta-manager";
import { GameLogManager } from "~/core/game/game-log-manager";
import { GameLogger } from "~/core/game/game-logger";
import { logger } from "~/core/log";
import { isObjectEmpty } from "~/utils";

// import { startProfiling, stopProfiling } from "v8-profiler";
// TODO: v8-profiler may be missing as it is optional...

// TODO: break this up to be more sensible
import { BaseAIManager, BaseGame, BaseGameManager, BaseGameSanitizer, BaseGameSettingsManager,
    IBaseGameNamespace, IDelta, IFinishedDeltaData, IGamelog, IOrderedDeltaData, IRanDeltaData,
} from "../game/";

/**
 * Session: the server that handles of communications between a game and its
 * clients, on a separate thread than the lobby.
 */
export class Session {
    public readonly events = events({
        /** Emitted once everything is setup and the game should start playing */
        start: new Signal(),
        gameOver: new Signal(),
        ended: new Event<Error | IGamelog>(),
        aiOrdered: new Event<IOrderedDeltaData>(),
        aiRan: new Event<IRanDeltaData>(),
        aiFinished: new Event<IFinishedDeltaData>(),
    });

    public readonly name: string;
    public readonly id: string;
    public readonly gameName: string;

    private fatal?: Error;

    private readonly clients: BaseClient[] = [];
    private readonly gameLogger: GameLogger;
    private readonly gameLogManager = new GameLogManager();
    private readonly gameManager: BaseGameManager;
    private readonly game?: BaseGame;
    private readonly deltaManager = new DeltaManager();

    constructor(args: {
        id: string;
        gameNamespace: IBaseGameNamespace;
        gameSettingsManager: BaseGameSettingsManager;
        clients: BaseClient[];
    }) {
        this.id = args.id;
        this.gameName = args.gameNamespace.GameManager.gameName;
        this.name = `${this.gameName} - ${this.id}`;
        this.clients = args.clients;

        if (!isMaster) { // then we are threaded, add our PID for ease of debugging
            this.name += ` @ ${process.pid}`;
        }

        // Now we have all our clients, so let's make the structures to play
        // the game with.

        // NOTE: the game only knows about clients playing, this session will
        // care about spectators sending them deltas a such,
        // so the game never needs to know of their existence
        const playingClients = this.clients.filter((c) => !c.isSpectating);

        const gameSanitizer = new BaseGameSanitizer(args.gameNamespace);
        for (const client of playingClients) {
            client.aiManager = new BaseAIManager(client, gameSanitizer, args.gameNamespace);

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

        if (Config.RUN_PROFILER) {
            // startProfiling();
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

        this.gameLogger = new GameLogger(this.game, this, playingClients, this.deltaManager);
        this.gameLogger.events.logged.on(this.sendDeltas);

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
     * When a fatal (unhandled) error occurs we need to exit and kill all clients. this does that
     * @param err - the unhandled error
     * @returns once all the cleanup is done
     */
    public async kill(err: Error | string): Promise<void> {
        logger.error(String(err));
        this.fatal = typeof err === "string"
            ? new Error(err)
            : err;

        await Promise.all([...this.clients].map((client) => {
            return client.disconnect("An unhandled fatal error occurred on the server.");
        }));

        return await this.end();
    }

    /**
     * Called when the game ends, so that this thread "ends"
     * @param gamelog the gamelog we made to send back to the master thread
     */
    private async end(gamelog?: IGamelog): Promise<void> {
        await this.stopProfiler();

        // TODO: find a way to make this delay un-needed.
        // As it stands without it some clients won't get the last event "over"
        // and sit and listen forever
        await delay(1000); // 1 second

        logger.info(`${this.gameName} - ${this.id} is over, exiting.`);

        this.events.ended.emit(this.fatal || gamelog!);
    }

    private stopProfiler(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!Config.RUN_PROFILER) {
                return resolve();
            }

            /*
            const profile = stopProfiling();
            profile.export((error, result) => {
                const dateTime = moment().format("YYYY.MM.DD.HH.mm.ss.SSS");
                writeFile(
                    `logs/profiles/profile-${this.gameName}-${this.id}-${dateTime}.cpuprofile`,
                    result,
                    (err) => {
                        profile.delete();
                        resolve();
                    },
                );
            });
            */
            return resolve();
        });
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
            // we no longer need to send deltas because the game is over and the
            // last delta was just sent above
            this.gameLogger.events.logged.off(this.sendDeltas);
        }
    }

    /**
     * Called when the game has ended (is over) and the clients need to know, and the gamelog needs to be generated
     */
    private handleGameOver(): void {
        this.events.gameOver.emit();

        const gamelog = this.gameLogger.gamelog;

        const gamelogFilename = this.gameLogManager.filenameFor(gamelog);
        const gamelogURL = this.gameLogManager.getURL(gamelogFilename);

        const visualizerURL = this.gameLogManager.getVisualizerURL(gamelogFilename);
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

import { Gamelog } from "@cadre/ts-utils/cadre";
import * as cluster from "cluster";
import * as path from "path";
import { events } from "ts-typed-events";
import { Config } from "~/core";
import { Immutable } from "~/utils";
import { Room } from "./lobby-room";
import {
    MessageFromMainThread,
    WorkerGameSessionData,
    WorkerOverMessage,
} from "./worker";

cluster.setupMaster({
    exec: path.join(__dirname, "worker"),
});

/**
 * A LobbyRoom that in intended to be ran in serial
 * (on one thread with the master lobby).
 */
export class ThreadedRoom extends Room {
    /** The Worker thread running this session. */
    private worker?: cluster.Worker;

    /**
     * If this session has a game instance running on a worker thread.
     *
     * @returns True if it is running, false otherwise.
     */
    public isRunning(): boolean {
        return Boolean(this.worker);
    }

    /** Starts the game session by spinning up a true thread for the session. */
    public start(): void {
        super.start();

        this.threadSession();
    }

    /**
     * This happens when there are enough clients to start the game Instance.
     * We start the on a separate "worker" thread, for true multi-threading via
     * cluster.
     */
    protected threadSession(): void {
        // we can only pass strings via environment variables so serialize them
        // here and the worker threads will de-serialize them once running
        const workerSessionData: WorkerGameSessionData = {
            mainDebugPort: (process as NodeJS.Process & {
                /** Special flag for Node to know what port the debugger can bind to. */
                _debugPort?: number;
            })._debugPort,
            sessionID: this.id,
            gameName: this.gameNamespace.gameName,
            gameSettings: this.gameSettingsManager.values,
        };

        this.worker = cluster.fork({
            ...Config, // the worker thread will see these in its process.env
            WORKER_GAME_SESSION_DATA: JSON.stringify(workerSessionData),
        });

        this.worker.on("online", () => {
            if (!this.worker) {
                throw new Error("Threaded room lost worker on online.");
            }

            for (const client of this.clients) {
                // we are about to send it, so we don't want this client object
                // listening to it, as we no longer care.
                client.stopListeningToSocket();
                const socket = client.popNetSocket();

                const clientClass = Object.getPrototypeOf(
                    client,
                ) as typeof client;

                const messageFromMainThread: MessageFromMainThread = {
                    type: "client",
                    clientInfo: {
                        className: clientClass.constructor.name,
                        index: client.playerIndex,
                        name: client.name,
                        type: client.programmingLanguage,
                        spectating: client.isSpectating,
                        metaDeltas: client.sendMetaDeltas,
                    },
                };

                this.worker.send(messageFromMainThread, socket);
            }

            // Tell the worker thread we are done sending client + sockets to
            // them
            this.worker.send({ type: "done" });

            // And remove the clients from us, they are no longer ours to care
            // about; instead the worker thread will handle them from here-on.
            for (const client of this.clients) {
                events.offAll(client.events);
            }
        });

        let overData: WorkerOverMessage = {};
        // this message should only happen once, when the game is over
        this.worker.once("message", (data: WorkerOverMessage) => {
            overData = data;
            void this.cleanUp(data.gamelog);
        });

        this.worker.on("exit", () => {
            this.handleOver(overData.clientInfos);
        });
    }

    /**
     * Cleans up the room by terminating our worker thread.
     *
     * @param gamelog - The gamelog sent from the session.
     * @returns A promise that resolves once we've cleaned up.
     */
    protected async cleanUp(gamelog?: Immutable<Gamelog>): Promise<void> {
        this.worker = undefined; // we are done with that worker thread

        await super.cleanUp(gamelog);
    }
}

import * as cluster from "cluster";
import * as path from "path";
import { events } from "ts-typed-events";
import { Config } from "~/core";
import { IGamelog } from "~/core/game";
import { Room } from "./lobby-room";
import { IWorkerGameSessionData, MessageFromMainThread } from "./worker";

cluster.setupMaster({
    exec: path.join(__dirname, "worker"),
});

/**
 * A LobbyRoom that in intended to be ran in serial
 * (on one thread with the master lobby)
 */
export class ThreadedRoom extends Room {
    /** The Worker thread running this session. */
    private worker?: cluster.Worker;

    /**
     * If this session has a game instance running on a worker thread.
     * @returns true if it is running, false otherwise
     */
    public isRunning(): boolean {
        return Boolean(this.worker);
    }

    public start(): void {
        super.start();

        this.threadInstance();
    }

    /**
     * This happens when there are enough clients to start the game Instance.
     * We start the on a separate "worker" thread, for true multi-threading via
     * cluster
     */
    protected threadInstance(): void {
        // we can only pass strings via environment variables so serialize them
        // here and the worker threads will de-serialize them once running
        this.worker = cluster.fork({
            ...Config, // the worker thread will see these in its process.env
            WORKER_GAME_SESSION_DATA: JSON.stringify({
                mainDebugPort: (process as any)._debugPort, // used by debugger
                sessionID: this.id,
                gameName: this.gameNamespace.GameManager.gameName,
                gameSettings: this.gameSettingsManager.values,
            } as IWorkerGameSessionData),
        });

        this.worker.on("online", () => {
            for (const client of this.clients) {
                // we are about to send it, so we don't want this client object
                // listening to it, as we no longer care.
                client.stopListeningToSocket();

                const clientClass = Object.getPrototypeOf(client);

                this.worker!.send({
                    type: "client",
                    clientInfo: {
                        className: clientClass.constructor.name,
                        index: client.playerIndex,
                        name: client.name,
                        type: client.programmingLanguage,
                        spectating: client.isSpectating,
                        metaDeltas: client.sendMetaDeltas,
                    },
                } as MessageFromMainThread, client.getNetSocket(),
                );
            }

            // Tell the worker thread we are done sending client + sockets to
            // them
            this.worker!.send({ type: "done"} as MessageFromMainThread);

            // And remove the clients from us, they are no longer ours to care
            // about; instead the worker thread will handle them from here-on.
            for (const client of this.clients) {
                events.offAll(client.events);
            }
            this.clients.length = 0;
        });

        // this message should only happen once, when the game is over
        this.worker.once("message", async (data) => {
            if (data.gamelog) {
                this.cleanUp(data.gamelog);
            }
        });

        this.worker.on("exit", () => {
            this.handleOver();
        });
    }

    protected async cleanUp(gamelog: IGamelog): Promise<void> {
        this.worker = undefined; // we are done with that worker thread
        await super.cleanUp(gamelog);
    }
}

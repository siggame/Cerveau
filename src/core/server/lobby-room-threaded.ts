import * as cluster from "cluster";
import { Config } from "~/core";
import { BaseClient } from "~/core/clients";
import { IGamelog } from "~/core/game";
import { IClientInfo, IWorkerGameSessionData } from "~/core/server/worker";
import { Room } from "./lobby-room";

/**
 * A LobbyRoom that in intended to be ran in serial (on one thread with the master lobby)
 */
export class ThreadedRoom extends Room {
    private worker?: cluster.Worker;

    /**
     * If this session has a game instance running on a worker thread.
     * @returns {boolean} true if it is running, false otherwise
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
     * We start the on a separate "worker" thread, for true multi-threading via cluster
     */
    protected threadInstance(): void {
        const clientInfos = this.generateClientInfos();

        // we can only pass strings via environment variables so serialize them
        // here and the worker threads will de-serialize them once running
        // TODO: this whole section is bad
        this.worker = cluster.fork({
            ...Config, // so that the worker thread will see these in its process.env
            WORKER_GAME_SESSION_DATA: JSON.stringify({
                mainDebugPort: (process as any)._debugPort, // non-standard, used for chrome debug tools
                sessionID: this.id,
                gameName: this.gameNamespace.GameManager.gameName,
                profile: Config.RUN_PROFILER,
                clientInfos,
                gameSettings: this.gameSettings,
            } as IWorkerGameSessionData),
        });

        this.worker.on("message", async (data) => { // this message should only happen once, when the game is over
            if (data.gamelog) {
                this.cleanUp(data.gamelog);
            }
        });

        this.worker.on("online", () => {
            for (const client of this.clients) {
                // we are about to send it, so we don't want this client object
                // listening to it, as we no longer care.
                client.stopListeningToSocket();
                this.worker!.send("socket", client.getNetSocket());
            }

            this.clients.length = 0;
        });

        this.worker.on("exit", () => {
            this.handleOver();
        });
    }

    /**
     * Generates the info of the clients in playerIndex order for thread safe passing, also re-sorts this.clients
     * @returns {Array.<Object>} an array of client like objects that can be
     * passed to a thread via json, then turned back to a client on that thread
     */
    protected generateClientInfos(): IClientInfo[] {
        // each client sent their info with the 'play' event already, we need to send that to the new thread
        let numberOfPlayers = 0;
        const clients = new Array<BaseClient>();
        const unplacedPlayers = new Array<BaseClient>();
        const spectators = new Array<BaseClient>();

        // place players where they want to be based on playerIndex
        for (const client of this.clients) {
            if (client.isSpectating) {
                spectators.push(client);
            }
            else {
                numberOfPlayers++;

                if (client.playerIndex !== undefined && !clients[client.playerIndex]) {
                    clients[client.playerIndex] = client;
                }
                else {
                    unplacedPlayers.push(client);
                }
            }
        }

        // place clients after all the players, so the clients array will look
        // like: [player1, player2, ..., playerN, spectator1, spectator2, ..., spectatorN]
        for (let i = numberOfPlayers; i < this.clients.length; i++) {
            clients[i] = spectators[i - numberOfPlayers];
        }

        // finally, find a spot for the unplaced players
        let nextPlayerIndex = 0;
        for (const unplacedPlayer of unplacedPlayers) {
            while (clients[nextPlayerIndex]) {
                nextPlayerIndex++;
            }

            clients[nextPlayerIndex] = unplacedPlayer;
        }

        // update the playerIndexes for all the clients here on the lobby
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            if (!client.isSpectating) {
                client.setInfo(client.name, client.programmingLanguage, i);
            }
        }

        return clients.map<IClientInfo>((client, i) => ({
            index: i,
            name: client.name,
            type: client.programmingLanguage,
            connectionType: client.connectionType,
            spectating: client.isSpectating,
            metaDeltas: client.sendMetaDeltas,
        }));
    }

    protected async cleanUp(gamelog: IGamelog): Promise<void> {
        this.worker = undefined; // we are done with that worker thread
        return await super.cleanUp(gamelog);
    }
}

// This is the script that can be thought of as the 'main.js' for each worker
// thread that spins up a game session into an Instance using true
// multi-threading

// this also loads the command line arguments from process.env
import * as cluster from "cluster";
import { Socket } from "net";
import { Config } from "~/core/args";
import { BaseClient, getClientByType } from "~/core/clients";
import { IBaseGameSettings } from "~/core/game";
import { logger } from "~/core/log";
import { Session } from "~/core/server/session";

export interface IClientInfo {
    index: number;
    name: string;
    type: string;
    connectionType: string;
    spectating: boolean;
    metaDeltas: boolean;
}

export interface IClientInfoWithSocket extends IClientInfo {
    socket: Socket;
}

export interface IWorkerGameSessionData {
    mainDebugPort: number;
    sessionID: string;
    gameName: string;
    gameSettings: IBaseGameSettings;
    clientInfos: IClientInfo[];
}

if (cluster.isMaster) {
    /* tslint:disable-next-line:no-console */
    console.error("ERROR: worker running on master thread");
    process.exit(1); // worker threads not intended to run on main thread.
}

if (!Config.WORKER_DATA) {
    throw new Error("Configs WORKER_DATA not set, worker cannot work");
}
const workerData = Config.WORKER_DATA;

process.title = `${workerData.gameName} - ${workerData.sessionID}`;

const clientInfos = workerData.clientInfos;
const clientSockets: IClientInfoWithSocket[] = [];
async function start(): Promise<void> {
    const gameNamespace = await import(`src/games/${workerData.gameName.toLowerCase()}/`);

    process.on("message", (message, socket) => {
        // Note: Node js can only send sockets via handler if message === "socket",
        // because passing sockets between threads is sketchy as fuck
        if (message === "socket") {
            clientSockets.push({
                ...clientInfos[clientSockets.length],
                socket,
            });

            if (clientSockets.length === clientInfos.length) {
                // convert the client infos to actual BaseClients as the Session expects
                const clients = [] as BaseClient[];
                for (const info of clientSockets) {
                    const baseClientClass = getClientByType(info.connectionType);
                    if (!baseClientClass) {
                        throw new Error(`Session cannot handle client ${info.type}`);
                    }

                    // Disables Nagle
                    info.socket.setNoDelay(true);

                    const client = new baseClientClass(info.socket);
                    clients.push(client);

                    client.sendMetaDeltas = true;
                    client.isSpectating = info.spectating;
                    client.setInfo(info.name, info.type, info.index);
                }

                // we've been sent all the sockets for the clients,
                // so we are ready to start!
                const session = new Session({
                    id: workerData.sessionID,
                    clients,
                    gameNamespace,
                    gameSettings: workerData.gameSettings,
                });

                process.on("unhandledRejection", (reason, p) => {
                    session.kill(`Unhandled promise: ${reason}`);
                });

                process.on("uncaughtException", (err) => {
                    session.kill(`Uncaught exception thrown: ${err.message}`);
                });

                session.events.ended.once((data) => {
                    let gamelog = {};
                    let errorCode = 0;
                    if (data instanceof Error) {
                        logger.error(String(data));
                        errorCode = 1;
                    }
                    else {
                        gamelog = data;
                    }

                    process.send!(gamelog, (err: any) => {
                        process.exit(errorCode);
                    });
                });
            }
        }
        // else should not happen
    });
}

start();

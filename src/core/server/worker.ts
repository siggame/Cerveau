// This is the script that can be thought of as the 'main.js' for each worker
// thread that spins up a game session into an Instance using true
// multi-threading

import "../setup-thread";

// this also loads the command line arguments from process.env
import * as cluster from "cluster";
import { Socket } from "net";
import * as Clients from "~/core/clients";
import { Config } from "~/core/config";
import { IBaseGameNamespace } from "~/core/game";
import { logger } from "~/core/log";
import { Session } from "~/core/server/session";
import { IUnknownObject } from "~/utils";

/**
 * An interface for the main thread to adhere to, so we can communicate
 * both safely, and robustly.
 */
export type MessageFromMainThread = { type: "done" } | {
    type: "client";
    clientInfo: {
        className: string;
        index?: number;
        name: string;
        type: string;
        spectating: boolean;
        metaDeltas: boolean;
    };
};

/** This interface we expect to be set via the process.env for us. */
export interface IWorkerGameSessionData {
    mainDebugPort: number;
    sessionID: string;
    gameName: string;
    gameSettings: IUnknownObject;
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

// tslint:disable-next-line:no-var-requires - as we need it to be synchronous
const required = require(`src/games/${workerData.gameName.toLowerCase()}/`);

if (!required.Namespace) {
    throw new Error("Error required game namespace not found!");
}
const gameNamespace: IBaseGameNamespace = required.Namespace;

const clients: Clients.BaseClient[] = [];
process.on("message", (message: MessageFromMainThread, socket?: Socket) => {
    if (typeof message !== "object" || !message || !message.type) {
        throw new Error(`Could not understand message from parent thread to worker: '${message}'`);
    }

    if (message.type === "client") {
        // then we've been sent a new client to connect
        if (!socket) {
            throw new Error("Sockets must be sent with client data!");
        }

        const info = message.clientInfo;
        const { className } = info;
        const baseClientClass: typeof Clients.BaseClient | undefined = (Clients as any)[className];

        if (!baseClientClass) {
            throw new Error(`Session cannot handle client ${className}`);
        }

        // Disable Nagle
        socket.setNoDelay(true);

        const client = new baseClientClass(socket);
        clients.push(client);

        client.sendMetaDeltas = info.metaDeltas;
        client.isSpectating = info.spectating;
        client.setInfo(info);
    }
    else if (message.type === "done") {
        // we've been sent all the sockets for the clients,
        // so we are ready to start!
        const session = new Session({
            id: workerData.sessionID,
            clients,
            gameNamespace,
            gameSettingsManager: new gameNamespace.GameSettingsManager(
                workerData.gameSettings,
            ),
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

            process.send!({ gamelog }, (err: any) => {
                process.exit(errorCode);
            });
        });
    }
    else {
        throw new Error("Unexpected message from main thread");
    }
});

// This is the script that can be thought of as the 'main.js' for each worker
// thread that spins up a game session into an Instance using true
// multi-threading

import { setupThread } from "../setup-thread";
setupThread(); // we have to do this before doing aliased imports below

// this also loads the command line arguments from process.env
import { Gamelog } from "@cadre/ts-utils/cadre";
import { isMaster } from "cluster";
import { Socket } from "net";
import * as Clients from "~/core/clients";
import { Config } from "~/core/config";
import { logger } from "~/core/logger";
import { Immutable, UnknownObject } from "~/utils";
import { GamesExport } from "./games-export";
import { Session } from "./session";

/**
 * An interface for the main thread to adhere to, so we can communicate
 * both safely, and robustly.
 */
export type MessageFromMainThread =
    | {
          /** Done indicating the main thread is done sending clients. */
          type: "done";
      }
    | {
          /** The type indicating a new client socket to inject. */
          type: "client";
          /** The info about the client to re-construct their Client instance. */
          clientInfo: {
              /** The name of the class instance in the Clients/ export. */
              className: string;
              /** Their player index, if they are a player. */
              index?: number;
              /** Their player name. */
              name: string;
              /** The type of client. */
              type: string;
              /** Flag indicating if they are spectating or not. */
              spectating: boolean;
              /** Flag indicating if they want meta deltas or normal deltas. */
              metaDeltas: boolean;
          };
      };

/** The message interface workers send from them as messages. */
export interface WorkerOverMessage {
    /** An error, if something bad happened. */
    error?: Error;

    /** The gamelog, if everything went smoothly and it was generated. */
    gamelog?: Immutable<Gamelog>;

    /** The client infos for the completed game. */
    clientInfos?: Clients.ClientInfo[];
}

/** This interface we expect to be set via the process.env for us. */
export interface WorkerGameSessionData {
    /** Optional debug port to bind to for debugger hooks. */
    mainDebugPort?: number;
    /** The id of the session we are threading. */
    sessionID: string;
    /** The game name (id) to create. */
    gameName: string;
    /** The game settings for this specific game instance to be played. */
    gameSettings: UnknownObject;
}

if (isMaster) {
    // eslint-disable-next-line no-console
    console.error("ERROR: worker running on master thread");
    process.exit(1); // worker threads not intended to run on main thread.
}

if (!Config.WORKER_DATA) {
    throw new Error("Configs WORKER_DATA not set, worker cannot work");
}
const workerData = Config.WORKER_DATA;

process.title = `${workerData.gameName} - ${workerData.sessionID}`;

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const required = require(`~/games/${workerData.gameName.toLowerCase()}/`) as GamesExport;

if (!required.Namespace) {
    throw new Error("Error required game namespace not found!");
}

const gameNamespace = required.Namespace;

const clients: Clients.BaseClient[] = [];
process.on(
    "message",
    (message: Immutable<MessageFromMainThread>, socket?: Socket) => {
        if (typeof message !== "object" || !message || !message.type) {
            throw new Error(
                `Could not understand message from parent thread to worker: '${message}'`,
            );
        }

        if (message.type === "client") {
            // then we've been sent a new client to connect
            if (!socket) {
                throw new Error("Sockets must be sent with client data!");
            }

            const info = message.clientInfo;
            const { className } = info;
            const baseClientClass = (Clients as {
                [key: string]: typeof Clients.BaseClient | undefined;
            })[className];

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
        } else if (message.type === "done") {
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

            process.on("unhandledRejection", (reason, promise) => {
                void session.kill(
                    `Unhandled promise (${String(promise)} - ${reason}`,
                );
            });

            process.on("uncaughtException", (err) => {
                void session.kill(`Uncaught exception thrown: ${err.message}`);
            });

            session.events.ended.once((data) => {
                const error = data instanceof Error ? data : undefined;
                const success = data instanceof Error ? undefined : data;

                if (error) {
                    logger.error(
                        `Worker thread ending because of error: ${error}`,
                    );
                }

                if (!process.send) {
                    throw new Error("Worker not on separate thread!");
                }

                process.send({ error, ...success }, () => {
                    process.exit(error ? 1 : 0);
                });
            });
        } else {
            throw new Error("Unexpected message from main thread");
        }
    },
);

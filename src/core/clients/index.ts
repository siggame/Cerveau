// All the client protocols we support
// They should all inherit from the Client base class

export * from "./base-client";
export * from "./tcp-client";
export * from "./ws-client";

export * from "./events-client";
export * from "./events-server";

import { BaseClient } from "./base-client";
import { TCPClient } from "./tcp-client";
import { WSClient } from "./ws-client";

export function getClientByType(type: "tcp"): typeof TCPClient;
export function getClientByType(type: "ws"): typeof WSClient;
export function getClientByType(type: string): typeof BaseClient | undefined;
export function getClientByType(type: string): typeof BaseClient | undefined {
    switch (type) {
        case "tcp":
            return TCPClient;
        case "ws":
            return WSClient;
    }
}

import * as ws from "lark-websocket";
import * as net from "net";
import { BaseClient } from "./base-client";

/** A client to the game server via a WS connection. */
export class WSClient extends BaseClient {
    /** The lark-websocket socket that semi-imitates net.Socket. */
    // TODO: document lark-websocket
    protected socket?: net.Socket & {
        /** The ACTUAL net.Socket. */
        _socket: net.Socket;

        /** Indicates if the connection is closed. */
        readonly closed: boolean;

        /** Remove from net.Socket. */
        write: never;

        /** Sends a string, use instead of write. */
        send(str: string): void;
    };

    /**
     * Creates a client connected to a server.
     *
     * @param socket - The socket this client communicates through.
     */
    constructor(socket: net.Socket) {
        super(
            socket instanceof net.Socket
                ? // hackish, we need to re - set socket before super is called,
                  // but the super method wants to be called first
                  ws.createClient(socket) // then we need to create a websocket interface wrapped around this net.Socket
                : socket, // normal socket fail through
        );
    }

    /**
     * Gets the net module member of this socket for passing between threads.
     *
     * @returns The net socket used for WS communications.
     */
    public popNetSocket(): net.Socket | undefined {
        // NOTE: do not call super, our actual socket is hack-y
        if (!this.socket) {
            return;
        }

        const socket = this.socket._socket;
        this.socket = undefined;

        return socket;
    }

    /**
     * Stops listening to the current socket, for passing to another thread.
     *
     * @returns A boolean indicating if it stopped listening.
     */
    public stopListeningToSocket(): boolean {
        if (!this.socket) {
            return false;
        }

        const returned = super.stopListeningToSocket();
        this.socket.pause();

        return returned;
    }

    /** The on data event name in our socket to listen for. */
    protected get onDataEventName(): string {
        return "message";
    }

    /**
     * Invoked when the tcp socket gets data.
     *
     * @param data - What the client send via the socket event listener.
     */
    protected onSocketData(data: unknown): void {
        super.onSocketData(data);

        const parsed = this.parseData(data);
        if (!parsed) {
            // Because we got some invalid data,
            // so we're going to fatally disconnect anyways
            return;
        }

        this.handleSent(parsed);
    }

    /**
     * Sends a the raw string to the remote client this class represents.
     *
     * @param str - The raw string to send. Should be EOT_CHAR terminated.
     * @returns A promise that resolves after it sends the data.
     */
    protected async sendRaw(str: string): Promise<void> {
        if (this.socket && !this.socket.closed) {
            this.socket.send(str);
        }
    }

    /**
     * Invoked when the other end of this socket disconnects.
     */
    protected disconnected(): void {
        if (this.socket) {
            this.socket.destroy();
        }
        super.disconnected();
    }
}

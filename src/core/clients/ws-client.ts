import * as ws from "lark-websocket";
import * as net from "net";
import { BaseClient } from "./base-client" ;

/** A client to the game server via a WS connection. */
export class WSClient extends BaseClient {
    /**
     * Creates a client connected to a server.
     *
     * @param socket The socket this client communicates through.
     */
    constructor(socket: net.Socket) {
        super(socket instanceof net.Socket
            // hackish, we need to re - set socket before super is called,
            // but the super method wants to be called first
            ? ws.createClient(socket) // then we need to create a websocket interface wrapped around this net.Socket
            : socket, // normal socket fail through
        );
    }

    /**
     * Gets the net module member of this socket for passing between threads.
     *
     * @returns The net socket used for WS communications.
     */
    public getNetSocket(): net.Socket {
        // hackish, as we are grabbing a private socket out of the lark-websocket client, but works.
        // tslint:disable-next-line:no-any
        return (this.socket as any)._socket;
    }

    /**
     * Stops listening to the current socket, for passing to another thread.
     *
     * @returns A boolean indicating if it stopped listening.
     */
    public stopListeningToSocket(): boolean {
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
     * @param data What the client send via the socket event listener.
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
    protected sendRaw(str: string): Promise<void> {
        return new Promise((resolve, reject) => {
            super.sendRaw(str);

            // this.socket.send(str);
            this.socket.write(str, resolve);
        });
    }

    /**
     * Invoked when the other end of this socket disconnects
     */
    protected disconnected(): void {
        this.socket.destroy();
        super.disconnected();
    }
}

import * as ws from "lark-websocket";
import * as net from "net";
import { BaseClient } from "./base-client" ;

/** A client to the game server via a WS connection */
export class WSClient extends BaseClient {
    /**
     * Creates a client connected to a server
     * @param socket the socket this client communicates through
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
     * Gets the net module member of this socket for passing between threads
     *
     * @override
     */
    public getNetSocket(): net.Socket {
        // hackish, as we are grabbing a private socket out of the lark-websocket client, but works.
        return (this.socket as any)._socket;
    }

    /**
     * Stops listening to the current socket, for passing to another thread
     * @returns boolean indicating if it stopped listening
     */
    public stopListeningToSocket(): boolean {
        const returned = super.stopListeningToSocket();
        this.socket.pause();
        return returned;
    }

    protected get onDataEventName(): string {
        return "message";
    }

    /**
     * Invoked when the tcp socket gets data
     * @param data what the client send via the socket event listener
     */
    protected onSocketData(data: any): void {
        super.onSocketData(data);

        const parsed = this.parseData(data);
        if (!parsed) {
            return; // because we got some invalid data, so we're going to fatally disconnect anyways
        }

        this.handleSent(parsed);
    }

    /**
     * Sends a the raw string to the remote client this class represents.
     * Intended to be overridden to actually send through client...
     * @param {string} str the raw string to send. Should be EOT_CHAR terminated.
     * @returns after it it sends the data
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
     *
     * @override
     */
    protected disconnected(): void {
        this.socket.destroy();
        super.disconnected();
    }
}

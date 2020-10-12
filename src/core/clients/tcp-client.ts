import { Socket } from "net";
import { BaseClient } from "./base-client";

/**
 * The end of transmission character, used to signify the string we sent is the
 * end of a transmission and to parse the json string before it, because some
 * socket APIs for clients will concat what we send.
 */
const EOT_CHAR = String.fromCharCode(4);

/**
 * A client to the game server via a TCP socket.
 */
export class TCPClient extends BaseClient {
    /**
     * TCP clients may send their json in parts, delimited by the EOT_CHAR.
     * We buffer it here.
     */
    private buffer = "";

    /**
     * Creates a client connected to a server.
     *
     * @param socket - The socket this client communicates through.
     */
    constructor(socket: Socket) {
        super(
            (() => {
                socket.setEncoding("utf8");

                return socket;
            })(),
        );
    }

    /**
     * Invoked when the tcp socket gets data.
     *
     * @param data - What the client send via the socket event listener.
     */
    protected onSocketData(data: unknown): void {
        super.onSocketData(data);

        this.buffer += data;
        // split on "end of text" character (basically end of transmission)
        const split = this.buffer.split(EOT_CHAR);
        // the last item will either be "" if the last char was an EOT_CHAR,
        // or a partial data we need to store in the buffer anyways
        this.buffer = split.pop() || "";

        for (const line of split) {
            const parsed = this.parseData(line);
            if (!parsed) {
                // Because we got some invalid data,
                // so we're going to fatally disconnect anyways
                return;
            }

            this.handleSent(parsed);
        }
    }

    /**
     * Sends a the raw string to the remote client this class represents.
     * Intended to be overridden to actually send through client...
     *
     * @param str - The raw string to send. Should be EOT_CHAR terminated.
     * @returns A promise to resolve after data is sent.
     */
    protected sendRaw(str: string): Promise<void> {
        return new Promise((resolve) => {
            void super.sendRaw(str);

            if (!this.hasDisconnected() && this.socket) {
                this.socket.write(str + EOT_CHAR, (err) => {
                    if (err && !this.hasDisconnected()) {
                        // then it has actually disconnected while/before sending data
                        this.disconnected();
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
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

import { events } from "ts-typed-events";
import { logger } from "~/core/log";
import { Room } from "./lobby-room";
import { Session } from "./session";

/**
 * A Room that in intended to be ran in serial
 * (on one thread with the master lobby)
 */
export class SerialRoom extends Room {
    /** The Session this Room is running */
    private session?: Session;

    /** Starts the session in this room (as we are not threaded) */
    public start(): void {
        super.start();

        this.session = new Session({
            id: this.id,
            clients: this.clients,
            gameSettingsManager: this.gameSettingsManager,
            gameNamespace: this.gameNamespace,
        });

        this.session.events.ended.once(async (data) => {
            if (data instanceof Error) {
                logger.error("Session had a fatal error", data);
            }
            else {
                // we got the gamelog!
                await this.cleanUp(data);
            }

            for (const client of this.clients) {
                events.offAll(client.events);
            }
            this.clients.length = 0;

            this.handleOver();
        });
    }

    /**
     * If this session has a game instance running on a worker thread.
     * @returns true if it is running, false otherwise
     */
    public isRunning(): boolean {
        return Boolean(this.session);
    }
}

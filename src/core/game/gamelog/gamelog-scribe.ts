import { IDelta, IDeltaData, IDisconnectDeltaData, IFinishedDeltaData,
         IGamelog, IOrderedDeltaData, IRanDeltaData,
       } from "cadre-ts-utils/cadre";
import { Event, events } from "ts-typed-events";
import { BaseClient } from "~/core/clients";
import { SHARED_CONSTANTS } from "~/core/constants";
import { BaseGame } from "~/core/game";
import { DeltaManager } from "~/core/game/delta-manager";
import { Session } from "~/core/server";

/** Observes a game and creates a gamelog by transcribing its events */
export class GamelogScribe {
    /** The events the game logger emits when it logs something. */
    public readonly events = events({
        /** Emitted every time a new delta is logged to the gamelog. */
        logged: new Event<IDelta>(),
    });

    /** The gamelog we are building up. */
    public readonly gamelog: IGamelog;

    /** If our gamelog is finalized and should never be changed after. */
    private finalized = false;

    /**
     * Creates a new game logger for a specific game.
     *
     * @param game - The game we are logging.
     * @param session - The session the game is in.
     * @param clients - The clients in the game session.
     * @param deltaManager - The delta manager that builds deltas for us.
     */
    constructor(
        game: BaseGame,
        session: Session,
        clients: ReadonlyArray<BaseClient>,
        private readonly deltaManager: DeltaManager,
    ) {
        this.gamelog = {
            gameName: game.name,
            gameSession: game.session,
            constants: SHARED_CONSTANTS,
            deltas: [],
            epoch: 0,
            losers: [],
            winners: [],
            settings: game.settings,
        };

        // this assumes the GameManager goes first
        session.events.start.on(() => {
            this.add("start");
        });

        session.events.gameOver.on(() => {
            this.add("over");
            this.finalizeGamelog(clients);
        });

        session.events.aiOrdered.on((ordered) => {
            this.add("order", ordered);
        });

        session.events.aiFinished.on((finished) => {
            this.add("finished", finished);
        });

        session.events.aiRan.on((ran) => {
            this.add("ran", ran);
        });

        for (const client of clients) {
            if (!client.player) {
                continue; // We don't care when non-player clients disconnect.
            }

            const { id } = client.player;
            client.events.disconnected.on(() => {

                this.add("disconnect", {
                    player: { id },
                    timeout: client.hasTimedOut(),
                });
            });
        }
    }

    /**
     * Generates the game log from all the events that happened in this game.
     *
     * @param clients - The list of clients that played this game.
     * @returns The gamelog that was generated.
     */
    private finalizeGamelog(clients: ReadonlyArray<BaseClient>): void {
        // update the winners and losers of the gamelog
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            const player = client.player;

            if (!player) {
                continue; // they are a spectator and don't matter to the gamelog.
            }

            const winnerLoserArray = player.won
                ? this.gamelog.winners
                : this.gamelog.losers;

            winnerLoserArray.push({
                index: i,
                id: player.id,
                name: player.name,
                reason: player.won
                        ? player.reasonWon
                        : player.reasonLost,
                disconnected: client.hasDisconnected && !client.hasTimedOut(),
                              // then they lost because they disconnected
                timedOut: client.hasTimedOut(),
                          // then they lost because the timed out
            });
        }

        this.gamelog.epoch = (new Date()).getTime();
        this.finalized = true;
    }

    private add(type: "start"): void;
    private add(type: "over"): void; // tslint:disable-line:unified-signatures
    private add(type: "disconnect", data: IDisconnectDeltaData): void;
    private add(type: "order", data: IOrderedDeltaData): void;
    private add(type: "ran", data: IRanDeltaData): void;
    private add(type: "finished", data: IFinishedDeltaData): void;

    /**
     * Adds a delta for some reason, and emits that we logged it.
     *
     * @param type - The type of delta (reason it occurred).
     * @param data - The data about why it changed, such as what data made the
     * delta occur.
     */
    private add(type: string, data?: Readonly<IDeltaData>): void {
        if (this.finalized) {
            return; // Gamelog is finalized, we can't add things.
        }

        const delta: IDelta = {
            type,
            data,
            game: this.deltaManager.dump(),
        };

        this.gamelog.deltas.push(delta);
        this.events.logged.emit(delta);
    }
}

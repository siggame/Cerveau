import { Event, events } from "ts-typed-events";
import { BaseClient } from "~/core/clients";
import { SHARED_CONSTANTS } from "~/core/constants";
import { BaseGame, BaseGameObject, IDelta, IDeltaData, IDisconnectDeltaData,
    IFinishedDeltaData, IRanDeltaData } from "~/core/game";
import { Session } from "~/core/server";
import { DeltaManager } from "./delta-manager";
import { IGamelog } from "./gamelog-interfaces";

/*
function findBad(obj: any, path: string = ""): void {
    if (typeof(obj) === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            const current = `${path}.${key}`;

            if (value instanceof BaseGameObject) {
                console.log("Found bad game obj", current, String(value));
            }
            else if (value instanceof Map) {
                console.log("Found a map at", current);
            }
            else {
                // go deeper
                findBad(value, current);
            }
        }
    }
}
*/

/** Observes a game and creates a gamelog from its events */
export class GameLogger {
    public readonly events = events({
        logged: new Event<IDelta>(),
    });

    public readonly gamelog: IGamelog;
    private finalized = false;

    constructor(
        game: BaseGame,
        session: Session,
        clients: BaseClient[],
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

        session.events.aiFinished.on((finished) => {
            this.add("finished", {
                invalid: finished.invalid,
                player: { id: finished.player.id },
                order: finished.order,
                returned: finished.returned,
            });
        });

        session.events.aiRan.on((ran) => {
            this.add("ran", {
                invalid: ran.invalid,
                player: { id: ran.player.id },
                run: ran.run,
                returned: ran.returned,
            });
        });

        for (const client of clients) {
            client.events.disconnected.on(() => {
                this.add("disconnect", {
                    player: { id: client.player!.id },
                    timeout: client.hasTimedOut(),
                });
            });
        }
    }

    /**
     * Generates the game log from all the events that happened in this game.
     * @param clients the list of clients that played this game
     * @returns the gamelog that was generated
     */
    private finalizeGamelog(clients: BaseClient[]): void {
        // update the winners and losers of the gamelog
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            const player = client.player!;

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
    private add(type: "ran", data: IRanDeltaData): void;
    private add(type: "finished", data: IFinishedDeltaData): void;
    private add(type: string, data?: IDeltaData): void {
        if (this.finalized) {
            return;
        }

        // findBad(data, "data");

        const delta: IDelta = {
            type,
            data,
            game: this.deltaManager.pop(),
        };
        this.gamelog.deltas.push(delta);
        this.events.logged.emit(delta);
    }
}

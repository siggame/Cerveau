import * as net from "net";
import { Event, events, Signal } from "ts-typed-events";
import { Config } from "~/core/args";
import { BaseAIManager, IBasePlayer, IDelta } from "~/core/game/";
import { logger } from "~/core/log";
import { isObject } from "~/utils";
import * as ClientEvents from "./events-client";
import * as ServerEvents from "./events-server";

const DEFAULT_STR = "Unknown";

/*
 * The basic implementation of a connection to the server via some I/O.
 * Should be inherited and implemented with that IO. This is just a base class.
 */
export class BaseClient {
    /** All events this client can do */
    public readonly events = events({
        disconnected: new Signal(),
        timedOut: new Signal(),
    });

    public readonly sent = events({
        finished: new Event<ClientEvents.IFinishedData>(),
        run: new Event<ClientEvents.IRunData>(),
        play: new Event<ClientEvents.IPlayData>(),
        alias: new Event<string>(),
    });

    /** The type of client this is, inheriting classes should override */
    public get type(): string {
        return DEFAULT_STR;
    }

    /** The name of this client */
    public get name(): string {
        return this.ourName;
    }

    public get player(): IBasePlayer | undefined {
        return this.ourPlayer;
    }

    public get programmingLanguage(): string {
        return this.ourProgrammingLanguageType;
    }

    /** The index of this client's player in the game.players array */
    public get playerIndex(): number | undefined {
        return this.ourPlayerIndex;
    }

    public aiManager?: BaseAIManager;

    /** If this client wants to be sent meta deltas instead of normal deltas */
    public sendMetaDeltas: boolean = false;

    /** If this client is a spectator */
    public isSpectating: boolean = false;

    public readonly connectionType: string = "";

    /** The socket this communicates through */
    protected socket: net.Socket;

    /** The timer we use to see if this client timed out */
    private readonly timer: {
        /** the timeout last used */
        timeout?: NodeJS.Timer;
        /** the start time we started ticking */
        startTime?: [number, number];
    } = {};

    /** If we are listening to our socket */
    private listening: boolean = false;

    /** The listener callbacks for socket events */
    private readonly listeners: {[key: string]: (data: any) => void} = {};

    /** True once we have disconnected from the socket */
    private hasDisconnectedFromSocket: boolean = false;

    /** Set to try if this client times out */
    private timedOut: boolean = false;

    /** Our player in the game */
    private ourPlayer?: IBasePlayer;

    /** The name of the player, use player to get */
    private ourName: string = DEFAULT_STR;

    /** The type of client this is, e.g. C++, C#, Python, etc... */
    private ourProgrammingLanguageType: string = DEFAULT_STR;

    /** The private index of this client's player in the game.players array */
    private ourPlayerIndex?: number;

    /**
     * Creates a client connected to a server
     * @param socket the socket this client communicates through
     * @param server the server this client is connected to
     */
    constructor(socket: net.Socket) {
        this.socket = socket;

        // we need to wrap all the listener functions in closures to not lose
        // reference to 'this', which is this instance of a Client
        this.listeners[this.onDataEventName] = (data) => {
            this.onSocketData(data);
        };
        this.listeners[this.onCloseEventName] = (data) => {
            this.onSocketClose();
        };
        this.listeners[this.onErrorEventName] = (data) => {
            this.onSocketError();
        };

        this.listenToSocket();
    }

    /**
     * Returns if the player has disconnected
     * @returns True if this client has disconnected from the server, false otherwise
     */
    public hasDisconnected(): boolean {
        return this.hasDisconnectedFromSocket;
    }

    /**
     * returns the raw net.Socket used by this client, probably for thread passing. Use with care
     * @returns the socket
     */
    public getNetSocket(): net.Socket {
        return this.socket;
    }

    /**
     * Checks if this client's timer is ticking (we are awaiting them to finish an order)
     * @returns true if ticking, false otherwise
     */
    public isTicking(): boolean {
        return (this.timer.timeout !== undefined);
    }

    /**
     * Starts the timeout timer counting down from how much time this client's player has left.
     * Should be called when the client is being timed for orders.
     * @returns true if ticking, false if timeouts are not enabled
     */
    public startTicking(): boolean {
        if (!this.player) {
            return false;
        }

        if (!Config.TIMEOUT_TIME) { // server is not going to timeout clients
            return false;
        }

        if (this.isTicking()) {
            return true;
        }

        this.timer.startTime = process.hrtime();

        this.timer.timeout = setTimeout(() => {
            this.triggerTimedOut();
        }, Math.ceil(this.player.timeRemaining / 1e6)); // ns to ms
        return true;
    }

    /**
     * If this client has timed out
     * @returns True if they have timed out, false otherwise
     */
    public hasTimedOut(): boolean {
        return this.timedOut;
    }

    /**
     * Pauses the timeout timer. This should be done any time we don't expect the client to be computing something,
     * like when they are not working on an order, or we are running game logic.
     */
    public pauseTicking(): void {
        if (this.player && this.isTicking()) {
            const timeDiff = process.hrtime(this.timer.startTime);

            if (this.timer.timeout) {
                clearTimeout(this.timer.timeout);
            }
            this.timer.timeout = undefined;
            this.timer.startTime = undefined;

            this.player.timeRemaining -= (timeDiff[0] * 1e9 + timeDiff[1]); // hr time to only ns
        }
    }

    /**
     * detaches the server from it's socket (removes EventListeners)
     * @returns representing if the detachment was successful
     */
    public stopListeningToSocket(): boolean {
        if (this.listening) {
            for (const key of Object.keys(this.listeners)) {
                this.socket.removeListener(key, this.listeners[key]);
            }

            this.listening = false;
            return true;
        }

        return false;
    }

    /**
     * Disconnects from the socket
     * @param fatalMessage If you want to send the client a 'fatal' event with a message, do so here.
     * This is common when the client sends or does something erroneous.
     * @returns when we have sent the disconnect message, or immediately if none
     */
    public async disconnect(fatalMessage?: string): Promise<void> {
        if (fatalMessage) {
            await this.send("fatal", {message: fatalMessage});
        }

        this.disconnected();
    }

    public setInfo(playerName: string, programmingLanguageType: string, playerIndex: number | undefined): void {
        this.ourName = playerName;
        this.ourProgrammingLanguageType = programmingLanguageType;
        this.ourPlayerIndex = playerIndex;
    }

    /**
     * Sets the data related to the game this client is connected to play
     * @param player the player this ai controls
     */
    public setPlayer(player: IBasePlayer): void {
        this.ourPlayer = player;
    }

    public send(event: "over", data: ServerEvents.IOverData): Promise<void>;
    public send(event: "fatal", data: ServerEvents.IFatalData): Promise<void>;
    public send(event: "start", data: ServerEvents.IStartData): Promise<void>;
    public send(event: "order", data: ServerEvents.IOrderData): Promise<void>;
    public send(event: "invalid", data: ServerEvents.IInvalidData): Promise<void>;
    public send(event: "ran", data: any): Promise<void>;
    public send(event: "named", data: string): Promise<void>;
    public send(event: "lobbied", data: ServerEvents.ILobbiedData): Promise<void>;
    public send(event: "delta", data: IDelta): Promise<void>;

    /**
     * Sends the message of type event to this client as a json string EOT_CHAR terminated.
     * @param event the event name
     * @param data the object to send about the event being sent
     * @returns after the data is sent
     */
    public send(
        event: "over" | "fatal" | "start" | "order" | "invalid" | "ran" | "named" | "lobbied" | "delta",
        data: any,
    ): Promise<void> {
        return this.sendRaw(JSON.stringify({event, data}));
    }

    /**
     * Sends a the raw string to the remote client this class represents.
     * Intended to be overridden to actually send through client...
     * @param {string} str the raw string to send. Should be EOT_CHAR terminated.
     */
    protected async sendRaw(str: string): Promise<void> {
        if (Config.PRINT_TCP) {
            logger.debug(`> to client ${this.name} --> ${str}\n---`);
        }

        return;
    }

    protected get onDataEventName(): string {
        return "data";
    }
    protected get onCloseEventName(): string {
        return "close";
    }
    protected get onErrorEventName(): string {
        return "error";
    }

    /**
     * called when the client sends some data. the specific super class should inherit and do stuff to this
     * @param data what the client send via the socket event listener
     */
    protected onSocketData(data: any): void {
        if (Config.PRINT_TCP) {
            logger.debug(`< From client ${this.name}  <-- ${data}\n---`);
        }

        // super classes should override and do stuff with data...
    }

    protected handleSent(jsonData: any): void {
        if (!isObject(jsonData)) {
            this.disconnect(`Sent malformed json event`);
            return;
        }

        const event = this.sent[jsonData.event];
        if (!event) {
            this.disconnect(`Sent unknown event '${jsonData.event}'.`);
            return;
        }

        // if we got here the sent event looks valid, emit it!
        event.emit(jsonData.data);
    }

    /**
     * called when the client closes (disconnects)
     */
    protected onSocketClose(): void {
        this.disconnected();
    }

    /**
     * called when the client disconnects unexpectedly
     */
    protected onSocketError(): void {
        this.disconnected();
    }

    /**
     * Tries to parse json data from the client, and disconnects them fatally if it is malformed.
     * @param json the json formatted string to parse
     * @returns the parsed json structure, or undefined if malformed json
     */
    protected parseData(json: string): any {
        try {
            return JSON.parse(json);
        }
        catch (err) {
            this.disconnect("Sent malformed JSON.");
        }
    }

    /**
     * Called when disconnected from the remote client this Client represents
     */
    protected disconnected(): void {
        this.hasDisconnectedFromSocket = true;
        this.pauseTicking();
        this.stopListeningToSocket();
        this.events.disconnected.emit();
    }

    /**
     * Sets up the listener functions to listen to the socket this client should have data streaming from.
     */
    private listenToSocket(): void {
        for (const key of Object.keys(this.listeners)) {
            this.socket.on(key, this.listeners[key]);
        }

        this.listening = true;
    }

    /**
     * Called when this Client runs out of time om it's timer.
     * Probably because it infinite looped, broke, or is just very slow.
     */
    private triggerTimedOut(): void {
        this.timedOut = true;
        this.pauseTicking();
        this.events.timedOut.emit();
        this.disconnect("Your client has run out of time, and has been timed out.");
    }
}

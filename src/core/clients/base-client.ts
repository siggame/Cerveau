import { ServerEvent } from "@cadre/ts-utils/cadre";
import * as ClientEvents from "@cadre/ts-utils/cadre/events/client";
import * as net from "net";
import { Event, events, Signal } from "ts-typed-events";
import { Config } from "~/core/config";
import { BaseAIManager, BasePlayer } from "~/core/game/";
import { logger } from "~/core/logger";
import { Immutable, isObject, Json, objectHasProperty } from "~/utils";

const DEFAULT_STR = "Unknown";

/**
 * The basic implementation of a connection to the server via some I/O.
 * Should be inherited and implemented with that IO.
 * This is just a base class. It would be abstract but then Lobby couldn't
 * make it generically.
 */
export class BaseClient {
    /** All events this client can do. */
    public readonly events = events({
        disconnected: new Signal(),
        timedOut: new Signal(),
    });

    /** The events clients emit (send). */
    public readonly sent = events({
        finished: new Event<Immutable<ClientEvents.FinishedEvent["data"]>>(),
        run: new Event<Immutable<ClientEvents.RunEvent["data"]>>(),
        play: new Event<Immutable<ClientEvents.PlayEvent["data"]>>(),
        alias: new Event<Immutable<ClientEvents.AliasEvent["data"]>>(),
    });

    /** The name of this client. */
    public get name(): string {
        return this.ourName;
    }

    /** The Player in the game this client controls. Undefined if spectating. */
    public get player(): BasePlayer | undefined {
        return this.ourPlayer;
    }

    /** A "fun" field for the name of the programming language this client. */
    public get programmingLanguage(): string {
        return this.ourProgrammingLanguageType;
    }

    /** The index of this client's player in the game.players array. */
    public get playerIndex(): number | undefined {
        return this.ourPlayerIndex;
    }

    /** The manager of the AI this client controls. */
    public aiManager?: BaseAIManager;

    /** If this client wants to be sent meta deltas instead of normal deltas. */
    public sendMetaDeltas: boolean = false;

    /** If this client is a spectator. */
    public isSpectating: boolean = false;

    /** The socket this communicates through. */
    protected socket?: net.Socket;

    /** The timer we use to see if this client timed out. */
    private readonly timer: {
        /** The timeout last used. */
        timeout?: NodeJS.Timer;
        /** The start time we started ticking. */
        startTime?: [number, number];
    } = {};

    /** If we are listening to our socket. */
    private listening: boolean = false;

    /** The listener callbacks for socket events. */
    private readonly listeners: {
        [key: string]: (data: unknown) => void | undefined;
    } = {};

    /** True once we have disconnected from the socket */
    private hasDisconnectedFromSocket: boolean = false;

    /** Set to try if this client times out. */
    private timedOut: boolean = false;

    /** Our player in the game. */
    private ourPlayer?: BasePlayer;

    /** The name of the player, use player to get. */
    private ourName: string = DEFAULT_STR;

    /** The type of client this is, e.g. C++, C#, Python, etc... */
    private ourProgrammingLanguageType: string = DEFAULT_STR;

    /** The private index of this client's player in the game.players array. */
    private ourPlayerIndex?: number;

    /**
     * Creates a client connected to a server
     *
     * @param socket - The socket this client communicates through.
     * @param server - The server this client is connected to.
     */
    constructor(socket: net.Socket) {
        this.socket = socket;

        // We need to wrap all the listener functions in closures to not lose
        // reference to 'this', which is this instance of a Client.
        this.listeners[this.onDataEventName] = (data: unknown) => {
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
     * Returns if the player has disconnected.
     *
     * @returns True if this client has disconnected from the server,
     * false otherwise.
     */
    public hasDisconnected(): boolean {
        return this.hasDisconnectedFromSocket;
    }

    /**
     * Removes and returns the raw net.Socket used by this client,
     * probably for thread passing. Use with care.
     *
     * @returns The socket.
     */
    public popNetSocket(): net.Socket | undefined {
        if (!this.socket) {
            return;
        }

        const socket = this.socket;
        this.socket = undefined;

        return socket;
    }

    /**
     * Checks if this client's timer is ticking (we are awaiting them to finish
     * an order).
     *
     * @returns True if ticking, false otherwise.
     */
    public isTicking(): boolean {
        return (this.timer.timeout !== undefined);
    }

    /**
     * Starts the timeout timer counting down from how much time this client's
     * player has left.
     * This should be called when the client is being timed for orders.
     *
     * @returns True if ticking, false if timeouts are not enabled.
     */
    public startTicking(): boolean {
        if (!this.player) {
            return false;
        }

        if (!Config.TIMEOUT_TIME) {
            // The server is never going to timeout clients
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
     * If this client has timed out.
     *
     * @returns True if they have timed out, false otherwise.
     */
    public hasTimedOut(): boolean {
        return this.timedOut;
    }

    /**
     * Pauses the timeout timer. This should be done any time we don't expect
     * the client to be computing something, like when they are not working on
     * an order, or we are running game logic.
     */
    public pauseTicking(): void {
        if (this.player && this.isTicking()) {
            const timeDiff = process.hrtime(this.timer.startTime);

            if (this.timer.timeout) {
                clearTimeout(this.timer.timeout);
            }
            this.timer.timeout = undefined;
            this.timer.startTime = undefined;

            // high resolution time to only ns
            const timeTaken = (timeDiff[0] * 1e9 + timeDiff[1]);
            this.player.timeRemaining -= timeTaken;
        }
    }

    /**
     * Detaches the server from its socket (removes EventListeners).
     * This must be used when passing between threads.
     *
     * @returns A boolean representing if the detachment(s) were successful.
     */
    public stopListeningToSocket(): boolean {
        if (this.listening && this.socket) {
            for (const key of Object.keys(this.listeners)) {
                this.socket.removeListener(key, this.listeners[key]);
            }

            this.listening = false;

            return true;
        }

        return false;
    }

    /**
     * Disconnects from the socket.
     *
     * @param fatalMessage - If you want to send the client a 'fatal' event
     * with a message, do so here. This is common when the client sends or
     * does something erroneous.
     * @returns A promise that resolves when we have sent the disconnect
     * message, or immediately if none.
     */
    public async disconnect(fatalMessage?: string): Promise<void> {
        if (fatalMessage) {
            await this.send({
                event: "fatal",
                data: {
                    message: fatalMessage,
                    timedOut: this.timedOut,
                },
            });
        }

        this.disconnected();
    }

    /**
     * Sets the optional information about.
     *
     * @param info - The name, language, and index of the client
     */
    public setInfo(info: {
        name?: string;
        type?: string;
        index?: number;
        metaDeltas?: boolean;
    }): void {
        this.ourName = info.name || DEFAULT_STR;
        this.ourProgrammingLanguageType = info.type || DEFAULT_STR;
        this.ourPlayerIndex = info.index;
        this.sendMetaDeltas = Boolean(info.metaDeltas);

        if (this.ourName.length > 80) {
            // We don't want players to be able to use stupidly long names.
            // so here's a limit of 80 characters.

            this.ourName = `${this.ourProgrammingLanguageType} Player`;
            // If people start cheesing this too and sending a "fake"
            // programming language, then we might want to hard code a list of
            // known languages and make sure it is valid here too.
        }
    }

    /**
     * Sets the data related to the game this client is connected to play.
     *
     * @param player - The player this ai controls.
     */
    public setPlayer(player: BasePlayer): void {
        this.ourPlayer = player;
    }

    /**
     * Sends the message of type event to this client as a json string EOT_CHAR
     * terminated.
     *
     * @param event - The event to send. Must be an expected server event.
     * @returns After the data is sent.
     */
    public async send(event: Immutable<ServerEvent>): Promise<void> {
        // event.epoch = Number(new Date()); -- Disabled for now
        return this.sendRaw(JSON.stringify(event));
    }

    /**
     * Sends a the raw string to the remote client this class represents.
     * Intended to be overridden to actually send through client...
     *
     * @param str - The raw string to send. Should be EOT_CHAR terminated.
     */
    protected async sendRaw(str: string): Promise<void> {
        if (Config.PRINT_TCP) {
            logger.debug(`> to client ${this.name} --> ${str}\n---`);
        }

        return;
    }

    /** The string key of the EventEmitter name to register for data events. */
    protected get onDataEventName(): string {
        return "data";
    }

    /** The string key of the EventEmitter name to register for close events. */
    protected get onCloseEventName(): string {
        return "close";
    }

    /** The string key of the EventEmitter name to register for error events. */
    protected get onErrorEventName(): string {
        return "error";
    }

    /**
     * Called when the client sends some data. the specific super class should
     * inherit and do stuff to this.
     *
     * @param data - What the client send via the socket event listener.
     */
    protected onSocketData(data: unknown): void {
        if (Config.PRINT_TCP) {
            logger.debug(`< From client ${this.name}  <-- ${data}\n---`);
        }

        // super classes should override and do stuff with data...
    }

    /**
     * Handler for when we know this client sent us some data.
     *
     * @param jsonData - The data, as an already parsed json object.
     */
    protected handleSent(jsonData: unknown): void {
        if (!isObject(jsonData)
         || !objectHasProperty(jsonData, "event")
         || typeof jsonData.event !== "string"
        ) {
            this.disconnect("Sent malformed json event");

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
     * Called when the client closes (disconnects).
     */
    protected onSocketClose(): void {
        this.disconnected();
    }

    /**
     * Called when the client disconnects unexpectedly.
     */
    protected onSocketError(): void {
        this.disconnected();
    }

    /**
     * Tries to parse json data from the client, and disconnects them fatally
     * if it is malformed.
     *
     * @param json - The json formatted string to parse.
     * @returns The parsed json structure, or undefined if malformed json.
     */
    protected parseData(json: unknown): Json | undefined {
        let invalid = "";

        if (typeof json !== "string") {
            invalid = `Sent ${json}, which cannot be parsed.`;
        }
        else {
            try {
                return JSON.parse(json) as Json;
            }
            catch (err) {
                invalid = `Sent malformed JSON: '${String(err)}'`;
            }
        }

        if (invalid) {
            this.disconnect(invalid);
        }
    }

    /**
     * Called when disconnected from the remote client this Client represents.
     */
    protected disconnected(): void {
        this.hasDisconnectedFromSocket = true;
        this.pauseTicking();
        this.stopListeningToSocket();
        this.events.disconnected.emit();
    }

    /**
     * Sets up the listener functions to listen to the socket this client
     * should have data streaming from.
     */
    private listenToSocket(): void {
        if (!this.socket) {
            return;
        }

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

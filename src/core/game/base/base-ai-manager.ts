import { IFinishedDeltaData, IGameObjectReference,
         IOrderedDeltaData, IRanDeltaData,
       } from "cadre-ts-utils/cadre";
import { Event, events } from "ts-typed-events";
import { BaseClient } from "~/core/clients";
import { serialize, unSerialize } from "~/core/serializer";
import { capitalizeFirstLetter, mapToObject,
         quoteIfString, UnknownObject } from "~/utils";
import { BaseGame } from "./base-game";
import { IBaseGameNamespace } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { BaseGameSanitizer } from "./base-game-sanitizer";
import { BasePlayer } from "./base-player";

/** Represents an order sent to an AI. */
interface IOrder {
    // TODO: This should probably be an id in the future,
    // but clients currently only know the numbered index
    index: number;
    name: string;
    args: Array<unknown>; // should be the serialized args
    errors: number;

    resolve(returned: unknown): void;
    reject(err: unknown): void;
}

/**
 * The maximum number of times an AI can error trying to execute a single order
 * before we assume they will always error and force disconnect them.
 */
const MAX_ORDER_ERRORS = 10;

/**
 * Manages the AI that actually plays games, basically a wrapper for public
 * functions so games can't see those and get themselves into deep shit
 */
export class BaseAIManager {
    /** The events this AI (manager) emits */
    public readonly events = events({
        ordered: new Event<IOrderedDeltaData>(),
        finished: new Event<IFinishedDeltaData>(),
        ran: new Event<IRanDeltaData>(),
    });

    /** **This must be set externally before use** */
    public game!: BaseGame;

    /** **This one too** */
    public invalidateRun!: (
        player: BasePlayer,
        gameObject: BaseGameObject,
        functionName: string,
        args: Map<string, unknown>,
    ) => string | undefined;

    /** The orders that have been sent to clients */
    private readonly orders = new Map<number, IOrder | undefined>();

    /** The next number to use for an order's index */
    private nextOrderIndex = 0;

    /**
     * Creates an AI Manager for some client('s AI).
     *
     * @param client - The client this is managing the AI for.
     * Must have a player.
     * @param gameSanitizer - The sanitizer instance for this AI's game.
     * @param namespace - The namespace of the game, to get schemas from.
     */
    constructor(
        private readonly client: BaseClient,
        private readonly gameSanitizer: BaseGameSanitizer,
        private readonly namespace: IBaseGameNamespace,
    ) {
        this.client.sent.finished.on((finished) => {
            this.finishedOrder(finished.orderIndex, finished.returned);
        });

        this.client.sent.run.on((run) => {
            this.requestedRun(run.caller, run.functionName, run.args);
        });
    }

    /**
     * Called by AI's to instruct their client to run an order.
     *
     * @param name - The name of the order (function name on client's AI).
     * @param unsanitizedArgs - The args to send to that function.
     * @returns A promise that will resolve when the AI finishes that order
     * resolving to their returned value.
     */
    public executeOrder(
        name: string,
        ...unsanitizedArgs: Array<unknown>
    ): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const sanitizedArgs = this.gameSanitizer.sanitizeOrderArgs(
                name,
                unsanitizedArgs,
            );

            if (sanitizedArgs instanceof Error) {
                // Then the structure of the order is so bad that we
                // can't figure out what to do
                this.client.disconnect(`We could not make you execute ${name}.`);
                reject(sanitizedArgs);

                return;
            }

            const args = sanitizedArgs.map(serialize);
            const index = this.nextOrderIndex++;

            const order: IOrder = {
                index,
                name,
                args,
                errors: 0, // keep track of how many errors the client makes
                           // trying to execute this order.
                // When the client sends back that they resolved this order,
                // we will resolve via this stored resolve callback
                resolve,
                reject,
            };

            this.orders.set(index, order);

            this.sendOrder(order);

            // Now they have an order, start their timer while they execute it.
            this.client.startTicking();
        });
    }

    /**
     * Invoked when a client requests some game logic be run.
     *
     * @param callerReference - The game object reference of the instance
     * in the game.
     * @param functionName - The name of the function of the caller to invoke.
     * @param unsanitizedArgs - The key/value args for that function.
     * @returns A promise that will eventually resolve to the return value of
     * this run command, or undefined if the command is incomprehensible.
     *
     * NOTE: while game logic runs a delta will probably be sent out.
     */
    private async requestedRun<T>(
        callerReference: Readonly<IGameObjectReference>,
        functionName: string,
        unsanitizedArgs: UnknownObject,
    ): Promise<T | undefined> {
        this.client.pauseTicking();

        const returned = await this.tryToRun<T>(
            callerReference,
            functionName,
            unsanitizedArgs,
        );

        this.client.startTicking();

        return returned;
    }

    /**
     * Attempts to run some game logic
     *
     * @param callerReference - The game object reference of the instance
     * in the game.
     * @param functionName - The name of the function of the caller to invoke.
     * @param unsanitizedArgs - The key/value args for that function.
     * @returns A promise that will eventually resolve to the return value of
     * this run command, or undefined if the command is incomprehensible.
     */
    private async tryToRun<T>(
        callerReference: Readonly<IGameObjectReference>,
        functionName: string,
        unsanitizedArgs: Readonly<UnknownObject>,
    ): Promise<T | undefined> {
        if (!this.client.player) {
            this.client.disconnect(
                "You do not have a Player to send run commands for",
            );

            return undefined;
        }

        const callerID = callerReference && callerReference.id;
        const gameObject = this.game.gameObjects[callerID];

        if (!gameObject) {
            // they sent us an invalid caller
            this.client.disconnect(`Cannot determine the calling game object of ${callerReference} to run for.`);

            return undefined;
        }

        const sanitizedArgs = this.gameSanitizer.validateRunArgs(
            gameObject,
            functionName,
            unSerialize(unsanitizedArgs, this.game),
        );

        if (sanitizedArgs instanceof Error) {
            // The structure of their run command is so malformed we can't even
            // run it, so something is wrong with their client, disconnect them
            this.client.disconnect(sanitizedArgs.message);

            return undefined;
        }

        const gameObjectSchema = this.namespace.gameObjectsSchema[gameObject.gameObjectName];
        if (!gameObjectSchema) {
            // the caller is malformed in some unexpected way
            this.client.disconnect(`Cannot find schema for game object '${gameObject.gameObjectName}'.`);

            return undefined;
        }

        // If we got here, we have sanitized the args and know the calling
        // game object has the appropriate function
        const schema = gameObjectSchema.functions[functionName];
        if (!schema) {
            throw new Error(`Invalid state: no schema found for ${gameObject}'s function ${functionName}.`);
        }

        let returned = schema.invalidValue;

        let invalid = sanitizedArgs instanceof Map
            // if it appears valid, try to invalidate
            ? this.invalidateRun(
                this.client.player,
                gameObject,
                functionName,
                sanitizedArgs,
            )
            // else, failed to even sanitize
            : sanitizedArgs.invalid;

        // If the game said the run is invalid for all runs
        if (invalid) {
            // Tell the client it is invalid
            this.client.send({
                event: "invalid",
                data: { message: invalid },
            });
        }
        else {
            // else, the game is ok with trying to have
            // the calling game object try to invalidate the run
            let argsMap = (sanitizedArgs as Map<string, unknown>);

            const invalidateName = `invalidate${capitalizeFirstLetter(functionName)}`;
            //  ↙ We are getting this function via reflection, no easier way to do this.
            // tslint:disable-next-line:no-any no-unsafe-any
            const validated = (gameObject as any)[invalidateName](
                this.client.player,
                ...argsMap.values(),
            ) as void | string | UnknownObject;

            invalid = typeof validated === "string"
                ? validated
                : undefined;

            if (typeof validated === "object") {
                // they returns an object for new args, so re-validate them
                const argsMapAsObject = mapToObject(argsMap);
                const newArgsMap = this.gameSanitizer.validateRunArgs(
                    gameObject,
                    functionName,
                    { ...argsMapAsObject, ...validated },
                );

                if (newArgsMap instanceof Error) {
                    // Somehow a game dev returned an invalid object,
                    // so this is a server error
                    throw new Error(
`Invalidate function for ${gameObject.gameObjectName}.${functionName} returned invalid object:
${JSON.stringify(validated)}
from:
${JSON.stringify(mapToObject(argsMap))}
`,
);
                }
                else if (newArgsMap instanceof Map) {
                    argsMap = newArgsMap;
                }
            }

            if (invalid) {
                // Their arguments did not validate,
                // so they get told it was invalid
                this.client.send({
                    event: "invalid",
                    data: { message: invalid },
                });
            }
            else {
                // It's valid!
                // tslint:disable-next-line:no-any no-unsafe-any
                const unsanitizedReturned = await (gameObject as any)[functionName](
                    this.client.player,
                    ...argsMap.values(),
                ) as unknown;
                returned = this.gameSanitizer.validateRanReturned(gameObject, functionName, unsanitizedReturned);
            }
        }

        returned = serialize(returned);

        // This is basically to notify upstream for the gamelog manager and
        // session to record/send these
        this.events.ran.emit({
            player: { id: this.client.player.id },
            invalid,
            run: {
                caller: callerReference,
                functionName,
                // store the raw args in the gamelog for better debugging
                args: unsanitizedArgs,
            },
            returned,
        });

        this.client.send({ event: "ran", data: returned });

        return returned as T;
    }

    /**
     * Sends an order to our client and notifies upstream that we did so.
     *
     * @param order The order to send
     */
    private sendOrder(order: Readonly<IOrder>): void {
        const simpleOrder = {
            name: order.name,
            index: order.index,
            args: order.args,
        };

        if (!this.client.player) {
            throw new Error(`Cannot send an order to client ${this.client} as it is not playing!`);
        }

        // This is basically to notify upstream for the gamelog manager
        // and session to record/send these
        this.events.ordered.emit({
            player: { id: this.client.player.id },
            order: simpleOrder,
        });

        this.client.send({ event: "order", data: simpleOrder });
    }

    /**
     * Invoked by a client when they claim to have finished an order.
     *
     * This should resolve the promised generated in `executeOrder`.
     * @param orderIndex - The index (id) of the order they finished executing.
     * @param unsanitizedReturned - The value they returned from executing
     * that order.
     */
    private finishedOrder(
        orderIndex: number,
        unsanitizedReturned: unknown,
    ): void {
        const order = this.orders.get(orderIndex);
        if (!order || !this.client.player) {
            this.client.disconnect(
                `Cannot find order # ${orderIndex} you claim to have finished.`,
            );

            return; // we have no order to resolve or reject
        }

        if (this.orders.size === 0) {
            // No orders remaining, stop their timer as we are not waiting on
            // them for anything
            this.client.pauseTicking();
        }

        const validated = this.gameSanitizer.validateFinishedReturned(
            order.name,
            unSerialize(unsanitizedReturned, this.game),
        );

        const invalid = validated instanceof Error
            ? validated.message
            : undefined;

        // This is basically to notify upstream for the gamelog manager and
        // session to record/send these
        this.events.finished.emit({
            player: { id: this.client.player.id },
            invalid,
            order,
            returned: unsanitizedReturned,
        });

        if (invalid) {
            this.client.send({
                event: "invalid",
                data: {
                    message: `Return value (${quoteIfString(
                        unsanitizedReturned,
                    )}) from finished order invalid! ${invalid}`,
                },
            });

            order.errors++;

            if (order.errors >= MAX_ORDER_ERRORS) {
                this.client.disconnect(
                    `Exceeded max number of errors (${MAX_ORDER_ERRORS}) `
                  + `executing order '${order.name}' #${order.index}.`,
                );
            }
            else {
                // re-send them the same order, as they fucked up last time.
                this.sendOrder(order);

                // do not resolve/reject the promise, let them try again
                return;
            }
        }

        this.orders.delete(orderIndex);

        if (invalid) {
            order.reject(validated); // will be an Error
        }
        else {
            order.resolve(validated);
        }
    }
}

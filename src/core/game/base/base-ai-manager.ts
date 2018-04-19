import { Event, events } from "ts-typed-events";
import { BaseClient } from "~/core/clients";
import { IFinishedDeltaData, IGameObjectReference, IRanDeltaData } from "~/core/game/";
import { serialize, unSerialize } from "~/core/serializer";
import { capitalizeFirstLetter, IAnyObject } from "~/utils";
import { BaseGame } from "./base-game";
import { IBaseGameNamespace } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { BaseGameSanitizer } from "./base-game-sanitizer";
import { IBasePlayer } from "./base-player";

// import { BaseGameManager } from "./base-game-manager";

interface IOrder {
    index: number; // should probably be an id in the future, but clients currently only know the numbered index
    name: string;
    args: any[];
    resolve: (returned: any) => void;
    reject: (err: any) => void;
}

/**
 * Manages the AI that actually plays games, basically a wrapper for public
 * functions so games can't see those and get themselves into deep shit
 */
export class BaseAIManager {
    public readonly events = events({
        finished: new Event<IFinishedDeltaData>(),
        ran: new Event<IRanDeltaData>(),
    });

    /** **This must be set externally before use** */
    public game!: BaseGame;

    /** **This one too** */
    public invalidateRun!: (
        player: IBasePlayer,
        gameObject: BaseGameObject,
        functionName: string,
        args: Map<string, any>,
    ) => string | undefined;

    private readonly orders = new Map<number, IOrder | undefined>();
    private nextOrderIndex = 0;

    constructor(
        private readonly client: BaseClient,
        private readonly gameSanitizer: BaseGameSanitizer,
        private readonly namespace: IBaseGameNamespace,
    ) {
        this.client.sent.finished.on((finished) => this.finishedOrder(finished.orderIndex, finished.returned));
        this.client.sent.run.on((run) => this.requestedRun(run.caller, run.functionName, run.args));
    }

    public executeOrder(name: string, ...unsanitizedArgs: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const args = this.gameSanitizer.sanitizeOrderArgs(name, unsanitizedArgs);

            if (args instanceof Error) {
                // then the structure of the order is so  bad we can't figure out what to do
                this.client.disconnect(`We could not make you execute ${name}.`);
                reject(args);
                return;
            }

            const index = this.nextOrderIndex++;
            const order: IOrder = {
                index,
                name,
                args,
                resolve, // when the client sends back that they resolved this order we will resolve this
                reject,
            };

            this.client.send("order", { name, args, index });

            this.orders.set(index, order);

            this.client.startTicking();
        });
    }

    private async requestedRun<T>(
        callerReference: IGameObjectReference,
        functionName: string,
        unsanitizedArgs: IAnyObject,
    ): Promise<T | undefined> {
        this.client.pauseTicking();

        const returned = await this.tryToRun<T>(callerReference, functionName, unsanitizedArgs);

        this.client.startTicking();
        return returned;
    }

    private async tryToRun<T>(
        callerReference: IGameObjectReference,
        functionName: string,
        unsanitizedArgs: IAnyObject,
    ): Promise<T | undefined> {
        if (!this.client.player) {
            this.client.disconnect("You do not have a player to send run commands for");
            return undefined;
        }

        const caller = this.game.gameObjects[callerReference && callerReference.id];

        if (!caller) {
            this.client.disconnect(`Cannot determine the calling game object of ${callerReference} to run for.`);
            return undefined;
        }

        const sanitizedArgs = this.gameSanitizer.validateRunArgs(
            caller,
            functionName,
            unSerialize(unsanitizedArgs, this.game),
        );

        if (sanitizedArgs instanceof Error) {
            // the structure of their run command is so malformed we can't even run it,
            // so something is wrong with their client, disconnect them
            this.client.disconnect(sanitizedArgs.message);
            return undefined;
        }

        // if we got here, we have sanitized the args and know the calling game object has the appropriate function
        const schema = this.namespace.gameObjectsSchema[caller.gameObjectName].functions[functionName];
        let returned = schema.invalidValue;

        const gameInvalidMessage = this.invalidateRun(
            this.client.player,
            caller,
            functionName,
            sanitizedArgs,
        );

        let invalid: string | undefined;
        // if the game said the run is invalid for all runs
        if (gameInvalidMessage) {
            // tell the client it is invalid
            this.client.send("invalid", { message: gameInvalidMessage });
        }
        else {
            // else, the game is ok with trying to have
            // the calling game object try to invalidate the run
            const validated: string | IArguments = (caller as any)[
                `invalidate${capitalizeFirstLetter(functionName)}`
            ](
                this.client.player,
                ...sanitizedArgs.values(),
            );
            invalid = typeof validated === "string"
                ? validated
                : undefined;

            if (invalid) {
                // their arguments did not validate, so they get told it was invalid
                this.client.send("invalid", { message: invalid });
            }
            else {
                // it's valid!
                const unsanitizedReturned: any = await (caller as any)[functionName](...validated);
                returned = this.gameSanitizer.validateRanReturned(caller, functionName, unsanitizedReturned);
            }
        }

        returned = serialize(returned);

        this.events.ran.emit({
            player: { id: this.client.player.id },
            invalid,
            run: {
                caller: callerReference,
                functionName,
                args: unsanitizedArgs, // store the raw args in the gamelog for better debugging
            },
            returned,
        });

        this.client.send("ran", returned);

        return returned;
    }

    private finishedOrder(orderIndex: number, unsanitizedReturned: any): void {
        const order = this.orders.get(orderIndex);
        if (!order) {
            this.client.disconnect(`Cannot find order # ${orderIndex} you claim to have finished.`);
            return; // we have no order to resolve or reject
        }

        this.orders.delete(orderIndex);

        if (this.orders.size === 0) {
            // no orders remaining, stop their timer as we are not waiting on them for anything
            this.client.pauseTicking();
        }

        const validated = this.gameSanitizer.validateFinishedReturned(
            order.name,
            unSerialize(unsanitizedReturned, this.game),
        );

        let invalid: Error | undefined;
        if (validated instanceof Error) {
            invalid = validated;
            this.client.disconnect(`Return value of ${unsanitizedReturned} could not be validated.`);
        }

        this.events.finished.emit({
            player: { id: this.client.player!.id },
            invalid: invalid && invalid.message,
            order: {
                name: order.name,
                index: order.index,
                args: order.args,
            },
            returned: unsanitizedReturned,
        });

        if (invalid) {
            order.reject(invalid);
        }
        else {
            order.resolve(validated);
        }
    }
}

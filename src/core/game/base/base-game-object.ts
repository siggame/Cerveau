import { BasePlayer, IBaseGameObjectSchema } from "~/core/game";
import { DeltaMergeable } from "~/core/game/delta-mergeable";
import { Immutable } from "~/utils";
import { BaseGame } from "./base-game";
import { BaseGameDeltaMergeables } from "./base-game-delta-mergeables";
import { BaseGameManager } from "./base-game-manager";

/** 16kb should be enough for any log, and may still be too large. */
const MAX_LOG_LENGTH = 16 * 1024;

/** The base game object data (empty). */
export interface IBaseGameObjectData {
    // pass
}

/** Values required by all game objects to be initialized correctly. */
export interface IBaseGameObjectRequiredData {
    id: string;
    gameObjectName: string;
    gameObjectsDeltaMergeable: DeltaMergeable;
    game: BaseGame;
    schema: Immutable<IBaseGameObjectSchema>;
}

/**
 * The base object for any object in the game that will need to be tracked via
 * an ID, e.g. players, units, etc.
 */
export class BaseGameObject extends BaseGameDeltaMergeables {
    /** The ID of the game object. */
    public readonly id!: string;
    /** The top class name of the game object. */
    public readonly gameObjectName!: string;
    /** The logs logged to this game object. */
    public readonly logs!: string[];

    /**
     * The game this game object is in.
     * Inheriting classes should specify the sub game type
     */
    protected readonly game: BaseGame;

    /**
     * The manager that manages actions around the game this game object is in.
     */
    protected readonly manager: BaseGameManager;

    /**
     * Creates a base game object with some initialization data.
     *
     * @param data - The initialization data use by the super class.
     * @param requiredData - The data required to hook up this game object
     * the game, and set default values for the sub class.
     */
    constructor(
        data: Immutable<IBaseGameObjectData>,
        requiredData: Readonly<IBaseGameObjectRequiredData>,
    ) {
        super({
            key: requiredData.id,
            parent: requiredData.gameObjectsDeltaMergeable,
            attributesSchema: requiredData.schema.attributes,
            initialValues: {
                ...data,
                id: requiredData.id,
                gameObjectName: requiredData.gameObjectName,
            },
        });

        this.game = requiredData.game;
        this.manager = this.game.manager;
        this.game.gameObjects[this.id] = this;
    }

    /**
     * String coercion override, handles players by default as every game has
     * them.
     *
     * @returns formatted string for this name
     */
    public toString(): string {
        if (this.gameObjectName === "Player") {
            // every game has a Player game object, but it is just an interface,
            // so we have to hack run time logic in here
            // tslint:disable-next-line:no-any
            return `Player "${(this as any as BasePlayer).name}" #${this.id}`;
        }

        return `${this.gameObjectName} #${this.id}`;
    }

    /**
     * Logs a string to this BaseGameObject's log array, for debugging purposes.
     * This is called from a 'run' event.
     *
     * @param player - The player requesting to log the string to this game
     * object.
     * @param message - The string to log.
     * @returns The arguments, as all input is valid.
     */
    protected invalidateLog(
        player: BasePlayer,
        message: string,
    ): undefined | string | { message?: string } {
        if (message.length > MAX_LOG_LENGTH) {
            return `Message is too long! Max ${MAX_LOG_LENGTH} per message.`;
        }
    }

    /**
     * Logs a string to this BaseGameObject's log array, for debugging purposes.
     * This is called from a 'run' event.
     *
     * @param player - The player requesting to log the string to this game
     * object.
     * @param message - The string to log.
     */
    protected async log(player: BasePlayer, message: string): Promise<void> {
        this.logs.push(message);
    }
}

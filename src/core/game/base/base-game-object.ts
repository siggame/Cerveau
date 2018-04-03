import { IBaseGameObjectSchema } from "src/core/game";
import { DeltaMergeable } from "src/core/game/delta-mergeable";
import { BaseGame } from "./base-game";
import { BaseGameDeltaMergeables } from "./base-game-delta-mergeables";
import { BaseGameManager } from "./base-game-manager";

// tslint:disable-next-line:no-empty-interface
export interface IBaseGameObjectData {
    // pass
}

export interface IBaseGameObjectRequiredData {
    id: string;
    gameObjectName: string;
    gameObjectsDeltaMergeable: DeltaMergeable;
    game: BaseGame;
    schema: IBaseGameObjectSchema;
}

/**
 * the base object for any object in the game that will need to be tracked via an ID, e.g. players, units, etc.
 */
export class BaseGameObject extends BaseGameDeltaMergeables {
    public readonly id: string = this.id || "";
    public readonly gameObjectName: string = this.gameObjectName || "";
    public readonly logs: string[] = this.logs || [];

    /** The game this game object is in, inheriting classes should specify the sub game type */
    protected readonly game: BaseGame;

    /** The manager that manages actions around the game this game object is in */
    protected readonly manager: BaseGameManager;

    /**
     * Creates a base game object with some initialization data
     * @param data the initialization data used to hook this game object up into
     * @param requiredData the data required to hook up this game object
     * the game, and set default values for the sub class
     */
    constructor(data: IBaseGameObjectData, requiredData: IBaseGameObjectRequiredData) { // & IBaseGameObjectHiddenData
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

        // The BaseGameObjectFactory will ALWAYS inject this game, but we don't want to act
        // like it is actually required, so it is omitted from the interface
        this.game = requiredData.game;
        this.manager = this.game.manager;
        this.game.gameObjects[this.id] = this;
    }

    /**
     * String coercion override, handles players by default as every game has them
     *
     * @override
     * @returns {string} formatted string for this name
     */
    public toString(): string {
        if (this.gameObjectName === "Player") {
            // every game has a Player game object, but it is just an interface,
            // so we have to hack run time logic in here
            return `Player "${(this as any).name}" #${this.id}`;
        }
        return `${this.gameObjectName} #${this.id}`;
    }

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     *
     * @param {Player} player - the player requesting to log the string to this game object
     * @param {string} message - string to log
     */
    protected invalidateLog(player: any, message: string): string | undefined {
        // NOTE: may be a good idea to make sure the messages are not too long,
        // E.g. they are not trying to log 100+ MB strings
        return; // nothing to invalidate, all input is valid
    }

    /**
     * logs a string to this BaseGameObject's log array, for debugging purposes. This is called from a 'run' event.
     *
     * @param {Player} player - the player requesting to log the string to this game object
     * @param {string} message - string to log
     */
    protected async log(player: any, message: string): Promise<void> {
        this.logs.push(message);
    }
}

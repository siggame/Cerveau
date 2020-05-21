import { Event } from "ts-typed-events";
import { DeltaMergeable } from "~/core/game/delta-mergeable";
import { Immutable } from "~/utils";
import { BaseGame } from "./base-game";
import { BaseGameNamespace } from "./base-game-namespace";
import { BaseGameObject, BaseGameObjectData } from "./base-game-object";

/**
 * A function that creates a game object without state.
 *
 * @param args - The arguments required to hook up a new game object.
 * @returns The newly created game object.
 */
export function createGameObject<T extends BaseGameObject>(
    args: Readonly<{
        /** The ID of the game object creating. */
        id: string;
        /** The game instance of the game object it will be part of. */
        game: BaseGame;
        /** The Class constructor of this GameObject's class. */
        GameObjectClass: typeof BaseGameObject;
        /** The name of the game object's class. */
        gameObjectName: string;
        /** The DeltaMergeable to track this game object's state. */
        gameObjectsDeltaMergeable: DeltaMergeable;
        /** The namespace this game object and its game came from. */
        gameNamespace: Immutable<BaseGameNamespace>;
        /** The initialization ata used as constructor args. */
        data: Readonly<BaseGameObjectData>;
    }>,
): T {
    const schema = args.gameNamespace.gameObjectsSchema[args.gameObjectName];

    if (!schema) {
        throw new Error(
            `Cannot find game object schema for ${args.gameObjectName} in ${args.gameNamespace.gameName}`,
        );
    }

    return new args.GameObjectClass(args.data, {
        id: args.id,
        game: args.game,
        gameObjectName: args.gameObjectName,
        gameObjectsDeltaMergeable: args.gameObjectsDeltaMergeable,
        schema,
    }) as T;
}

/** A factory that creates game objects in a game and hooks them up. */
export class BaseGameObjectFactory {
    /** The game all created game objects are a part of. */
    private game!: BaseGame; // this will actually be set externally :P
    /** The root DeltaMergeable game objects are adopted by. */
    private gameObjectsDeltaMergeable!: DeltaMergeable;

    /**
     * Creates a new game object factor (gameManager.create).
     *
     * @param namespace - The namespace of game this creates for.
     * @param generateID - A function which when invoked generates a unique
     * string ID for new game objects.
     * @param gameCreated - An event that will emit once that game is created.
     */
    constructor(
        private readonly namespace: Immutable<BaseGameNamespace>,
        private readonly generateID: () => string,
        gameCreated: Event<
            Readonly<{
                /** The game that was created. */
                game: BaseGame;
                /** The root delta mereable of the game that was created. */
                gameObjectsDeltaMergeable: DeltaMergeable;
            }>
        >,
    ) {
        gameCreated.once(({ game, gameObjectsDeltaMergeable }) => {
            this.game = game;
            this.gameObjectsDeltaMergeable = gameObjectsDeltaMergeable;
        });
    }

    /**
     * Creates a game object of the given data.
     *
     * @param gameObjectName - The string name of the game object class to
     * create.
     * @param GameObjectClass - The class constructor for that game object.
     * @param data - Required data to construct a new game object from.
     * @returns The newly created game object.
     */
    protected createGameObject<T extends BaseGameObject>(
        gameObjectName: string,
        GameObjectClass: typeof BaseGameObject,
        data: Immutable<BaseGameObjectData>,
    ): T {
        return createGameObject({
            id: this.generateID(),
            game: this.game,
            GameObjectClass,
            gameObjectName,
            gameNamespace: this.namespace,
            gameObjectsDeltaMergeable: this.gameObjectsDeltaMergeable,
            data,
        });
    }
}

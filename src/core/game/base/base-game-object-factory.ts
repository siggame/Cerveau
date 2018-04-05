import { Event } from "ts-typed-events";
import { DeltaMergeable } from "~/core/game/delta-mergeable";
import { BaseGame } from "./base-game";
import { IBaseGameNamespace } from "./base-game-namespace";
import { BaseGameObject, IBaseGameObjectData } from "./base-game-object";

export function createGameObject< T extends BaseGameObject>(args: {
    id: string,
    game: BaseGame,
    GameObjectClass: typeof BaseGameObject,
    gameObjectName: string,
    gameObjectsDeltaMergeable: DeltaMergeable,
    gameNamespace: IBaseGameNamespace,
    data: IBaseGameObjectData,
}): T {
    return new args.GameObjectClass(args.data, {
        id: args.id,
        game: args.game,
        gameObjectName: args.gameObjectName,
        gameObjectsDeltaMergeable: args.gameObjectsDeltaMergeable,
        schema: args.gameNamespace.gameObjectsSchema[args.gameObjectName],
    }) as T;
}

/** A factory that creates game objects in a game and hooks them up */
export class BaseGameObjectFactory {
    private game!: BaseGame; // this will actually be set externally :P
    private gameObjectsDeltaMergeable!: DeltaMergeable;

    constructor(
        private readonly namespace: IBaseGameNamespace,
        private readonly generateID: () => string,
        gameCreated: Event<{game: BaseGame, gameObjectsDeltaMergeable: DeltaMergeable}>,
    ) {
        gameCreated.once(({game, gameObjectsDeltaMergeable}) => {
            this.game = game;
            this.gameObjectsDeltaMergeable = gameObjectsDeltaMergeable;
        });
    }

    protected createGameObject<T extends BaseGameObject>(
        gameObjectName: string,
        GameObjectClass: typeof BaseGameObject,
        data: IBaseGameObjectData,
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

import { Event } from "ts-typed-events";
import { BaseClient } from "~/core/clients";
import { DeltaMergeable } from "~/core/game/delta-mergeable";
import { BaseGameDeltaMergeables } from "./base-game-delta-mergeables";
import { BaseGameManager } from "./base-game-manager";
import { IBaseGameNamespace, IBaseGameObjectSchema } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { createGameObject } from "./base-game-object-factory";
import { IBaseGameSettings } from "./base-game-settings";
import { IBasePlayer, IBasePlayerData } from "./base-player";

export interface IBaseGameRequiredData {
    clients: BaseClient[];
    playerIDs: string[];
    namespace: IBaseGameNamespace;
    schema: IBaseGameObjectSchema;
    manager: BaseGameManager;
    gameCreated: Event<{game: BaseGame, gameObjects: DeltaMergeable}>;
}

export class BaseGame extends BaseGameDeltaMergeables {
    public readonly manager: BaseGameManager;
    public readonly settings: Readonly<IBaseGameSettings>;

    public readonly name: string = this.name || "";
    public readonly session: string = this.session || "";
    public readonly playerStartingTime: number = this.playerStartingTime || 0;
    public readonly gameObjects: {[id: string]: BaseGameObject | undefined} = this.gameObjects || {};
    public readonly players: IBasePlayer[] = this.players || [];

    constructor(settings: IBaseGameSettings, requiredData: IBaseGameRequiredData) {
        super({
            key: "game",
            attributesSchema: requiredData.schema.attributes,
            initialValues: settings,
        });

        // super has now created our delta mergeables, let's reach in and grab the game objects all hack-y like
        const gameObjectsDeltaMergeable: DeltaMergeable = (this as any).deltaMergeable.child("gameObjects");

        this.settings = Object.freeze(settings);
        this.manager = requiredData.manager;

        const clients = requiredData.clients as BaseClient[];

        // const sanitizer = new BaseGameSanitizer(this.namespace);
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            client.aiManager!.game = this; // kind of hack-y, we are hooking this up here

            const playerData: IBasePlayerData = {
                name: settings.playerNames[i] || client.name || `Player ${i}`,
                clientType: client.type || "Unknown",
            };

            const player = createGameObject<IBasePlayer>({
                id: requiredData.playerIDs[i],
                game: this,
                gameObjectsDeltaMergeable,
                gameObjectName: "Player",
                GameObjectClass: requiredData.namespace.Player,
                gameNamespace: requiredData.namespace,
                data: playerData,
            });

            player.timeRemaining = this.playerStartingTime;
            player.ai = new requiredData.namespace.AI(client.aiManager!);

            client.setPlayer(player);
            this.players.push(player);
        }

        requiredData.gameCreated.emit({
            game: this,
            gameObjects: gameObjectsDeltaMergeable,
        });
    }
}

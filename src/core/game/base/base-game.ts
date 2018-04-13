import { Event } from "ts-typed-events";
import { BaseClient } from "~/core/clients";
import { DeltaMergeable } from "~/core/game/delta-mergeable";
import { BaseGameDeltaMergeables } from "./base-game-delta-mergeables";
import { BaseGameManager } from "./base-game-manager";
import { IBaseGameNamespace, IBaseGameObjectSchema } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { createGameObject } from "./base-game-object-factory";
import { BaseGameSettingsManager } from "./base-game-settings";
import { IBasePlayer, IBasePlayerData } from "./base-player";

export interface IBaseGameRequiredData {
    clients: BaseClient[];
    rootDeltaMergeable: DeltaMergeable;
    playerIDs: string[];
    namespace: IBaseGameNamespace;
    schema: IBaseGameObjectSchema;
    manager: BaseGameManager;
    gameCreated: Event<{game: BaseGame, gameObjectsDeltaMergeable: DeltaMergeable}>;
    sessionID: string;
}

export class BaseGame extends BaseGameDeltaMergeables {
    public readonly manager: BaseGameManager;
    public readonly settings = Object.freeze(this.settingsManager.values);

    public readonly name!: string;
    public readonly session!: string;
    public readonly gameObjects!: {[id: string]: BaseGameObject | undefined};
    public readonly players!: IBasePlayer[];

    constructor(protected settingsManager: BaseGameSettingsManager, requiredData: IBaseGameRequiredData) {
        super({
            key: "game",
            parent: requiredData.rootDeltaMergeable,
            attributesSchema: requiredData.schema.attributes,
            initialValues: settingsManager.values,
        });

        // super has now created our delta mergeables, let's reach in and grab the game objects all hack-y like
        const gameObjectsDeltaMergeable = ((this as any).deltaMergeable as DeltaMergeable).child("gameObjects")!;

        this.manager = requiredData.manager;

        this.name = requiredData.namespace.GameManager.gameName;
        this.session = requiredData.sessionID;

        const clients = requiredData.clients;
        // const sanitizer = new BaseGameSanitizer(this.namespace);
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            client.aiManager!.game = this; // kind of hack-y, we are hooking this up here

            const playerData: IBasePlayerData = {
                name: this.settings.playerNames[i] || client.name || `Player ${i}`,
                clientType: client.programmingLanguage || "Unknown",
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

            player.timeRemaining = this.settings.playerStartingTime;
            player.ai = new requiredData.namespace.AI(client.aiManager!);

            client.setPlayer(player);
            this.players.push(player);
        }

        requiredData.gameCreated.emit({
            game: this,
            gameObjectsDeltaMergeable,
        });
    }
}

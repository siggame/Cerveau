import { Event } from "ts-typed-events";
import { BasePlayingClient } from "~/core/clients";
import { DeltaMergeable } from "~/core/game/delta-mergeable";
import { BaseGameDeltaMergeables } from "./base-game-delta-mergeables";
import { BaseGameManager } from "./base-game-manager";
import { IBaseGameNamespace, IBaseGameObjectSchema } from "./base-game-namespace";
import { BaseGameObject } from "./base-game-object";
import { createGameObject } from "./base-game-object-factory";
import { BaseGameSettingsManager } from "./base-game-settings";
import { IBasePlayer, IBasePlayerData } from "./base-player";

/** Arguments a game instance will need to initialize. */
export interface IBaseGameRequiredData {
    sessionID: string;
    playingClients: BasePlayingClient[];
    rootDeltaMergeable: DeltaMergeable;
    playerIDs: string[];
    namespace: IBaseGameNamespace;
    schema: IBaseGameObjectSchema;
    manager: BaseGameManager;
    gameCreated: Event<{
        game: BaseGame;
        gameObjectsDeltaMergeable: DeltaMergeable;
    }>;
}

/** The base game that all Game classes inherit from. */
export class BaseGame extends BaseGameDeltaMergeables {
    /**
     * The manager of this class that handles dealing with the server systems
     * and the game.
     */
    public readonly manager: BaseGameManager;

    /**
     * The actual setting values we will use to initialize things.
     */
    public readonly settings = Object.freeze(this.settingsManager.values);

    /** The name (id) of this game. */
    public readonly name!: string;

    /** The id of the game session this game is playing in. */
    public readonly session!: string;

    /**
     * A special key/value object indexed by GameObject id's to the actual
     * game object
     */
    public readonly gameObjects!: {[id: string]: BaseGameObject | undefined};

    /**
     * The players playing this game.
     */
    public readonly players!: IBasePlayer[];

    /**
     * Initializes a game. Should **only** be done by this game's manager.
     *
     * @param settingsManager - The settings manager for this instance.
     * @param requiredData - The required initialization data.
     */
    constructor(protected settingsManager: BaseGameSettingsManager, requiredData: IBaseGameRequiredData) {
        super({
            key: "game",
            parent: requiredData.rootDeltaMergeable,
            attributesSchema: requiredData.schema.attributes,
            initialValues: settingsManager.values,
        });

        // Our super has now created our delta mergeables,
        // let's reach in and grab the game objects all hack-y like.
        // tslint:disable-next-line:no-any no-non-null-assertion
        const gameObjectsDeltaMergeable = ((this as any).deltaMergeable as DeltaMergeable).child("gameObjects")!;

        this.manager = requiredData.manager;

        this.name = requiredData.namespace.gameName;
        this.session = requiredData.sessionID;

        const clients = requiredData.playingClients;
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            client.aiManager.game = this; // kind of hack-y, we are hooking this up here

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
            player.ai = new requiredData.namespace.AI(client.aiManager);

            client.setPlayer(player);
            this.players.push(player);
        }

        requiredData.gameCreated.emit({
            game: this,
            gameObjectsDeltaMergeable,
        });
    }
}

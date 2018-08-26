import { BaseAIManager } from "~/core/game/base/base-ai-manager";
import { IBasePlayer } from "~/core/game/base/base-player";
import { BaseClient } from "./base-client";

/**
 * A base client that has a player
 */
export type BasePlayingClient = BaseClient & {
    aiManager: BaseAIManager;
    player: IBasePlayer;
    isSpectating: false;
};

import { BaseAIManager } from "~/core/game/base/base-ai-manager";
import { BasePlayer } from "~/core/game/base/base-player";
import { BaseClient } from "./base-client";

/**
 * A BaseClient that has a player.
 */
export type BasePlayingClient = BaseClient & {
    aiManager: BaseAIManager;
    player: BasePlayer;
    isSpectating: false;
};

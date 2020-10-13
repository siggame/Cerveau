import { BaseAIManager } from "~/core/game/base/base-ai-manager";
import { BasePlayer } from "~/core/game/base/base-player";
import { BaseClient } from "./base-client";

/** A BaseClient that has a player. */
export type BasePlayingClient = BaseClient & {
    /** The AIManager for this client's AI. */
    aiManager: BaseAIManager;

    /** The Player in the game this client is represented by. */
    player: BasePlayer;

    /** Playing clients must never be spectating. */
    isSpectating: false;
};

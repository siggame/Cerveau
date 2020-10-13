import { BasePlayer } from "~/core/game";
import * as Base from "./base";

/** A player in a two player game, that has a guaranteed opponent. */
export interface TwoPlayerPlayer extends BasePlayer {
    /** The opponenet (other player) of this Player. For handy lookup. */
    opponent: TwoPlayerPlayer;
}

/**
 * A base game that will only ever have two players in it, so they explicitly
 * know their singular opponent.
 *
 * @param base - The BaseGame (or sub BaseGame) to mix in two player logic.
 * @param base.AI - The AI to extend.
 * @param base.Game - The Game to extend.
 * @param base.GameManager - The GameManager to extend.
 * @param base.GameObject - The GameObject to extend.
 * @param base.GameSettings - The GameSettings to extend.
 * @returns A new BaseGame class with TwoPlayer logic mixed in.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mixTwoPlayer<
    TBaseAI extends Base.BaseAIConstructor,
    TBaseGame extends Base.BaseGameConstructor,
    TBaseGameManager extends Base.BaseGameManagerConstructor,
    TBaseGameObject extends Base.BaseGameObjectConstructor,
    TBaseGameSettings extends Base.BaseGameSettingsManagerConstructor
>(base: {
    /** The AI to extend. */
    AI: TBaseAI;
    /** The Game to extend. */
    Game: TBaseGame;
    /** The GameManager to extend. */
    GameManager: TBaseGameManager;
    /** The GameObject to extend. */
    GameObject: TBaseGameObject;
    /** The GameSettings to extend. */
    GameSettings: TBaseGameSettings;
}) {
    /** A game with only two players in it. (a very common game type). */
    class TwoPlayerGame extends base.Game {
        /** The players in the game. */
        public readonly players!: TwoPlayerPlayer[];

        /**
         * Creates a new Two player game and hooks up the opponents.
         *
         * @param args - The arguments unknown to this constructor.
         */
        // any[] is required for mixin constructor signature
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            this.players[0].opponent = this.players[1];
            this.players[1].opponent = this.players[0];
        }
    }

    /** The manager for two player games. */
    class TwoPlayerGameManager extends base.GameManager {
        /** Two player games require... 2 players. */
        public static get requiredNumberOfPlayers(): number {
            return 2;
        }
    }

    return {
        ...base,
        Game: TwoPlayerGame,
        GameManager: TwoPlayerGameManager,
    };
}

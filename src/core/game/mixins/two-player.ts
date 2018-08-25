// tslint:disable:max-classes-per-file = because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface = because the some mixins have nothing to add

import { IBasePlayer } from "~/core/game";
import * as Base from "./base";

/** A player in a two player game, that has a guaranteed opponent. */
export interface ITwoPlayerPlayer extends IBasePlayer {
    opponent: ITwoPlayerPlayer;
}

/**
 * A base game that will only ever have two players in it, so they explicitly
 * know their singular opponent.
 *
 * @param base - The BaseGame (or sub BaseGame) to mix in two player logic.
 * @returns A new BaseGame class with TwoPlayer logic mixed in.
 */
// Because it will be a weird mixin type inferred from the return statement.
// tslint:disable-next-line:typedef
export function mixTwoPlayer<
    TBaseAI extends Base.BaseAIConstructor,
    TBaseGame extends Base.BaseGameConstructor,
    TBaseGameManager extends Base.BaseGameManagerConstructor,
    TBaseGameObject extends Base.BaseGameObjectConstructor,
    TBaseGameSettings extends Base.BaseGameSettingsManagerConstructor
>(base: {
    AI: TBaseAI;
    Game: TBaseGame;
    GameManager: TBaseGameManager;
    GameObject: TBaseGameObject;
    GameSettings: TBaseGameSettings;
}) {
    /** A game with only two players in it. (a very common game type) */
    class TwoPlayerGame extends base.Game {
        /** The players in the game. */
        public readonly players!: ITwoPlayerPlayer[];

        /**
         * Creates a new Two player game and hooks up the opponents.
         *
         * @param args - The arguments unknown to this constructor.
         */
        constructor(...args: any[]) { // tslint:disable-line:no-any - any[] required for mixin constructor signature
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

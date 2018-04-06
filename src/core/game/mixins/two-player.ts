// tslint:disable:max-classes-per-file = because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface = because the some mixins have nothing to add

import { BaseGameObject, IBaseGameSettings, IBasePlayer } from "~/core/game";
import * as Base from "./base";

export interface ITwoPlayerGameSettings extends IBaseGameSettings {}

export interface ITwoPlayerPlayer extends IBasePlayer {
    opponent: ITwoPlayerPlayer;
}

/**
 * A base game that will only ever have two players in it, so they explicitly know
 * their singular opponent
 * @mixin
 * @param base The BaseGame (or sub BaseGame) to mix in two player logic
 * @param TBasePlayer the base player
 * @returns a new BaseGame class with TwoPlayer logic mixed in
 */
// tslint:disable-next-line:typedef - because it will be a weird mixin type inferred from the return statement
export function mixTwoPlayer<
    TBaseAI extends Base.BaseAIConstructor,
    TBaseGame extends Base.BaseGameConstructor,
    TBaseGameManager extends Base.BaseGameManagerConstructor,
    TBaseGameObject extends Base.BaseGameObjectConstructor,
    TBaseGameSettings extends Base.BaseGameSettingsConstructor
>(base: {
    AI: TBaseAI,
    Game: TBaseGame,
    GameManager: TBaseGameManager,
    GameObject: TBaseGameObject,
    GameSettings: TBaseGameSettings,
}) {
    class TwoPlayerGame extends base.Game {
        public readonly players!: ITwoPlayerPlayer[];

        constructor(...args: any[]) {
            super(...args);

            this.players[0].opponent = this.players[1];
            this.players[1].opponent = this.players[0];
        }
    }

    class TwoPlayerGameManager extends base.GameManager {
        public static get requiredNumberOfPlayers(): number {
            return 2;
        }

        public invalidateRun(
            player: ITwoPlayerPlayer,
            gameObject: BaseGameObject,
            functionName: string,
            args: Map<string, any>,
        ): string | undefined {
            let invalid = super.invalidateRun(player, gameObject, functionName, args);

            if (!invalid) {
                if (player.won || player.lost) {
                    invalid = `You have already ${player.won ? "won" : "lost"} the game and cannot run anything.`;
                }
            }

            return invalid;
        }
    }

    return {
        ...base,
        Game: TwoPlayerGame,
        GameManager: TwoPlayerGameManager,
    };
}

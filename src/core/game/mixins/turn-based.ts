// tslint:disable:max-classes-per-file = because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface = because the some mixins have nothing to add

import { BaseGameObject, IBaseGameSettings, IBasePlayer, IGameSettingsDescriptions } from "~/core/game";
import { nextWrapAround } from "~/utils";
import * as Base from "./base";

/**
 * Settings for a turn based game
 */
export interface ITurnBasedGameSettings extends IBaseGameSettings {
    timeAddedPerTurn: number;
    maxTurns: number;
}

export interface ITurnBasedPlayer extends IBasePlayer {
}

/**
 * A base game that is turn based, with helper functions that should be common
 * between turn based games. defined in Creer data and implemented here so we
 * don't have to re-code it all the time.
 *
 * @param base the base classes to mixin turn based logic into
 * @returns a new BaseGame class with TwoPlayerGame logic mixed in
 */
// tslint:disable-next-line:typedef - because it will be a weird mixin type inferred from the return statement
export function mixTurnBased<
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
    class TurnBasedAI extends base.AI {
        public async runTurn(): Promise<boolean> {
            return await this.executeOrder<boolean>("runTurn");
        }
    }

    class TurnBaseGameSettings extends base.GameSettings {
        public get defaults(): ITurnBasedGameSettings {
            return {
                ...super.defaults,
                timeAddedPerTurn: 1e9, // 1 sec in ns,
                maxTurns: 200,
            };
        }

        public get descriptions(): IGameSettingsDescriptions<ITurnBasedGameSettings> {
            return {
                ...super.descriptions,
                timeAddedPerTurn: "The amount of time (in nano-seconds) to add after each player performs a turn.",
                maxTurns: "The maximum number of turns before the game is force ended and a winner is determined.",
            };
        }

        public invalidate(settings: ITurnBasedGameSettings): string | undefined {
            const invalid = super.invalidate(settings);
            if (invalid) {
                return invalid;
            }

            const timeAddedPerTurn = Number(settings.timeAddedPerTurn);
            if (isNaN(timeAddedPerTurn) || timeAddedPerTurn < 0) {
                return `${timeAddedPerTurn} is not a valid amount of time to add per player's turn.`;
            }
        }
    }

    class TurnBasedGame extends base.Game {
        /** The amount of time added to a player's timeRemaining at the end of each of their turns */
        public readonly timeAddedPerTurn!: number; // 1 sec in ns

        public currentPlayer!: IBasePlayer;

        public currentTurn!: number;

        public readonly maxTurns!: number;
    }

    class TurnBasedGameManager extends base.GameManager {
        public readonly game!: TurnBasedGame;

        /**
         * begins the turn based game to the first player
         * @param args all the args to pipe to our super
         */
        constructor(...args: any[]) {
            super(...args);

            this.game.currentPlayer = this.game.players[0];
        }

        protected start(): void {
            // different from nextTurn, this is called because their turn has not yet started
            this.beforeTurn();
        }

        protected invalidateRun(
            player: IBasePlayer,
            gameObject: BaseGameObject,
            functionName: string,
            args: Map<string, any>,
        ): string | undefined {
            const invalid = super.invalidateRun(player, gameObject, functionName, args);
            if (invalid) {
                return invalid;
            }

            if (player !== this.game.currentPlayer) {
                return "It is not your turn.";
            }
        }

        /**
         * Called before a players turn, including the first turn.
         */
        protected async beforeTurn(): Promise<void> {
            const done = await (this.game.currentPlayer.ai as TurnBasedAI).runTurn();

            if (done) {
                this.nextTurn();
            }
            else {
                this.beforeTurn();
            }
        }

        /**
         * Transitions to the next turn, increasing turn and setting the currentPlayer to the next one.
         */
        protected nextTurn(): void {
            if (this.game.currentTurn + 1 >= this.game.maxTurns) {
                this.maxTurnsReached();
                return;
            }

            this.game.currentTurn++;
            this.game.currentPlayer = nextWrapAround(this.game.players, this.game.currentPlayer)!;
            this.game.currentPlayer.timeRemaining += this.game.timeAddedPerTurn;

            this.beforeTurn();
        }

        /**
         * Intended to be inherited and then max turn victory conditions
         * checked to find the winner/looser.
         */
        protected maxTurnsReached(): void {
            this.endGame();
        }
    }

    return {
        ...base,
        AI: TurnBasedAI,
        Game: TurnBasedGame,
        GameManager: TurnBasedGameManager,
        GameSettings: TurnBaseGameSettings,
    };
}

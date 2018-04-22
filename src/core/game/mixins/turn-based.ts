// tslint:disable:max-classes-per-file = because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface = because the some mixins have nothing to add

import { BaseGameObject, IBasePlayer } from "~/core/game";
import { IAnyObject, nextWrapAround } from "~/utils";
import * as Base from "./base";

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
    TBaseGameSettings extends Base.BaseGameSettingsManagerConstructor
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
        public schema = this.makeSchema({
            ...(super.schema || (this as any).schema), // HACK: super should work. but schema is undefined on it
            timeAddedPerTurn: {
                default: 1e9, // 1 sec in ns,
                min: 0,
                description: "The amount of time (in nano-seconds) to add after each player performs a turn.",
            },
            maxTurns: {
                default: 200,
                min: 1,
                description: "The maximum number of turns before the game is force ended and a winner is determined.",
            },
        });

        public values = this.initialValues(this.schema);

        public getMaxPlayerTime(): number {
            return super.getMaxPlayerTime() + (this.values.maxTurns * this.values.timeAddedPerTurn);
        }

        protected invalidate(someSettings: IAnyObject): IAnyObject | Error {
            const invalidated = super.invalidate(someSettings);
            if (invalidated instanceof Error) {
                return invalidated;
            }

            const settings = { ...this.values, ...someSettings, ...invalidated };

            if (settings.maxTurns <= 0) {
                return new Error(`Max turns invalid: ${settings.maxTurns}. Must be > 0`);
            }

            if (settings.timeAddedPerTurn < 0) {
                return new Error(`time added per turn invalid: ${settings.timeAddedPerTurn}. Must be >= 0`);
            }

            return settings;
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
            this.secondaryGameOver(`Max turns reached (${this.game.maxTurns})`);
            this.endGame();
        }

        /**
         * Intended to be inherited with secondary win condition checking.
         * @param reason The reason why a secondary victory condition is being checked
         */
        protected secondaryGameOver(reason: string): void {
            this.makePlayerWinViaCoinFlip(`${reason}, Identical AIs played the game`);
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

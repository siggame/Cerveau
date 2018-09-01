// tslint:disable:max-classes-per-file
// ^ because the mixin define multiple classes while maintaining scope to each
// tslint:disable:no-empty-interface
// ^ because the some mixins have nothing to add

import { BaseGameObject, IBasePlayer } from "~/core/game";
import { nextWrapAround } from "~/utils";
import * as Base from "./base";

/** A player in a turn based game */
export interface ITurnBasedPlayer extends IBasePlayer {}

/**
 * A base game that is turn based, with helper functions that should be common
 * between turn based games. defined in Creer data and implemented here so we
 * don't have to re-code it all the time.
 *
 * @param base the base classes to mixin turn based logic into
 * @returns a new BaseGame class with TwoPlayerGame logic mixed in
 */
// Because it will be a weird mixin type inferred from the return statement.
// tslint:disable-next-line:typedef
export function mixTurnBased<
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
    /** An AI in the game that has turns to execute. */
    class TurnBasedAI extends base.AI {
        /**
         * Instructs the AI to run their turn.
         *
         * @returns A promise that resolves to if they want to end their turn.
         */
        public async runTurn(): Promise<boolean> {
            return this.executeOrder("runTurn");
        }
    }

    /** Game settings to control turn timing. */
    class TurnBaseGameSettings extends base.GameSettings {
        /** The schema for turn based settings. */
        public schema = this.makeSchema({
            // HACK: super should work. but schema is undefined on it
            // tslint:disable-next-line:no-any
            ...(super.schema || (this as any).schema),
            timeAddedPerTurn: {
                default: 1e9, // 1 sec in ns,
                min: 0,
                description: "The amount of time (in nano-seconds) to add "
                           + "after each player performs a turn.",
            },
            maxTurns: {
                default: 200,
                min: 1,
                description: "The maximum number of turns before the game is "
                           + "force ended and a winner is determined.",
            },
        });

        /** The values for turn based settings. */
        public values = this.initialValues(this.schema);

        /**
         * Adds in the maximum number of turns and time added per turn into
         * the calculations.
         *
         * @returns A number of how long in MS it wold take max.
         */
        public getMaxPlayerTime(): number {
            const { maxTurns, timeAddedPerTurn } = this.values;

            return super.getMaxPlayerTime() + (maxTurns * timeAddedPerTurn);
        }
    }

    /** A turn based game. */
    class TurnBasedGame extends base.Game {
        /**
         * The amount of time added to a player's timeRemaining at the end of
         * each of their turns
         */
        public readonly timeAddedPerTurn!: number; // 1 sec in ns

        /** The current player (player whose turn it is). */
        public currentPlayer!: IBasePlayer;

        /** The current turn number, starting at 0. */
        public currentTurn!: number;

        /**
         * The maximum number of turns. When currentTurn hits this the game
         * ends, and secondary game over conditions are evaluated.
         */
        public readonly maxTurns!: number;
    }

    /** The manager for turn based games. */
    class TurnBasedGameManager extends base.GameManager {
        /** The game we are managing. */
        public readonly game!: TurnBasedGame;

        /**
         * Begins the turn based game to the first player,
         *
         * @param args - All the args to pipe to our super.
         */
        constructor(...args: any[]) { // tslint:disable-line:no-any
                                      // any[] is required for mixin
                                      // constructor signature
            super(...args);

            this.game.currentPlayer = this.game.players[0];
        }

        /**
         * Base logic to invalidate any run command, ensuring players only
         * run logic on their turns.
         *
         * @param player - The player running code.
         * @param gameObject - The game object running.
         * @param functionName - The name of the function being run.
         * @param args - The key.value map (in positional arg order) args.
         * @returns A string explaining why it is invalid, or undefined if
         * valid.
         */
        protected invalidateRun(
            player: IBasePlayer,
            gameObject: BaseGameObject,
            functionName: string,
            args: Map<string, unknown>,
        ): string | undefined {
            const invalid = super.invalidateRun(
                player,
                gameObject,
                functionName,
                args,
            );

            if (invalid) {
                return invalid;
            }

            if (player !== this.game.currentPlayer) {
                return "It is not your turn.";
            }
        }

        /** Starts the game */
        protected start(): void {
            this.runCurrentTurn();
        }

        /**
         * Called before a players turn, including the first turn.
         */
        protected async beforeTurn(): Promise<void> {
            // intended to be over-ridden
        }

        /**
         * Transitions to the next turn, increasing turn and setting the
         * currentPlayer to the next one.
         */
        protected async afterTurn(): Promise<void> {
            // intended to be over-ridden
        }

        /**
         * Intended to be inherited and then max turn victory conditions
         * checked to find the winner/looser.
         */
        protected maxTurnsReached(): void {
            this.secondaryWinConditions(`Max turns reached (${this.game.maxTurns})`);

            this.endGame();
        }

        /**
         * Checks if the game is over in between turns.
         * This is invoked AFTER afterTurn() is called, but BEFORE beforeTurn()
         * is called.
         *
         * @returns True if the game is indeed over, otherwise if the game
         * should continue return false.
         */
        protected primaryWinConditionsCheck(): boolean {
            return false;
        }

        /**
         * Intended to be inherited with secondary win condition checking.
         *
         * @param reason The reason why a secondary victory condition is being
         * checked.
         */
        protected secondaryWinConditions(reason: string): void {
            this.makePlayerWinViaCoinFlip(
                `${reason}, Identical AIs played the game`,
            );
        }

        /** Runs a turn, invoking all protected methods around it */
        private async runCurrentTurn(): Promise<void> {
            await this.beforeTurn();

            const turnBasedAI = (this.game.currentPlayer.ai as TurnBasedAI);
            const done = await turnBasedAI.runTurn();

            if (done) {
                await this.afterTurn();

                // now check if the game is over before advancing the turn
                if (this.game.currentTurn + 1 >= this.game.maxTurns) {
                    this.maxTurnsReached();

                    return;
                }
                else if (this.primaryWinConditionsCheck()) {
                    this.endGame();

                    return;
                }

                // If we got here all after turn logic is done, so let's
                // advance the turn.
                this.game.currentTurn++;

                const nextPlayer = nextWrapAround(
                    this.game.players,
                    this.game.currentPlayer,
                );

                if (!nextPlayer) {
                    throw new Error(
                        "Cannot find the next player for their turn!",
                    );
                }

                this.game.currentPlayer = nextPlayer;
                this.game.currentPlayer.timeRemaining += this.game.timeAddedPerTurn;

            }

            this.runCurrentTurn();
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

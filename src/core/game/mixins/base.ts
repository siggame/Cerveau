import { BaseAI, BaseGame, BaseGameManager, BaseGameObject, BaseGameSettingsManager } from "~/core/game/base";
import { Constructor } from "~/utils";

export type BaseAIConstructor = Constructor<BaseAI>;
export type BaseGameConstructor = Constructor<BaseGame>;
export type BaseGameManagerConstructor = Constructor<BaseGameManager>;
export type BaseGameObjectConstructor = Constructor<BaseGameObject>;
export type BaseGameSettingsManagerConstructor = Constructor<BaseGameSettingsManager>;

import { BaseAI, BaseGame, BaseGameManager, BaseGameObject,
         BaseGameSettingsManager } from "~/core/game/base";
import { Constructor } from "~/utils";

/** The BaseAI Constructor for mixins */
export type BaseAIConstructor = Constructor<BaseAI>;

/** The BaseGame Constructor for mixins */
export type BaseGameConstructor = Constructor<BaseGame>;

/** The BaseGameManager Constructor for mixins */
export type BaseGameManagerConstructor = Constructor<BaseGameManager>;

/** The BaseGameObject Constructor for mixins */
export type BaseGameObjectConstructor = Constructor<BaseGameObject>;

/** The BaseGameSettingsManager Constructor for mixins */
export type BaseGameSettingsManagerConstructor = Constructor<
    BaseGameSettingsManager
>;

// GameObject: An object in the game. The most basic class that all game classes should inherit from automatically.

import { BaseClasses, Game, GameManager } from "./";
import { IGameObjectProperties } from "./game-interfaces";

export interface IGameObjectConstructorArgs extends IGameObjectProperties {
    // <<-- Creer-Merge: constructor-args -->>

    // You can add more constructor args in here!

    // <<-- /Creer-Merge: constructor-args -->>
}

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be required here safely between cree runs
// <<-- /Creer-Merge: imports -->>

/*
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class GameObject extends BaseClasses.GameObject {
    protected game!: Game;
    protected manager!: GameManager;
}

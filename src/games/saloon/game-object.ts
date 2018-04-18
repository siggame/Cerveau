import { IBaseGameObjectRequiredData } from "~/core/game";
import { BaseClasses, IGameObjectProperties } from "./";
import { SaloonGame } from "./game";
import { SaloonGameManager } from "./game-manager";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

export interface IGameObjectConstructorArgs
extends IGameObjectProperties {
    // <<-- Creer-Merge: constructor-args -->>
    // You can add more constructor args in here
    // <<-- /Creer-Merge: constructor-args -->>
}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class GameObject extends BaseClasses.GameObject {
    /** The game this game object is in */
    public readonly game!: SaloonGame;

    /** The manager of the game that controls this */
    public readonly manager!: SaloonGameManager;

    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     */
    public readonly gameObjectName!: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     */
    public readonly id!: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     */
    public logs!: string[];

    // <<-- Creer-Merge: attributes -->>

    // Any additional member attributes can go here
    // NOTE: They will not be sent to the AIs, those must be defined
    // in the creer file.

    // <<-- /Creer-Merge: attributes -->>

    /**
     * Called when a GameObject is created.
     *
     * @param data Initial value(s) to set member variables to.
     * @param required Data required to initialize this (ignore it)
     */
    constructor(
        data: IGameObjectConstructorArgs,
        required: IBaseGameObjectRequiredData,
    ) {
        super(data, required);

        // <<-- Creer-Merge: constructor -->>
        // setup any thing you need here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: functions -->>

    // Any additional protected or pirate methods can go here.

    // <<-- /Creer-Merge: functions -->>
}

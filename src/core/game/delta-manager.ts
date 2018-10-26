import { Delta } from "cadre-ts-utils/cadre";
import { SHARED_CONSTANTS } from "~/core/constants";
import { BaseGame, BaseGameObject } from "~/core/game";
import { isObject, objectHasProperty, UnknownObject } from "~/utils";
import { DeltaMergeable } from "./delta-mergeable/";

/** Manages delta states on behalf of a game */
export class DeltaManager {
    /** The root delta mergeable we use for the game to branch off. */
    public readonly rootDeltaMergeable: DeltaMergeable;

    /** The current delta state we are building. */
    private delta: Delta["game"] = {};

    /** Manages delta states on behalf of a game */
    constructor() {
        this.rootDeltaMergeable = new DeltaMergeable({
            key: "__root__",
        });

        this.rootDeltaMergeable.events.changed.on((changed) => {
            this.handleDelta(changed);
        });

        this.rootDeltaMergeable.events.deleted.on((deleted) => {
            this.handleDelta(deleted, true);
        });
    }

    /**
     * Gets the true delta state of the game, with nothing hidden, then resets
     * the state that was dumped.
     *
     * @returns - The delta formatted object representing the true delta
     * state of the game, with nothing hidden.
     */
    public dump(): Delta["game"] {
        const state = this.delta;
        this.delta = {};

        return state;
    }

    /**
     * Handles a change in game state by updating our delta.
     *
     * @param changed - The delta mergeable that mutated.
     * @param wasDeleted - A boolean indicating if the mutation was a deletion.
     */
    protected handleDelta(
        changed: DeltaMergeable,
        wasDeleted: boolean = false,
    ): void {
        let changedValue = changed.get();
        if (changedValue instanceof BaseGame) {
            return; // we only care about the game's children, not itself
        }

        let pathDeltaMergeable: DeltaMergeable | undefined = changed;
        const path = [] as DeltaMergeable[];
        while (pathDeltaMergeable && pathDeltaMergeable.getParent() !== this.rootDeltaMergeable) {
            path.unshift(pathDeltaMergeable);
            pathDeltaMergeable = pathDeltaMergeable.getParent();
        }

        let current = this.delta;
        // Now go up the path to the deltaMergeable that changed to build up
        // our delta.
        for (let i = 0; i < path.length; i++) {
            const dm = path[i];
            const value = dm.get();

            if (!objectHasProperty(current, dm.key)) {
                (current as UnknownObject)[dm.key] = {};
            }

            if (Array.isArray(value)) {
                const len = value.length;
                (current[dm.key] as UnknownObject)[SHARED_CONSTANTS.DELTA_LIST_LENGTH] = len;
            }

            if (i !== (path.length - 1)) {
                current = current[dm.key] as UnknownObject;
            }
        }

        // current should now be at the end of the path
        if (changedValue === undefined && !wasDeleted) {
            // Do not use `undefined` in this case.
            // When JSON serializing, keys with the value `undefined` will be
            // dropped, however we want to tell clients/gamelogs that this key
            // still exists, but with no value.
            // `null` is the correct value in this case.
            changedValue = null;
        }

        if (wasDeleted) {
            // Change the value to the special constant to tell clients
            // to delete this key from the object.
            changedValue = SHARED_CONSTANTS.DELTA_REMOVED;
        }
        // tslint:disable-next-line:no-unsafe-any
        else if (isObject(changedValue)) {
            const originalValue = changedValue;
            changedValue = {};
            if (originalValue instanceof BaseGameObject
                && !(path.length === 2 && path[0].key === "gameObjects")
            ) {
                // Then it should be a game object reference.
                (changedValue as UnknownObject).id = originalValue.id;
            }
            else if (Array.isArray(originalValue)) {
                (changedValue as UnknownObject)[SHARED_CONSTANTS.DELTA_LIST_LENGTH] = originalValue.length;
            }
        }
        // else changed value is a primitive and is safe to copy

        current[changed.key] = changedValue as unknown;
    }
}

import { SHARED_CONSTANTS } from "~/core/constants";
import { BaseGameObject } from "~/core/game";
import { objectHasProperty } from "~/utils";
import { DeltaMergeable } from "./delta-mergeable/";

/** Manages delta states on behalf of a game */
export class DeltaManager {
    /** The root delta mergeable we use for the game to branch off. */
    public readonly rootDeltaMergeable: DeltaMergeable<any>;

    /** The current delta state we are building. */
    private delta: any = {};

    /** Manages delta states on behalf of a game */
    constructor() {
        this.rootDeltaMergeable = new DeltaMergeable({
            key: "__root__",
        });

        this.rootDeltaMergeable.events.changed.on((changed) => this.handleDelta(changed));
        this.rootDeltaMergeable.events.deleted.on((deleted) => this.handleDelta(deleted, true));
    }

    /**
     * Gets the true delta state of the game, with nothing hidden, then resets the state
     * @returns delta formatted object representing the true delta
     * state of the game, with nothing hidden
     */
    public dump(): any {
        const popped = this.delta;
        this.delta = {};
        return popped;
    }

    /**
     * Handles a change in game state by updating our delta
     * @param changed the delta mergeable that mutated
     * @param wasDeleted a boolean indicating if the mutation was a deletion
     */
    protected handleDelta(changed: DeltaMergeable<any>, wasDeleted: boolean = false): void {
        // pass

        let pathDeltaMergeable = changed;
        const path = new Array<DeltaMergeable<any>>();
        while (pathDeltaMergeable.getParent() !== this.rootDeltaMergeable) {
            path.unshift(pathDeltaMergeable);
            pathDeltaMergeable = pathDeltaMergeable.getParent()!;
        }

        let current = this.delta;
        // now go up the path to the deltaMergeable that changed to build up our delta
        for (let i = 0; i < path.length; i++) {
            const dm = path[i];
            const value = dm.get();

            if (!objectHasProperty(current, dm.key)) {
                current[dm.key] = {};
            }

            if (Array.isArray(value)) {
                current[dm.key][SHARED_CONSTANTS.DELTA_LIST_LENGTH] = value.length;
            }

            if (i !== (path.length - 1)) {
                current = current[dm.key];
            }
        }

        // current should now be at the end of the path
        let changedValue = changed.get();
        if (changedValue === undefined && !wasDeleted) {
            // Do not use `undefined` in this case.
            // When JSON serializing, keys with the value `undefined` will be
            // dropped, however we want to tell clients/gamelogs that this key
            // still exists, but with no value.
            // `null` is the correct value in this case.
            changedValue = null;
        }

        if (wasDeleted) {
            changedValue = SHARED_CONSTANTS.DELTA_REMOVED;
        }
        else {
            if (changedValue instanceof BaseGameObject) {
                if (path.length === 2 && path[0].key === "gameObjects") {
                    changedValue = {};
                }
                else {
                    changedValue = { id: changedValue.id };
                }
            }
            else if (Array.isArray(changedValue)) {
                changedValue = { [SHARED_CONSTANTS.DELTA_LIST_LENGTH]: changedValue.length };
            }
            else if (typeof(changedValue) === "object" && changedValue !== null) {
                changedValue = {};
            }
            // else changed value is a primitive and is safe to copy
        }

        current[changed.key] = changedValue;
    }
}

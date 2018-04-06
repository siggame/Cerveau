import { SHARED_CONSTANTS } from "~/core/constants";
import { BaseGameObject } from "~/core/game";
import { objectHasProperty } from "~/utils";
import { DeltaMergeable } from "./delta-mergeable/";

/** Manages delta states on behalf of a game */
export class DeltaManager {
    public readonly rootDeltaMergeable: DeltaMergeable<any>;
    private delta: any = {};

    constructor() {
        this.rootDeltaMergeable = new DeltaMergeable({
            key: "__root__",
        });

        this.rootDeltaMergeable.events.changed.on((changed) => this.handleDelta(changed));
        this.rootDeltaMergeable.events.deleted.on((deleted) => this.handleDelta(deleted, true));
    }

    /**
     * Gets the true delta state of the game, with nothing hidden, then resets the state
     * @returns {Object} delta formatted object representing the true delta
     * state of the game, with nothing hidden
     */
    public pop(): any {
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

        let pathDeltaMergable = changed;
        const path = new Array<DeltaMergeable<any>>();
        while (pathDeltaMergable.getParent() !== this.rootDeltaMergeable) {
            path.unshift(pathDeltaMergable);
            pathDeltaMergable = pathDeltaMergable.getParent()!;
        }

        const stringPath = path.map((d) => d.key).join(".");

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

            /*
            if (i === (path.length - 1)) {
                value = wasDeleted ?
                    SHARED_CONSTANTS.DELTA_REMOVED :
                    deltaMergeable.get();

                if (!wasDeleted && value instanceof BaseGameObject) {
                    value = (path.length === 2 && path[0].key === "gameObjects")
                        ? {} // the actual game object (to be filled in with keys)
                        : { id: value.id };
                }

                current[dm.key] = value;
            }
            else {
                current = current[dm.key];
            }*/
        }

        // current should now be at the end of the path
        let changedValue = changed.get();
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
            else if (typeof(changedValue) === "object") {
                changedValue = {};
            }
            // else changed value is a primitive and is safe to copy
        }

        current[changed.key] = changedValue;
    }
}

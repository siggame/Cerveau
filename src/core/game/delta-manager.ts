import { SHARED_CONSTANTS } from "~/core/constants";
import { DeltaMergeable } from "./delta-mergeable/";

/** Manages delta states on behalf of a game */
export class DeltaManager {
    private rootDeltaMergeable: DeltaMergeable<any>;
    private delta: any;

    constructor() {
        this.rootDeltaMergeable = new DeltaMergeable({
            key: "__root__",
        });

        this.rootDeltaMergeable.events.changed.on((changed) => this.handleDelta(changed));
        this.rootDeltaMergeable.events.deleted.on((deleted) => this.handleDelta(deleted, true));
    }

    /**
     * Clears the current delta data. Should be called by the instance once its
     * done with the current delta of this game
     */
    public flush(): void {
        this.delta = {};
    }

    /**
     * Gets the true delta state of the game, with nothing hidden
     * @returns {Object} delta formatted object representing the true delta
     * state of the game, with nothing hidden
     */
    public get(): any {
        return this.delta;
    }

    /**
     * Handles a change in game state by updating our delta
     * @param deltaMergeable the delta mergeable that mutated
     * @param wasDeleted a boolean indicating if the mutation was a deletion
     */
    protected handleDelta(deltaMergeable: DeltaMergeable<any>, wasDeleted: boolean = false): void {
        // pass

        let pathDeltaMergable = deltaMergeable;
        const path = new Array<DeltaMergeable<any>>();
        while (pathDeltaMergable.getParent() !== this.rootDeltaMergeable) {
            path.push(pathDeltaMergable);
            pathDeltaMergable = pathDeltaMergable.getParent()!;
        }

        let current = this.delta;
        // now go up the path to the deltaMergeable that changed to build up our delta
        for (let i = 0; i < path.length; i++) {
            const dm = path[i];
            if (!Object.prototype.hasOwnProperty.call(current, dm.key)) {
                current[dm.key] = {};
            }

            if (Array.isArray(dm.get())) {
                current[dm.key][SHARED_CONSTANTS.DELTA_LIST_LENGTH] = dm.get().length;
            }

            if (i === (path.length - 1)) {
                let value = wasDeleted
                    ? SHARED_CONSTANTS.DELTA_REMOVED
                    : deltaMergeable.get();

                if (!wasDeleted && deltaMergeable.isDeltaReference) {
                    value = { id: value.id };
                }

                current[dm.key] = value;
            }
            else {
                current = current[dm.key];
            }
        }
    }
}

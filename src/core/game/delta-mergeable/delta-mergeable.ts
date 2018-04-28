import { Event, events } from "ts-typed-events";
import { IAnyObject } from "~/utils";

/**
 * Wraps a property in the game to observe for changes (deltas).
 * Each DeltaMergeable can have child values, such as an array with child index
 * DeltaMergeables. This builds up a tree representing the game, used to build
 * delta states.
 */
export class DeltaMergeable<T = any> {
    /** The key parent this is */
    public readonly key: string;

    /**
     * Wraps this delta mergeable in some object like an array or js object.
     */
    public wrapper?: object;

    /** The events this delta mergeable emits when it mutates */
    public readonly events = events({
        changed: new Event<DeltaMergeable<any>>(),
        deleted: new Event<DeltaMergeable<any>>(),
    });

    /** The parent delta mergeable, if undefined then it is the root. */
    private parent: DeltaMergeable<any> | undefined;

    /** The child nodes. If empty this is a leaf node. */
    private children = new Map<string, DeltaMergeable<any>>();

    /** An optional transform function to use on all sets. */
    private transform?: (value: any, currentValue?: T) => T | undefined;

    /** The current value of the node. */
    private value: T | undefined;

    /**
     * Creates a new delta mergeable. it's creation will trigger a change in
     * parent(s).
     * @param data - Initialization data about the parent and value of this DM.
     */
    constructor(data: {
        key: string;
        parent?: DeltaMergeable<any>;
        initialValue?: T;
        transform?: (value: any, currentValue?: T) => T | undefined;
    }) {
        this.key = data.key;

        if (data.parent) {
            data.parent.adopt(this);
        }

        // So the setter has a current value to work with if transforms happen
        this.value = data.initialValue;

        this.transform = data.transform;
        this.set(data.initialValue, false, true);
    }

    /**
     * Gets our parent, if we have one.
     * @returns Our parent, if we have one.
     */
    public getParent(): DeltaMergeable<T> | undefined {
        return this.parent;
    }

    /**
     * Gets our current value.
     * @returns Our current value.
     */
    public get(): T | undefined {
        return this.value;
    }

    /**
     * Sets the current value. It may mutate or not, if it does it will
     * emit an event.
     *
     * @param value - The new value to try to set.
     * @param deleted - If they value is that it was deleted.
     * @param forceSet - Force the set to occur, even if the current value is
     * the same.
     */
    public set(value: any, deleted?: boolean, forceSet?: true): void {
        if (this.transform) {
            value = this.transform(value, this.get());
        }

        if (value !== this.value || forceSet) {
            this.value = value;

            this.events.changed.emit(this);
        }
    }

    public delete(): void {
        this.value = undefined;
        this.events.deleted.emit(this);
        this.parent = undefined;
    }

    // Children operations \\

    public adopt(child: DeltaMergeable<any>): void {
        if (child.parent === this) {
            return; // nothing to do
        }

        if (child.parent) {
            throw new Error("Cannot adopt a child who already has a parent");
        }

        child.parent = this;
        this.children.set(child.key, child);

        const onChanged = (changed: DeltaMergeable<any>) => {
            this.events.changed.emit(changed);
        };
        child.events.changed.on(onChanged);

        child.events.deleted.on((deleted) => {
            if (deleted === child) {
                // our child has been deleted :(
                deleted.events.changed.off(onChanged);
                this.children.delete(deleted.key);
            }

            // notify upstream
            this.events.deleted.emit(deleted);
        });
    }

    /**
     * Gets our child with the given key, if we have it.
     * @param key - They key of the child to check for.
     * @returns The child, if it exists, otherwise undefined.
     */
    public child(key: string): DeltaMergeable<T> | undefined {
        return this.children.get(key);
    }
}

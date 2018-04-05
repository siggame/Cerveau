import { Event, events } from "ts-typed-events";
import { IAnyObject } from "~/utils";

export interface IDeltaMergeableOptions<T> {
    key: string;
    parent?: DeltaMergeable<any>;
    initialValue?: T;
    transform?: (value: any, currentValue?: T) => T | undefined;
    deltaReference?: boolean;
}

export class DeltaMergeable<T = any> {
    public readonly key: string;
    public readonly isDeltaReference: boolean = false;

    /**
     * Wraps this delta mergeable in some object like an array or js object
     */
    public wrapper?: object;

    public readonly events = events({
        changed: new Event<DeltaMergeable<any>>(),
        deleted: new Event<DeltaMergeable<any>>(),
    });

    private parent: DeltaMergeable<any> | undefined;
    private children = new Map<string, DeltaMergeable<any>>();
    private transform?: (value: any, currentValue?: T) => T | undefined;
    private value: T | undefined;

    constructor(options: IDeltaMergeableOptions<T>) {
        this.key = options.key;

        if (options.parent) {
            options.parent.adopt(this);
        }

        this.value = options.initialValue; // so the setter has a current value to work with if transforms happen
        this.isDeltaReference = Boolean(options.deltaReference);
        this.transform = options.transform;
        this.set(options.initialValue);
    }

    public getParent(): DeltaMergeable<T> | undefined {
        return this.parent;
    }

    public get(): T | undefined {
        return this.value;
    }

    public set(value: any, deleted?: true): void {
        if (this.transform) {
            value = this.transform(value, this.get());
        }

        if (value !== this.value) {
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

        child.events.deleted.once((deleted) => {
            this.events.deleted.emit(deleted);

            this.children.delete(child.key);
            child.events.changed.off(onChanged);
        });
    }

    public child(key: string): DeltaMergeable<T> | undefined {
        return this.children.get(key);
    }

    public toTree(): any {
        const obj: IAnyObject = {};
        for (const [key, child] of this.children) {
            obj[key] = child.toTree();
        }

        if (Object.keys(obj).length === 0) {
            return this.get();
        }

        return obj;
    }
}

import { DeltaMergeable } from "./delta-mergeable";

export class DeltaMergeableWrapped<T> extends DeltaMergeable<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public set(newValue: unknown, _forceSet = false): void {
        super.set(newValue, false);
    }

    public get(): T {
        return (this.wrapper as unknown) as T;
    }
}

import { IBaseGameNamespace } from "~/core/game";
import { Immutable } from "~/utils";

/** The expected interface all games export from their index */
export interface IGamesExport {
    /** The namespace used to access all components to build that game. */
    Namespace: Immutable<IBaseGameNamespace>;
}

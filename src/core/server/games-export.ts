import { BaseGameNamespace } from "~/core/game";
import { Immutable } from "~/utils";

/** The expected interface all games export from their index. */
export interface GamesExport {
    /** The namespace used to access all components to build that game. */
    Namespace: Immutable<BaseGameNamespace>;
}

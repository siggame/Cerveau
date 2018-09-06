import { IBaseGameNamespace } from "~/core/game";

/** The expected interface all games export from their index */
export interface IGamesExport {
    /** The namespace used to access all components to build that game. */
    Namespace: IBaseGameNamespace;
}

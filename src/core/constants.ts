// Put constant values here to be sent to clients,
// they will not be able to be changed thanks to Object.freeze

import { DeltaMergeConstants } from "@cadre/ts-utils/cadre";

/**
 * These constants will be sent to clients.
 * (hence shared between the server here and clients).
 */
export const SHARED_CONSTANTS = Object.freeze<DeltaMergeConstants>({
    /**
     * Special symbol that indicates a delta's key was removed when this value
     * is present.
     */
    DELTA_REMOVED: "&RM",

    /**
     * A special key that indicates the object is an array with the value being
     * the array's length.
     */
    DELTA_LIST_LENGTH: "&LEN",
});

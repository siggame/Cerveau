// Put constant values here, they will not be able to be changed thanks to Object.freeze

/**
 * These constants will be sent to clients (hence shared between the server here and clients)
 */
export const SHARED_CONSTANTS = Object.freeze({
    /** Special symbol that indicates a delta's key was removed when this value is present */
    DELTA_REMOVED: "&RM",

    /** Special key that indicates the object is an array of the length idicated by this key */
    DELTA_LIST_LENGTH: "&LEN",
});

/** Lightweight information about a client. */
export interface ClientInfo {
    // required
    /** The name of the client. */
    name: string;
    /** If they are spectating the game (true), or playing (false). */
    spectating: boolean;

    // -- when over -- \\
    /** Their index in the game, undefined when not playing. */
    index?: number;
    /** If they lost the game or not, undefined when not playing. */
    lost?: boolean;
    /** If they won the game or not, undefined when not playing. */
    won?: boolean;
    /** The reason why they won or lost, undefined when not playing. */
    reason?: string;
    /** If they disconnected during gameplay. */
    disconnected?: boolean;
    /** If they timed out during game play, and that is why they disconnected. */
    timedOut?: boolean;
}

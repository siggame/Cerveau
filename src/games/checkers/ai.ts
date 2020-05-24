import { BaseClasses } from "./";
import { Checker } from "./checker";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be placed here safely between creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * Represents the AI that a player controls. This acts as an interface to send
 * the AI orders to execute.
 */
export class AI extends BaseClasses.AI {
    // <<-- Creer-Merge: attributes -->>
    // If the AI needs additional attributes add them here.
    // NOTE: these are not set in client AIs.
    // <<-- /Creer-Merge: attributes -->>
    /**
     * This is called whenever your checker gets captured (during an opponent's
     * turn).
     *
     * @param checker - The checker that was captured.
     */
    public async gotCaptured(checker: Checker): Promise<void> {
        this.executeOrder("gotCaptured",
            checker,
        );
    }

    // <<-- Creer-Merge: functions -->>
    // If the AI needs additional attributes add them here.
    /// NOTE: these will not be callable in client AIs.
    // <<-- /Creer-Merge: functions -->>
}

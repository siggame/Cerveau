import { BaseAIManager } from "./base-ai-manager";

/**
 * A way to interact with a client/player's AI via simple async methods for
 * orders
 */
// NOTE: this is basically a wrapper around the AI, so that some public
// functions cannot be seen to games, but can be seen to those with the access
// to the manager
// e.g. the session
export class BaseAI {
    /**
     * Creates an AI interface.
     *
     * @param manager - the AI manager for this AI that actually does the heavy
     * lifting.
     */
    constructor(private readonly manager: BaseAIManager) {}

    /**
     * A method invoked by sub AI classes written by creer to send an order
     * command to this AI.
     *
     * @param name - The name of the function (order) to execute.
     * @param args - optional **positional** arguments to send to the function.
     * @returns A promise that resolves to the value the AI returned from that
     * order, once they finish that order.
     */
    protected executeOrder(name: string, ...args: any[]): Promise<any> {
        return this.manager.executeOrder(name, ...args);
    }
}

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
    constructor(private readonly manager: BaseAIManager) {}

    protected executeOrder<T>(name: string, ...args: any[]): Promise<T> {
        return this.manager.executeOrder(name, ...args);
    }
}

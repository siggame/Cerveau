import { exec } from "child_process";
import { events, Signal } from "ts-typed-events";
import { httpRequest } from "~/utils";
import { logger } from "./log";

const UPDATE_INTERVAL = 1000; // 1 sec in ms
const GITHUB_URL = "https://api.github.com/repos/siggame/cerveau/commits";

/** Manages and automatically updates this repository */
export class Updater {
    /** The events that this Updater emits */
    public readonly events = events({
        updateFound: new Signal(),
    });

    /** Our current sha hash of the git repo we are running inside of. */
    private sha: string | undefined;

    /** The interval checking for updates (so we can clear it if need be). */
    private interval: NodeJS.Timer | undefined;

    /** If an update was found. */
    private updateFound: boolean = false;

    /** Creates a new Updater to check for updates */
    public constructor() {
        // Thanks to: https://stackoverflow.com/questions/34518389/get-hash-of-most-recent-git-commit-in-node
        exec("git rev-parse HEAD", async (err, stdout) => {
            if (err) {
                logger.error(
`Updater cannot determine the current version of this Cerveau instance.
Is this a git repo with git installed on your system?`,
                );

                return;
            }

            this.sha = stdout.toLowerCase().trim();

            this.interval = setInterval(() => {
                this.intervalCheck();
            }, UPDATE_INTERVAL);

            // do it immediately too
            this.intervalCheck();
        });
    }

    /**
     * Invoked by the interval to check for updates, and if found stops
     * checking.
     *
     * @returns A promise that resolves after the check is done.
     */
    private async intervalCheck(): Promise<void> {
        const warning = await this.doCheck();

        if (warning) {
            logger.warn(warning);

            if (this.interval) {
                clearInterval(this.interval);
            }
        }

        if (this.updateFound) {
            this.events.updateFound.emit();
        }
    }

    /**
     * Does the actual check for updates via request to GitHub. If an actual
     * update is found the `updateFound` parameter on this instance will be set
     * to true.
     *
     * @returns A promise that resolves with a string warning to log,
     * otherwise undefined if no warnings are we should continue checking for
     * updates.
     */
    private async doCheck(): Promise<string | undefined> {
        let githubResponse = "";
        try {
            githubResponse = await httpRequest(GITHUB_URL);
        }
        catch (err) {
            return `Error with GitHub API. Request failed: ${err}
Updater shuting down.`;
        }

        let githubData: any;
        try {
            githubData = JSON.parse(githubResponse);
        }
        catch (err) {
            return `Error parsing GitHub data: ${err}
Updater shuting down.`;
        }

        // If we got here, we got the data from GitHub, and it parsed correctly
        if (!githubData ||
            !Array.isArray(githubData) ||
            !githubData[0] ||
            !githubData[0].sha
        ) {
            return `GitHub data appears malformed.
Updater shuting down.`;
        }

        const headSHA = String(githubData[0].sha).toLowerCase().trim();

        if (this.sha !== headSHA) {
            this.updateFound = true;
            return `🆕 Update Found! 🆕
Your current Cerveau commit:           ${this.sha}
GitHub's most recent Cerveau commit:   ${headSHA}

Please run 'git pull' to update.
Then start it back up to finalize the update.`;
        }
        // If we got here it appears to be up to date.
    }
}

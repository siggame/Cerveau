import * as fs from "fs-extra";
import * as path from "path";
import * as sanitizeFilename from "sanitize-filename";
import { createGzip } from "zlib";
import { Config } from "~/core/args";
import { IGamelog } from "~/core/game";
import * as utils from "~/utils";

/** Represents information about an unloaded gamelog */
export interface IGamelogInfo {
    /** The filename of the gamelog this info is about, use it to load the entire gamelog */
    filename: string;

    /** The epoch time the gamelog was written */
    epoch: number;

    /** The game session this gamelog logged */
    gameSession: string;

    /** The name of the game this gamelog is for */
    gameName: string;

    /** The uri to this gamelog on this instance */
    uri: string;

    /** The url to the visualizer that can play this gamelog, if we know the visualizer */
    visualizerUrl?: string;
}

type FilenameFormatter = (gameName?: string, gameSession?: string, moment?: string) => string;

/**
 * A simple manager that attaches to a directory and manages creating and
 * reading game logs in that directory.
 */
export class GameLogManager {

    /** The extension used for gamelogs */
    private readonly gamelogExtension: string = ".json.gz";

    /** The set of filenames we are currently writing to the disk */
    private filenamesWriting = new Set<string>();

    /**
     * Initializes the GameLogger (needed on every thread)
     * @param gamelogDirectory an optional override on where to output gamelogs to
     */
    constructor(
        /** The directory where this will save gamelog files to */
        public readonly gamelogDirectory: string = path.join(Config.LOGS_DIR, "gamelogs/"),
    ) {
        if (Config.ARENA_MODE) {
            // TODO: upgrade arena so it can get the "real" filename with
            //       the moment string in it via REST API
            this.filenameFormat = (n, s, m) => `${n}-${s}`;
        }
    }

    /**
     * Creates a gamelog for the game in the directory set during init
     * @param gamelog the gamelog which should be serialize-able to json representation of the gamelog
     * @returns a promise that resolves to the filename written
     */
    public log(gamelog: any): Promise<string> {
        const serialized = JSON.stringify(gamelog);
        const filename = this.filenameFor(gamelog.gameName, gamelog.gameSession, gamelog.epoch);

        const writeSteam = fs.createWriteStream(this.gamelogDirectory + filename + this.gamelogExtension, "utf8");
        const gzip = createGzip();

        return new Promise((resolve, reject) => {
            gzip.on("error", (err) => {
                reject(err);
            });

            this.filenamesWriting.add(filename);

            gzip.on("finish", () => {
                this.filenamesWriting.delete(filename);
                resolve(filename);
            });

            gzip.pipe(writeSteam);
            gzip.write(serialized);
            gzip.end();
        });
    }

    /**
     * Gets ALL the gamelogs in LOGS_DIR/gamelogs.
     * The gamelogs are not complete, but rather a "shallow" gamelog.
     * @returns a promise for the list of gamelogs information
     */
    public async getLogs(): Promise<IGamelogInfo[]> {
        const files = await fs.readdir(this.gamelogDirectory);

        const gamelogs: IGamelogInfo[] = [];
        for (const filename of files) {
            if (!this.filenamesWriting.has(filename) && filename.endsWith(this.gamelogExtension)) {
                // then it is a gamelog
                const split = filename.split("-");

                if (split.length === 3) { // then we can figure out what the game is based on file name
                    const [epochString, gameName, session] = split;

                    gamelogs.push({
                        epoch: Number(utils.stringToMoment(epochString)),
                        filename,
                        gameName,
                        gameSession: session.substring(0, session.length - this.gamelogExtension.length),
                        uri: this.getURL(filename),
                        visualizerUrl: this.getVisualizerURL(filename),
                    });
                }
            }
        }

        return gamelogs;
    }

    /**
     * Gets the first gamelog matching the filename, without the extension
     * @param filename the base filename (without gamelog extension) you want in LOGS_DIR/gamelogs/
     * @returns a promise to a gamelog matching passed in parameters, or undefined if no gamelog. second arg is error.
     */
    public async getGamelog(filename: string): Promise<any> {
        const gamelogPath = await this.checkGamelog(filename);
        if (!gamelogPath) {
            return undefined; // gamelog doesn't exist, so we have nothing to return
        }

        return await utils.gunzipFile(gamelogPath);
    }

    /**
     * Deletes the first gamelog matching the filename, without the extension
     * @param filename the base filename (without gamelog extension) you want in LOGS_DIR/gamelogs
     * @returns the a boolean if it was successfully deleted
     */
    public async deleteGamelog(filename: string): Promise<boolean> {
        const gamelogPath = await this.checkGamelog(filename);

        if (!gamelogPath) {
            return false;
        }

        // else it does exist, so delete it
        await fs.unlink(gamelogPath);
        return true;
    }

    /**
     * Returns a url string to the gamelog
     * @param filename filename of the url
     * @returns the url to the gamelog
     */
    public getURL(filename: string): string {
        // Note: __HOSTNAME__ is expected to be overwritten by clients,
        // as we can't know for certain what hostname they used to connect to us via.
        return `http://__HOSTNAME__:${Config.HTTP_PORT}/gamelog/${filename}`;
    }

    /**
     * Returns a url to the visualizer for said gamelog
     * @param gamelogOrFilename the gamelog to format a visualizer url for
     * @param visualizerURL url to visualizer, if calling statically
     * @returns undefined if no visualizer set, url to the gamelog in visualizer otherwise
     */
    public getVisualizerURL(gamelogOrFilename: any, visualizerURL?: string): string | undefined {
        const vis = Config.VISUALIZER_URL;
        if (vis) {
            const filename = typeof(gamelogOrFilename) === "string"
                ? gamelogOrFilename
                : this.filenameFor(gamelogOrFilename.gameName, gamelogOrFilename.gameSession, gamelogOrFilename.epoch);
            const url = this.getURL(filename);
            return `${vis}?log=${encodeURIComponent(url)}`;
        }
    }

    /**
     * Returns the expected filename for a gamelog
     * @param gameName - name of the game
     * @param gameSession - name of the session
     * @param epoch - when the gamelog was logged
     * @returns the filename for the given game settings
     */
    public filenameFor(gameName: string, gameSession: string, epoch?: number): string;
    public filenameFor(
        /** the with a gameName and gameSession to get for */
        gamelog: IGamelog,
    ): string;

    public filenameFor(gameName: string | IGamelog, gameSession?: string, epoch?: number): string {
        if (utils.isObject(gameName)) {
            gameSession = gameName.gameSession;
            epoch = gameName.epoch;
            gameName = gameName.gameName;
        }

        let moment = "unknown";
        if (epoch) {
            moment = utils.momentString(epoch);
        }

        return sanitizeFilename(this.filenameFormat(gameName, gameSession, moment));
    }

    /** The format we will use to make filenames for gamelogs */
    private readonly filenameFormat: FilenameFormatter = (n, s, m) => `${n}-${s}-${m}`;

    /**
     * checks to see if the filename maps to a gamelog on disk
     * @param filename the base filename (without gamelog extension) you want in LOGS_DIR/gamelogs/
     * @returns a promise of the path to the game log if it exists, undefined otherwise
     */
    private async checkGamelog(filename: string): Promise<string | undefined> {
        const gamelogPath = path.join(this.gamelogDirectory, filename + this.gamelogExtension);

        if (this.filenamesWriting.has(filename)) {
            return undefined; // it is on disk, but not being written yet, so it's not ready
        }

        const stats = await fs.stat(gamelogPath);
        return stats.isFile()
            ? gamelogPath
            : undefined;
    }
}

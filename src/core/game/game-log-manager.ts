import * as fs from "fs-extra";
import { basename, join } from "path";
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

    /** The game session id this gamelog logged */
    session: string;

    /** The name of the game this gamelog is for */
    gameName: string;

    /** The uri to this gamelog on this instance */
    uri: string;

    /** The url to the visualizer that can play this gamelog, if we know the visualizer */
    visualizerUrl?: string;
}

/** Callback type to format the filename for a gamelog */
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
        public readonly gamelogDirectory: string = join(Config.LOGS_DIR, "gamelogs/"),
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
        // TODO: cache this
        const files = await fs.readdir(this.gamelogDirectory);

        const gamelogs: IGamelogInfo[] = [];
        for (const filename of files) {
            if (!this.filenamesWriting.has(filename) && filename.endsWith(this.gamelogExtension)) {
                // then it is a gamelog
                const baseFilename = basename(filename, this.gamelogExtension);
                const split = baseFilename.split("-");

                if (split.length === 3) { // then we can figure out what the game is based on file name
                    const [gameName, session, epochString] = split;
                    const epoch = Number(utils.stringToMoment(epochString));

                    gamelogs.push({
                        epoch,
                        filename,
                        gameName,
                        session,
                        uri: this.getURL(baseFilename, false),
                        visualizerUrl: this.getVisualizerURL(filename),
                    });
                }
            }
        }

        gamelogs.sort((a, b) => a.epoch - b.epoch);

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
     * Returns a url string to the gamelog.
     *
     * @param filename - The filename of the url.
     * @param includeHostname - True if the hostname should be part of the URL,
     * false otherwise for just he uri.
     * @returns The url to the gamelog.
     */
    public getURL(filename: string, includeHostname: boolean = true): string {
        let hostname = "";
        if (includeHostname) {
            // Note: __HOSTNAME__ is expected to be overwritten by clients,
            // as we can't know for certain what hostname they used to connect
            // to us via.
            hostname = `http://__HOSTNAME__:${Config.HTTP_PORT}`;
        }

        filename = basename(filename, this.gamelogExtension);

        return `${hostname}/gamelog/${filename}`;
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

    /**
     * Attempts to get the read stream for the gamelog's filename.
     *
     * @param filename - The filename of the gamelog to get
     * @returns A promise that resolves to the gamelog's read stream if found,
     * otherwise resolves to undefined.
     */
    public async getGamelogFileStream(
        filename: string,
    ): Promise<undefined | fs.ReadStream> {
        const path = await this.checkGamelog(filename);

        if (!path) {
            return;
        }

        return fs.createReadStream(path);
    }

    /** The format we will use to make filenames for gamelogs */
    private readonly filenameFormat: FilenameFormatter = (n, s, m) => `${n}-${s}-${m}`;

    /**
     * checks to see if the filename maps to a gamelog on disk
     * @param filename the base filename (without gamelog extension) you want in LOGS_DIR/gamelogs/
     * @returns a promise of the path to the game log if it exists, undefined otherwise
     */
    private async checkGamelog(filename: string): Promise<string | undefined> {
        const filenameWithExtension = filename.endsWith(this.gamelogExtension)
            ? filename
            : (filename + this.gamelogExtension);

        const gamelogPath = join(this.gamelogDirectory, filenameWithExtension);

        if (this.filenamesWriting.has(filename)) {
            return undefined; // it is on disk, but not being written yet, so it's not ready
        }

        try {
            const stats = await fs.stat(gamelogPath);
            return stats.isFile()
                ? gamelogPath
                : undefined;
        }
        catch (err) {
            // The file doesn't exist, or may have permission issues;
            // either way that doesn't count so this path has nothing for us.
            return;
        }
    }
}

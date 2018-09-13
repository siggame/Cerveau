import * as fs from "fs-extra";
import { basename, join } from "path";
import { createGzip } from "zlib";
import { Config } from "~/core/config";
import * as utils from "~/utils";
import { IGamelog } from "./gamelog-interfaces";
import { filenameFor, GAMELOG_EXTENSION, getURL, getVisualizerURL,
       } from "./gamelog-utils";

/** The default gamelogs directory */
const DEFAULT_LOGS_DIR = join(Config.LOGS_DIR, "gamelogs/");

/** Represents information about an unloaded gamelog */
export interface IGamelogInfo {
    /**
     * The filename of the gamelog this info is about, use it to load the
     * entire gamelog.
     */
    filename: string;

    /** The epoch time the gamelog was written */
    epoch: number;

    /** The game session id this gamelog logged */
    session: string;

    /** The name of the game this gamelog is for */
    gameName: string;

    /** The uri to this gamelog on this instance */
    uri: string;

    /**
     * The url to the visualizer that can play this gamelog, if we know the
     * visualizer.
     */
    visualizerUrl?: string;
}

/**
 * A simple manager that attaches to a directory and manages creating and
 * reading game logs in that directory.
 */
export class GamelogManager {
    // state-full part of the class

    /** Cached info about all the gamelogs sitting on disk. */
    public readonly gamelogInfos: IGamelogInfo[] = [];

    /** The set of filenames we are currently writing to the disk. */
    private filenamesWriting = new Set<string>();

    /**
     * Initializes a single source to manage game logs on this thread.
     *
     * @param gamelogDirectory - An optional override on where to output
     * gamelogs to.
     */
    constructor(
        /** The directory where this will save gamelog files to */
        public readonly gamelogDirectory: string = DEFAULT_LOGS_DIR,
    ) {
        if (!Config.ARENA_MODE) {
            this.initializeGamelogInfos();
        }
    }

    /**
     * Creates a gamelog for the game in the directory set during init.
     *
     * @param gamelog - The gamelog which should be serialize-able to json
     * representation of the gamelog.
     * @returns A promise that resolves to the filename written.
     */
    public log(gamelog: Readonly<IGamelog>): Promise<string> {
        const serialized = JSON.stringify(gamelog);
        const filename = filenameFor(gamelog);

        if (!Config.ARENA_MODE) {
            // cache gamelog info
            this.gamelogInfos.push({
                epoch: gamelog.epoch,
                filename,
                gameName: gamelog.gameName,
                session: gamelog.gameSession,
                uri: getURL(filename),
                visualizerUrl: getVisualizerURL(filename),
            });
        }

        const writeSteam = fs.createWriteStream(
            this.gamelogDirectory + filename + GAMELOG_EXTENSION,
            "utf8",
        );
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
     * Gets the first gamelog matching the filename, without the extension.
     *
     * @param filename - The base filename (without gamelog extension) you want
     * in LOGS_DIR/gamelogs/
     * @returns - A promise to a gamelog matching passed in parameters, or
     * undefined if no gamelog. second arg is error.
     */
    public async getGamelog(filename: string): Promise<Buffer | undefined> {
        const gamelogPath = await this.checkGamelog(filename);
        if (!gamelogPath) {
            // gamelog doesn't exist, so we have nothing to return
            return undefined;
        }

        return utils.gunzipFile(gamelogPath);
    }

    /**
     * Deletes the first gamelog matching the filename, without the extension
     * @param filename the base filename (without gamelog extension) you want
     * in LOGS_DIR/gamelogs.
     * @returns the a boolean if it was successfully deleted
     */
    public async deleteGamelog(filename: string): Promise<boolean> {
        const gamelogPath = await this.checkGamelog(filename);

        if (!gamelogPath) {
            return false;
        }

        const infosIndex = this.gamelogInfos.findIndex(
            (e) => e.filename === filename,
        );
        if (infosIndex !== -1) {
            // Remove that gamelog from our infos.
            this.gamelogInfos.splice(infosIndex, 1);
        }

        // else it does exist, so delete it
        await fs.unlink(gamelogPath);

        return true;
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

    /**
     * Gets ALL the gamelogs in LOGS_DIR/gamelogs.
     * The gamelogs are not complete, but rather a "shallow" gamelog.
     *
     * @returns A promise for the list of gamelogs information.
     */
    private async initializeGamelogInfos(): Promise<void> {
        const files = await fs.readdir(this.gamelogDirectory);

        for (const filename of files) {
            if (!this.filenamesWriting.has(filename) &&
                filename.endsWith(GAMELOG_EXTENSION)
            ) {
                // then it is a gamelog
                const baseFilename = basename(filename, GAMELOG_EXTENSION);
                const split = baseFilename.split("-");

                if (split.length === 3) {
                    // Then we can figure out what the game is based on just
                    // the filename.
                    const [gameName, session, epochString] = split;
                    const epoch = Number(utils.stringToMoment(epochString));

                    this.gamelogInfos.push({
                        epoch,
                        filename,
                        gameName,
                        session,
                        uri: getURL(baseFilename, false),
                        visualizerUrl: getVisualizerURL(filename),
                    });
                }
            }
        }

        this.gamelogInfos.sort((a, b) => a.epoch - b.epoch);
    }

    /**
     * Checks to see if the filename maps to a gamelog on disk.
     *
     * @param filename - The base filename (without gamelog extension) you want
     * in LOGS_DIR/gamelogs/.
     * @returns A promise of the path to the game log if it exists, undefined
     * otherwise.
     */
    private async checkGamelog(filename: string): Promise<string | undefined> {
        const filenameWithExtension = filename.endsWith(GAMELOG_EXTENSION)
            ? filename
            : (filename + GAMELOG_EXTENSION);

        const gamelogPath = join(this.gamelogDirectory, filenameWithExtension);

        if (this.filenamesWriting.has(filename)) {
            // it is on disk, but not being written yet, so it's not ready
            return undefined;
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

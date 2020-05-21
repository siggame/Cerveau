import { createReadStream, readdir, stat } from "fs-extra";
import { join } from "path";
import { createGunzip } from "zlib";

/**
 * Simple function to get director names in a directory.
 *
 * @param sourcePath - Path to check in.
 * @param onlyDirs - Set to true for only directories, false for only files.
 * @returns An Array of strings representing all directory names in a directory
 * (not recursive).
 */
async function getDirsOrFiles(
    sourcePath: string,
    onlyDirs = false,
): Promise<string[]> {
    const read = await Promise.all(
        (await readdir(sourcePath)).map(async (file) => ({
            file,
            stats: await stat(join(sourcePath, file)),
        })),
    );

    const onlyOfType = read.filter(
        ({ stats }) =>
            (onlyDirs && stats.isDirectory()) || (!onlyDirs && stats.isFile()),
    );
    const results = onlyOfType.map(({ file }) => file);

    return results.sort();
}

/**
 * Simple function to get directory names in a directory.
 *
 * @param sourcePath - The path to check in.
 * @returns An array of strings representing all directory names in a directory
 * (not recursive).
 */
export async function getDirs(sourcePath: string): Promise<string[]> {
    return getDirsOrFiles(sourcePath, true);
}

/**
 * Simple function to get file names in a directory.
 *
 * @param sourcePath - The path to check in.
 * @returns An array of strings representing all directory names in a directory
 * (not recursive).
 */
export async function getFiles(sourcePath: string): Promise<string[]> {
    return getDirsOrFiles(sourcePath, false);
}

/**
 * Gunzip a file and return the buffer asynchronously.
 *
 * @param filePath - The path to the file to gunzip.
 * @returns A buffer of the file, now gunzipped.
 */
export function gunzipFile(filePath: string): Promise<Buffer> {
    const buffers: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) =>
        createReadStream(filePath)
            .on("error", reject)
            .pipe(createGunzip()) // Un-Gzip
            .on("data", (buffer: Buffer) => {
                buffers.push(buffer); // will be a Buffer
            })
            .on("end", () => {
                resolve(Buffer.concat(buffers));
            }),
    );
}

/**
 * Removes everything after the period in a string.
 *
 * @param str - The string to remove the extensions from.
 * @returns The same string lacking any extension(s).
 */
export function removeExtension(str: string): string {
    const dotIndex = str.indexOf(".");
    if (dotIndex > -1) {
        return str.slice(0, dotIndex);
    }

    return str;
}

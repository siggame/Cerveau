import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as zlib from "zlib";

/**
 * Simple function to get director names in a directory.
 *
 * @param sourcePath - Path to check in.
 * @param onlyDirs Set to true for only directories, false for only files.
 * @returns An Array of strings representing all directory names in a directory
 * (not recursive).
 */
async function getDirsOrFiles(
    sourcePath: string,
    onlyDirs: boolean = false,
): Promise<string[]> {
    const files = await promisify(fs.readdir)(sourcePath);
    const results: string[] = [];

    for (const file of files) {
        const stats = await promisify(fs.stat)(path.join(sourcePath, file));
        if ((onlyDirs && stats.isDirectory()) ||
            (!onlyDirs && stats.isFile())) {
            results.push(file);
        }
    }

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
 * @param filePath - the path to the file to gunzip.
 * @returns A buffer of the file, now gunzipped.
 */
export function gunzipFile(filePath: string): Promise<Buffer> {
    const buffers: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
        fs.createReadStream(filePath)
            .on("error", reject)
            .pipe(zlib.createGunzip()) // Un-Gzip
            .on("data", (buffer) => {
                buffers.push(buffer as Buffer); // will be a buffer, not string
            })
            .on("end", () => {
                resolve(Buffer.concat(buffers));
            });
    });
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
        str = str.slice(0, dotIndex);
    }

    return str;
}

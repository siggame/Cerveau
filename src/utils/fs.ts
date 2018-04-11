import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as zlib from "zlib";

/**
 * simple function to get director names in a directory.
 * @param sourcePath - path to check in
 * @param onlyDirs set to true for only directories, false for only files
 * @returns array of strings representing all directory names in a directory (not recursive).
 */
async function getDirsOrFiles(sourcePath: string, onlyDirs: boolean = false): Promise<string[]> {
    const files = await promisify(fs.readdir)(sourcePath);
    const results: string[] = [];

    for (const file of files) {
        const stats = await promisify(fs.stat)(path.join(sourcePath, file));
        if ((onlyDirs && stats.isDirectory()) || (!onlyDirs && stats.isFile())) {
            results.push(file);
        }
    }

    return results.sort();
}

/**
 * simple function to get directory names in a directory.
 * @param sourcePath the path to check in
 * @returns array of strings representing all directory names in a directory (not recursive).
 */
export async function getDirs(sourcePath: string): Promise<string[]> {
    return await getDirsOrFiles(sourcePath, true);
}

/**
 * simple function to get file names in a directory.
 * @param sourcePath the path to check in
 * @returns array of strings representing all directory names in a directory (not recursive).
 */
export async function getFiles(sourcePath: string): Promise<string[]> {
    return await getDirsOrFiles(sourcePath, false);
}

/**
 * gunzip a file and return the buffer asynchronously
 * @param filePath the path to the file to gunzip
 * @returns a buffer of the file, now gunzipped
 */
export function gunzipFile(filePath: string): Promise<Buffer> {
    const buffers: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
        fs.createReadStream(filePath)
            .on("error", reject)
            .pipe(zlib.createGunzip()) // Un-Gzip
            .on("data", (buffer) => {
                buffers.push(buffer as Buffer); // gzip will be buffer, not string
            })
            .on("end", () => {
                resolve(Buffer.concat(buffers));
            });
    });
}

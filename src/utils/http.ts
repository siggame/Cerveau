import { get, globalAgent } from "https";
import { URL } from "url";

/**
 * A simple async http request handler/
 *
 * @param url - The URL to request data from via GET.
 * @returns A promise that resolves to the data found at that URL, or rejects
 * with an Error if the request fails.
 */
export function httpRequest(url: string): Promise<string> {
    let data = "";
    const asURL = new URL(url);
    return new Promise((resolve, reject) => {
        get({
            hostname: asURL.hostname,
            path: asURL.pathname,
            agent: globalAgent,
            headers: {
                "User-Agent": "Node.js",
            },
        }, (response) => {
            // A chunk of data has been recieved.
            response.on("data", (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            response.on("end", () => {
                resolve(data);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

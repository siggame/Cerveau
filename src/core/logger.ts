import { join } from "path";
import * as winston from "winston";
import { Config } from "~/core/config";
import { momentString } from "~/utils";

/**
 * A transport instance in Winston.
 *
 * Not sure why they don't expose a base interface for these...
 */
type TransportInstance =
    winston.transports.ConsoleTransportInstance |
    winston.transports.FileTransportInstance |
    winston.transports.HttpTransportInstance |
    winston.transports.StreamTransportInstance;

const alignedWithColorsAndTime = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.align(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;

        const ts = String(timestamp).slice(0, 19).replace("T", " ");

        return `${ts} [${level}]: ${message} ${Object.keys(args).length
            ? JSON.stringify(args, null, 2)
            : ""
        }`;
    }),
);

const transports: TransportInstance[] = [
    new winston.transports.Console({
        // colorize the output to the console
        format: alignedWithColorsAndTime,
        silent: Config.SILENT,
    }),
];

if (Config.LOG_TO_FILES) {
    transports.push(
        new winston.transports.File({
            dirname: join(Config.LOGS_DIR, "console"),
            filename: `${momentString()}.log`,
        }),
    );
}

/** The winston logger instance to use. */
export const logger = winston.createLogger({
    level: "debug",
    transports,
});

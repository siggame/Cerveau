import { createLogger, format, transports } from "winston";
import { Config } from "~/core/config";

const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.align(),
    format.printf((info) => {
        const { timestamp, level, message, ...args } = info;

        const ts = String(timestamp).slice(0, 19).replace("T", " ");

        return `${ts} [${level}]: ${message} ${Object.keys(args).length
            ? JSON.stringify(args, null, 2)
            : ""
        }`;
    }),
);

/** The winston logger instance to use. */
export const logger = createLogger({
    level: "debug",
    transports: [
        new transports.Console({
            // colorize the output to the console
            format: alignedWithColorsAndTime,
            silent: Config.SILENT,
        }),
    ],
});

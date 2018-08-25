import { createLogger, format, transports } from "winston";

const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.align(),
    format.printf((info) => {
        const { timestamp, level, message, ...args } = info;

        const ts = timestamp.slice(0, 19).replace("T", " ");

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
    // colorize the output to the console
        new transports.Console({
            format: alignedWithColorsAndTime,
        }),
    ],
});

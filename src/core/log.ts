import * as winston from "winston";

const format = (winston as any).format;

const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.align(),
    format.printf((info: any) => {
        const { timestamp, level, message, ...args } = info;

        const ts = timestamp.slice(0, 19).replace("T", " ");

        return `${ts} [${level}]: ${message} ${Object.keys(args).length
            ? JSON.stringify(args, null, 2)
            : ""
        }`;
    }),
);

winston.configure({
    level: "debug",
    transports: [
    // colorize the output to the console
        new winston.transports.Console({
            format: alignedWithColorsAndTime,
        }),
    ],
});

// TODO: when Winston's types are updated use createLogger instead
export const logger = winston;

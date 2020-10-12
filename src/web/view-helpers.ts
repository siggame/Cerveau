import * as moment from "moment";

/**
 * Formats a variety of dates using moment in views.
 *
 * @param date - The date to format.
 * @param format - The moment format string.
 * @returns The date now formatted via moment in the format.
 */
export function formatDate(
    date: Date | string | number | moment.Moment,
    format: string,
): string {
    return moment(date).format(format);
}

/**
 * Exec passthrough for handlebars... Scary.
 *
 * @param args - The arguments to be evaluated, spaces are auto inserted in between in arg.
 * @returns Whatever resolves from this sketch code.
 */
export function exec(...args: unknown[]): unknown {
    args.pop(); // last element is Handlebars stuff we don't care about

    if (args.length === 0) {
        return undefined;
    }

    return global.eval(args.join(" ")) as unknown;
}

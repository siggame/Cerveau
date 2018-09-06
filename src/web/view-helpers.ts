import * as moment from "moment";

/**
 * Formats a variety of dates using moment in views.
 *
 * @param date - The date to format.
 * @param format - The moment format string.
 * @returns The date now formatted via moment in the format.
 */
export function formatDate(date: Date | string | number | moment.Moment, format: string): string {
    return moment(date).format(format);
}

import * as moment from "moment";

export function formatDate(date: Date | string | number | moment.Moment, format: string): string {
    return moment(date).format(format);
}

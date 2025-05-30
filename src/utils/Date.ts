import { Moment } from "moment";

export const MAX_DATE_MS = 8_640_000_000_000_000;

export const calendarTime = (value: Moment) =>
  value?.calendar(null, {
    lastDay: "[Yesterday]",
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    lastWeek: "[Last] dddd",
    nextWeek: "dddd",
    sameElse: "ddd, MMM D, YYYY",
  });

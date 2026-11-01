import dayjs from "dayjs";

export type Period = "week" | "month" | "year";

const PERIOD_CONFIG: Record<
  Period,
  {
    start: (now: dayjs.Dayjs) => dayjs.Dayjs;
    bucketUnit: "day" | "month";
  }
> = {
  week: {
    start: (now) => now.startOf("day").subtract(6, "day"),
    bucketUnit: "day",
  },
  month: {
    start: (now) => now.startOf("day").subtract(29, "day"),
    bucketUnit: "day",
  },
  year: {
    start: (now) => now.startOf("month").subtract(11, "month"),
    bucketUnit: "month",
  },
};

/**
 * Rolling period ending with today (e.g. the year view covers the last 12
 * months) instead of the current calendar week/month/year.
 */
export const getPeriodRange = (period: Period, now = dayjs()) => ({
  start: PERIOD_CONFIG[period].start(now).valueOf(),
  end: now.endOf("day").valueOf(),
  bucketUnit: PERIOD_CONFIG[period].bucketUnit,
});

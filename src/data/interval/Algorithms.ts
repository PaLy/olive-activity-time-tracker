import { join, overlaps } from "./SimpleClosedInterval";
import humanizeDuration from "humanize-duration";
import { ClosedInterval } from "./ClosedInterval";
import { Interval, toSimpleClosedInterval } from "./Interval";
import { chain, orderBy } from "lodash";
import { Activity } from "../activity/Storage";
import { getDescendants } from "../activity/Algorithms";
import { MAX_DATE_MS } from "../../utils/Date";

export const getIntervalsDuration = (
  intervals: Interval[],
  filter: ClosedInterval,
) => {
  let durationMs = 0;
  let curFilter = { start: filter.start.value, end: filter.end.value };

  const simpleIntervals = intervals.map(toSimpleClosedInterval);

  join(simpleIntervals).forEach((interval) => {
    const { start, end } = interval;
    if (overlaps(curFilter, interval)) {
      if (curFilter.start < start) {
        curFilter.start = Math.min(start, curFilter.end);
      }
      if (curFilter.end <= end) {
        durationMs += curFilter.end - curFilter.start;
        curFilter.start = curFilter.end;
      } else {
        durationMs += end - curFilter.start;
        curFilter.start = end;
      }
    }
  });

  return durationMs;
};

export const getLastEndTime = (
  intervals: Interval[],
  filter: ClosedInterval,
): number | undefined => {
  return chain(intervals)
    .map(toSimpleClosedInterval)
    .filter((interval) =>
      overlaps(interval, { start: filter.start.value, end: filter.end.value }),
    )
    .map((interval) => interval.end)
    .max()
    .value();
};

export const humanize = (
  duration: number,
  inProgress: boolean,
  full?: boolean,
) => {
  return humanizeDuration(duration, {
    delimiter: " ",
    largest: inProgress || full ? Infinity : 2,
    round: true,
    units:
      inProgress || full || duration < 59.5 * 1000
        ? ["y", "mo", "w", "d", "h", "m", "s"]
        : ["y", "mo", "w", "d", "h", "m"],
  });
};

export const intervalsGroupedByDay = (
  activity: Activity,
  activities: Map<string, Activity>,
) =>
  chain([activity, ...getDescendants(activity, activities)])
    .flatMap((activity) =>
      activity.intervals.map((interval) => ({
        activity,
        interval,
      })),
    )
    .groupBy(({ interval }) => interval.start.clone().startOf("day").valueOf())
    .toPairs()
    .orderBy(([key]) => key, "desc")
    .fromPairs()
    .mapValues((group) =>
      orderBy(
        group,
        [
          ({ interval }) => interval.start.valueOf(),
          ({ interval }) => interval.end?.valueOf() ?? MAX_DATE_MS,
        ],
        ["desc", "desc"],
      ),
    )
    .value();

export type IntervalWithActivity = {
  activity: Activity;
  interval: Interval;
};

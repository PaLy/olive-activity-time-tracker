import { join, overlaps } from "./SimpleClosedInterval";
import { intervals } from "./Signals";
import humanizeDuration from "humanize-duration";
import { ClosedInterval } from "./ClosedInterval";
import { Interval, toSimpleClosedInterval } from "./Interval";
import { chain } from "lodash";
import { Activity } from "../activity/Storage";
import { getDescendants } from "../activity/Algorithms";

export const getIntervalsDuration = (
  intervalIds: string[],
  filter: ClosedInterval,
) => {
  let durationMs = 0;
  let curFilter = { start: filter.start.value, end: filter.end.value };

  const simpleIntervals = intervalIds
    .map((id) => intervals.value.get(id)!)
    .map(toSimpleClosedInterval);

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

export const humanize = (duration: number, inProgress: boolean) =>
  humanizeDuration(duration, {
    delimiter: " ",
    largest: inProgress ? Infinity : 2,
    round: true,
    units: inProgress
      ? ["y", "mo", "w", "d", "h", "m", "s"]
      : ["y", "mo", "w", "d", "h", "m"],
  });

export const intervalsGroupedByDay = (activity: Activity) =>
  chain([activity, ...getDescendants(activity)])
    .flatMap((activity) =>
      activity.intervalIDs.value.map((id) => ({
        activity,
        interval: intervals.value.get(id)!,
      })),
    )
    .groupBy(({ interval }) =>
      interval.start.value.clone().startOf("day").valueOf(),
    )
    .toPairs()
    .sortBy(([key]) => key)
    .fromPairs()
    .mapValues((group) => group.toSorted(byStartAndEnd))
    .value();

export type IntervalWithActivity = { activity: Activity; interval: Interval };

const byStartAndEnd = (a: IntervalWithActivity, b: IntervalWithActivity) => {
  const aStart = a.interval.start.value;
  const aEnd = a.interval.end.value;
  const bStart = b.interval.start.value;
  const bEnd = b.interval.end.value;

  if (aStart < bStart) {
    return -1;
  } else if (aStart > bStart) {
    return 1;
  } else if (aEnd && bEnd) {
    if (aEnd < bEnd) {
      return -1;
    } else if (aEnd > bEnd) {
      return 1;
    } else {
      return 0;
    }
  } else if (aEnd) {
    return -1;
  } else if (bEnd) {
    return 1;
  } else {
    return 0;
  }
};

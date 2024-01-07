import { join, overlaps } from "./SimpleClosedInterval";
import { intervals } from "./Signals";
import humanizeDuration from "humanize-duration";
import { ClosedInterval } from "./ClosedInterval";
import { Interval, toSimpleClosedInterval } from "./Interval";
import { chain, orderBy } from "lodash";
import { Activity } from "../activity/Storage";
import { getDescendants } from "../activity/Algorithms";
import { MAX_DATE_MS } from "../../utils/Date";
import { Signal } from "@preact/signals-react";

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

export const humanize = (
  duration: number,
  inProgress: boolean,
  full?: boolean,
) =>
  humanizeDuration(duration, {
    delimiter: " ",
    largest: inProgress || full ? Infinity : 2,
    round: true,
    units:
      inProgress || full || duration < 59.5 * 1000
        ? ["y", "mo", "w", "d", "h", "m", "s"]
        : ["y", "mo", "w", "d", "h", "m"],
  });

export const intervalsGroupedByDay = (activity: Signal<Activity>) =>
  chain([activity, ...getDescendants(activity)])
    .flatMap((activity) =>
      activity.value.intervalIDs.value.map((id) => ({
        activity,
        interval: intervals.value.get(id)!,
      })),
    )
    .groupBy(({ interval }) =>
      interval.value.start.value.clone().startOf("day").valueOf(),
    )
    .toPairs()
    .orderBy(([key]) => key, "desc")
    .fromPairs()
    .mapValues((group) =>
      orderBy(
        group,
        [
          ({ interval }) => interval.value.start.value.valueOf(),
          ({ interval }) => interval.value.end.value?.valueOf() ?? MAX_DATE_MS,
        ],
        ["desc", "desc"],
      ),
    )
    .value();

export type IntervalWithActivity = {
  activity: Signal<Activity>;
  interval: Signal<Interval>;
};

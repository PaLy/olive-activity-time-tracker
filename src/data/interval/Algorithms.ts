import { join, overlaps } from "./SimpleClosedInterval";
import { intervals } from "./Signals";
import humanizeDuration from "humanize-duration";
import { ClosedInterval } from "./ClosedInterval";
import { toSimpleClosedInterval } from "./Interval";

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

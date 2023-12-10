import { Signal } from "@preact/signals-react";
import {
  overlaps as simpleOverlaps,
  SimpleClosedInterval,
} from "./SimpleClosedInterval";
import {
  Interval,
  toSimpleClosedInterval as intervalToSimpleClosed,
} from "./Interval";

export type ClosedInterval = {
  start: Signal<number>;
  end: Signal<number>;
};

export const overlaps = (interval1: ClosedInterval, interval2: Interval) =>
  simpleOverlaps(
    toSimpleClosedInterval(interval1),
    intervalToSimpleClosed(interval2),
  );

const toSimpleClosedInterval = (
  interval: ClosedInterval,
): SimpleClosedInterval => ({
  start: interval.start.value,
  end: interval.end.value,
});

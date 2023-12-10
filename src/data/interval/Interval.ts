import { Signal } from "@preact/signals-react";
import { Moment } from "moment/moment";
import { SimpleClosedInterval } from "./SimpleClosedInterval";
import { durationRefreshTime } from "./Signals";

export type Interval = {
  id: string;
  start: Signal<Moment>;
  end: Signal<Moment | null>;
};

export const toSimpleClosedInterval = (
  interval: Interval,
): SimpleClosedInterval => {
  const start = interval.start.value.valueOf();
  const end =
    interval.end.value?.valueOf() ?? durationRefreshTime.value.valueOf();
  return { start, end };
};

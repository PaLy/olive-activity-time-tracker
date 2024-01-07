import { Signal } from "@preact/signals-react";
import { Moment } from "moment/moment";
import { SimpleClosedInterval } from "./SimpleClosedInterval";
import { durationRefreshTime } from "./Signals";
import moment from "moment/moment";

export type Interval = {
  id: string;
  start: Signal<Moment>;
  end: Signal<Moment | null>;
};

export const toSimpleClosedInterval = (
  interval: Signal<Interval>,
): SimpleClosedInterval => {
  const { start, end } = interval.value;
  const endValue =
    end.value ?? moment.max(durationRefreshTime.value, start.value);
  return { start: start.value.valueOf(), end: endValue.valueOf() };
};

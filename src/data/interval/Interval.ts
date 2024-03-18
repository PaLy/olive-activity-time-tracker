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
  interval: Signal<Omit<Interval, "id">>,
): SimpleClosedInterval => {
  const { start, end } = interval.value;

  const endValue = moment.min(
    end.value ?? durationRefreshTime.value,
    durationRefreshTime.value,
  );
  const startValue = moment.min(start.value, endValue);

  return { start: startValue.valueOf(), end: endValue.valueOf() };
};

import { Signal } from "@preact/signals-react";
import { Moment } from "moment/moment";
import { SimpleClosedInterval } from "./SimpleClosedInterval";
import { durationRefreshTime } from "./Signals";
import moment from "moment/moment";

export type Interval = {
  id: string;
  start: Moment;
  end?: Moment;
};

export const toSimpleClosedInterval = (
  interval: Signal<Omit<Interval, "id">>,
): SimpleClosedInterval => {
  const { start, end } = interval.value;

  const endValue = moment.min(
    end ?? durationRefreshTime.value,
    durationRefreshTime.value,
  );
  const startValue = moment.min(start, endValue);

  return { start: startValue.valueOf(), end: endValue.valueOf() };
};

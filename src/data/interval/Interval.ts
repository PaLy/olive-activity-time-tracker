import moment, { Moment } from "moment/moment";
import { SimpleClosedInterval } from "./SimpleClosedInterval";
import { durationRefreshTime } from "./Signals";

export type Interval = {
  id: string;
  start: Moment;
  end?: Moment;
};

export const toSimpleClosedInterval = (
  interval: Omit<Interval, "id">,
): SimpleClosedInterval => {
  const { start, end } = interval;

  const endValue = moment.min(
    end ?? durationRefreshTime.value,
    durationRefreshTime.value,
  );
  const startValue = moment.min(start, endValue);

  return { start: startValue.valueOf(), end: endValue.valueOf() };
};

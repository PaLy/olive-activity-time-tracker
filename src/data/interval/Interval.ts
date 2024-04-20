import moment, { Moment } from "moment/moment";
import { SimpleClosedInterval } from "./SimpleClosedInterval";

export type Interval = {
  id: string;
  start: Moment;
  end?: Moment;
};

export const toSimpleClosedInterval = (
  interval: Omit<Interval, "id">,
  time: Moment,
): SimpleClosedInterval => {
  const { start, end } = interval;

  const endValue = moment.min(end ?? time, time);
  const startValue = moment.min(start, endValue);

  return { start: startValue.valueOf(), end: endValue.valueOf() };
};

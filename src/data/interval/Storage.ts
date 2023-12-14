import { signal } from "@preact/signals-react";
import moment from "moment";
import { Interval } from "./Interval";
import { SignalStore } from "../SignalStore";

class IntervalStore extends SignalStore<StoredInterval, Interval> {
  constructor() {
    super({ name: "interval" });
  }

  asValue = (interval: StoredInterval): Interval => {
    return {
      id: interval.id,
      start: signal(moment(interval.start)),
      end: signal(interval.end === null ? null : moment(interval.end)),
    };
  };

  asStoredValue = (interval: Interval): StoredInterval => {
    return {
      id: interval.id,
      start: interval.start.value.valueOf(),
      end: interval.end.value?.valueOf() ?? null,
    };
  };

  override asExportedValue = (interval: StoredInterval): StoredInterval => {
    const { id, start, end } = interval;
    return {
      id,
      start,
      end: end ?? moment().valueOf(),
    };
  };
}

export const intervalStore = new IntervalStore();

type StoredInterval = {
  id: string;
  start: number;
  end: number | null;
};

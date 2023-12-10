import { signal } from "@preact/signals-react";
import moment from "moment";
import { SignalStore } from "../Storage";
import { Interval } from "./Interval";

export const store = new SignalStore({
  name: "interval",
  asStoredValue,
  asValue,
});

type StoredInterval = {
  id: string;
  start: number;
  end: number | null;
};

function asValue(interval: StoredInterval): Interval {
  return {
    id: interval.id,
    start: signal(moment(interval.start)),
    end: signal(interval.end === null ? null : moment(interval.end)),
  };
}

function asStoredValue(interval: Interval): StoredInterval {
  return {
    id: interval.id,
    start: interval.start.value.valueOf(),
    end: interval.end.value?.valueOf() ?? null,
  };
}

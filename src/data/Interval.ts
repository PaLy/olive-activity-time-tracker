import { computed, signal, Signal } from "@preact/signals-react";
import moment, { Moment } from "moment/moment";
import { SignalStore } from "./Storage";

export const createStore = () => {};

export type Interval = {
  id: string;
  start: Signal<Moment>;
  end: Signal<Moment | null>;
};

export type ClosedInterval = {
  start: Signal<number>;
  end: Signal<number>;
};

export type StoredInterval = {
  id: string;
  start: number;
  end: number | null;
};

const asValue = (interval: StoredInterval): Interval => ({
  id: interval.id,
  start: signal(moment(interval.start)),
  end: signal(interval.end === null ? null : moment(interval.end)),
});

const asStoredValue = (interval: Interval): StoredInterval => ({
  id: interval.id,
  start: interval.start.value.valueOf(),
  end: interval.end.value?.valueOf() ?? null,
});

const store = new SignalStore({ name: "interval", asStoredValue, asValue });
export const intervals = computed(() => store.collection.value);

export const addInterval = (interval: Interval) =>
  store.set(interval.id, interval);

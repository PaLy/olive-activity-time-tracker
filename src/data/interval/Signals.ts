import {
  computed,
  effect,
  Signal,
  signal,
  useComputed,
} from "@preact/signals-react";
import { intervalStore } from "./Storage";
import moment from "moment/moment";

import { humanize, intervalsGroupedByDay } from "./Algorithms";
import { Interval, toSimpleClosedInterval } from "./Interval";
import { Activity } from "../activity/Storage";

export const intervals = computed(() => intervalStore.collection.value);

export const durationRefreshTime = signal(moment());
export const durationRefreshDisabled = signal(false);

let durationRefreshInterval: number | undefined;
const updateDurationRefreshTime = () => (durationRefreshTime.value = moment());

const clearDurationRefreshInterval = () => {
  clearInterval(durationRefreshInterval);
  durationRefreshInterval = undefined;
};

effect(() => {
  if (!durationRefreshDisabled.value) {
    updateDurationRefreshTime();
    durationRefreshInterval = window.setInterval(
      updateDurationRefreshTime,
      1000,
    );
    return clearDurationRefreshInterval;
  } else {
    clearDurationRefreshInterval();
  }
});

export const useHumanizedDuration = (
  duration: Signal<number>,
  inProgress: Signal<boolean>,
) => useComputed(() => humanize(duration.value, inProgress.value));

export const useIntervalDuration = (
  interval: Signal<Omit<Interval, "id">>,
  full: Signal<boolean>,
) =>
  useComputed(() => {
    const inProgress = !interval.value.end;
    const { start, end } = toSimpleClosedInterval(interval);
    const duration = end - start;
    return humanize(duration, inProgress, full.value);
  });

export const useIntervalsGroupedByDay = (activity: Signal<Activity>) =>
  useComputed(() => intervalsGroupedByDay(activity));

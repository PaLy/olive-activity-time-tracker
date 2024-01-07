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
import { Interval } from "./Interval";
import { Activity } from "../activity/Storage";

export const intervals = computed(() => intervalStore.collection.value);

export const durationRefreshTime = signal(moment());

effect(() => {
  const interval = window.setInterval(
    () => (durationRefreshTime.value = moment()),
    1000,
  );
  return () => clearInterval(interval);
});

export const useHumanizedDuration = (
  duration: Signal<number>,
  inProgress: Signal<boolean>,
) => useComputed(() => humanize(duration.value, inProgress.value));

export const useIntervalDuration = (
  interval: Signal<Omit<Interval, "id">>,
  full?: boolean,
) =>
  useComputed(() => {
    const { start, end } = interval.value;
    const inProgress = end.value === null;
    const duration = (
      end.value ?? moment.max(durationRefreshTime.value, start.value)
    ).diff(start.value);
    return humanize(duration, inProgress, full);
  });

export const useIntervalsGroupedByDay = (activity: Signal<Activity>) =>
  useComputed(() => intervalsGroupedByDay(activity));

import {
  computed,
  effect,
  Signal,
  signal,
  useComputed,
} from "@preact/signals-react";
import { intervalStore } from "./Storage";
import moment from "moment/moment";

import { humanize } from "./Algorithms";

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

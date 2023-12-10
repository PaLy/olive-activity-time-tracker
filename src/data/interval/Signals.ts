import {
  computed,
  effect,
  Signal,
  signal,
  useComputed,
} from "@preact/signals-react";
import { store } from "./Storage";
import moment from "moment/moment";

import { humanize } from "./Algorithms";

export const intervals = computed(() => store.collection.value);

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

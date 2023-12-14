import { intervalStore } from "./Storage";
import { Interval } from "./Interval";

export const addInterval = (interval: Interval) =>
  intervalStore.set(interval.id, interval);

import { store } from "./Storage";
import { Interval } from "./Interval";

export const addInterval = (interval: Interval) =>
  store.set(interval.id, interval);

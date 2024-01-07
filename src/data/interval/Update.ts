import { intervalStore } from "./Storage";
import { Interval } from "./Interval";
import { batch, Signal } from "@preact/signals-react";

export const addInterval = (interval: Interval) =>
  intervalStore.set(interval.id, interval);

type Edit = Pick<Interval, "start" | "end">;

export const editInterval = (
  interval: Signal<Interval>,
  edit: Signal<Edit>,
) => {
  batch(() => {
    interval.value.start.value = edit.value.start.value;
    interval.value.end.value = edit.value.end.value;
  });
};

export const deleteInterval = (interval: Signal<Interval>) =>
  intervalStore.remove(interval.value.id);

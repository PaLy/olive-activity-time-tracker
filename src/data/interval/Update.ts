import { intervalStore } from "./Storage";
import { Interval } from "./Interval";
import { batch } from "@preact/signals-react";

export const addInterval = (interval: Interval) =>
  intervalStore.set(interval.id, interval);

type Edit = Pick<Interval, "start" | "end">;

export const editInterval = (interval: Interval, edit: Edit) => {
  batch(() => {
    interval.start.value = edit.start.value;
    interval.end.value = edit.end.value;
  });
};

export const deleteInterval = (interval: Interval) =>
  intervalStore.remove(interval.id);

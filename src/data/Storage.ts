import { batch, effect, signal } from "@preact/signals-react";
import { activityStore } from "./activity/Storage";
import { intervalStore } from "./interval/Storage";

const stores = [intervalStore, activityStore];

export const dbLoading = signal<"not-started" | "in-progress" | "finished">(
  "not-started",
);
effect(() => {
  if (dbLoading.value === "not-started") loadDB();
});

function loadDB() {
  dbLoading.value = "in-progress";
  return Promise.all(stores.map((store) => store.load())).then(
    (updateStoreSignals) => {
      batch(() => {
        updateStoreSignals.forEach((update) => update());
        dbLoading.value = "finished";
      });
    },
  );
}

export function clearDB() {
  return Promise.all(stores.map((store) => store.clear())).then(
    (updateStoreSignals) => {
      batch(() => {
        updateStoreSignals.forEach((update) => update());
      });
    },
  );
}

export async function exportDB() {
  return { stores: await Promise.all(stores.map((store) => store.export())) };
}

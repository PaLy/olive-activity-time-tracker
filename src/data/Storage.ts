import { batch, effect, signal } from "@preact/signals-react";
import { activityStore } from "./activity/Storage";
import { intervalStore } from "./interval/Storage";
import { Validator } from "jsonschema";

const stores = [intervalStore, activityStore];

export const dbLoading = signal<"not-started" | "in-progress" | "finished">(
  "not-started",
);
effect(() => {
  switch (dbLoading.value) {
    case "not-started":
      loadDB();
      break;
    case "finished":
      dbLoadListeners.forEach((listener) => listener());
      dbLoadListeners.length = 0;
      break;
  }
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

const dbLoadListeners: (() => void)[] = [];

export async function afterDBLoaded<T>(callback: () => Promise<T>) {
  if (dbLoading.value !== "finished") {
    await new Promise((resolve) => dbLoadListeners.push(() => resolve(void 0)));
  }
  return callback();
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

const jsonSchema = {
  type: "object",
  properties: {
    stores: {
      type: "array",
      prefixItems: stores.map((store) => store.jsonSchema()),
    },
  },
};

export async function importDB(jsonFile: File) {
  const json = await parseJSON(jsonFile);
  if (json) {
    const validator = new Validator();
    const { instance, errors, valid } = validator.validate(json, jsonSchema);
    if (valid) {
      await clearDB();
      await Promise.all(
        stores.map((store, i) => store.import(instance.stores[i].data)),
      ).then((updateStoreSignals) => {
        batch(() => {
          updateStoreSignals.forEach((update) => update());
        });
      });
      return { valid: true };
    } else {
      return { errors, valid };
    }
  } else {
    return { valid: false };
  }
}

async function parseJSON(jsonFile: File) {
  const text = await jsonFile.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

import { batch, effect, signal } from "@preact/signals-react";
import {
  activityStore,
  STORE_NAME_ACTIVITIES,
  StoredActivity,
} from "./activity/Storage";
import {
  ExportedInterval,
  intervalStore,
  STORE_NAME_INTERVALS,
} from "./interval/Storage";
import {
  ActivityInListExpanded,
  clearActivityInListExpanded,
  exportActivityInListExpanded,
  importActivityInListExpanded,
  jsonSchemaActivityInListExpanded,
  STORE_NAME_ACTIVITY_IN_LIST_EXPANDED,
} from "./activity/ActivityInListExpanded";
import {
  clearSettings,
  exportSettings,
  importSettings,
  jsonSchemaSettings,
  Settings,
  STORE_NAME_SETTINGS,
} from "./settings/Settings";
import Ajv, { JTDSchemaType } from "ajv/dist/jtd";

const stores = [intervalStore, activityStore] as const;

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
  await waitForDBLoaded();
  return callback();
}

export async function waitForDBLoaded() {
  if (dbLoading.value !== "finished") {
    await new Promise((resolve) => dbLoadListeners.push(() => resolve(void 0)));
  }
}

export async function clearDB() {
  await clearActivityInListExpanded();
  await clearSettings();
  await Promise.all(stores.map((store) => store.clear())).then(
    (updateStoreSignals) => {
      batch(() => {
        updateStoreSignals.forEach((update) => update());
      });
    },
  );
}

export async function exportDB() {
  const data = {
    [STORE_NAME_ACTIVITIES]: await activityStore.export(),
    [STORE_NAME_INTERVALS]: await intervalStore.export(),
    [STORE_NAME_ACTIVITY_IN_LIST_EXPANDED]:
      await exportActivityInListExpanded(),
    [STORE_NAME_SETTINGS]: await exportSettings(),
  };
  return JSON.stringify(data, null, 2);
}

type DBData = {
  [STORE_NAME_ACTIVITIES]: StoredActivity[];
  [STORE_NAME_INTERVALS]: ExportedInterval[];
  [STORE_NAME_ACTIVITY_IN_LIST_EXPANDED]: ActivityInListExpanded;
  [STORE_NAME_SETTINGS]: Settings;
};

const jsonSchema: JTDSchemaType<DBData> = {
  properties: {
    [STORE_NAME_ACTIVITIES]: activityStore.valueJsonSchema,
    [STORE_NAME_INTERVALS]: intervalStore.valueJsonSchema,
    [STORE_NAME_ACTIVITY_IN_LIST_EXPANDED]: jsonSchemaActivityInListExpanded(),
    [STORE_NAME_SETTINGS]: jsonSchemaSettings(),
  },
};

export async function importDB(json: string) {
  const ajv = new Ajv({ verbose: process.env.NODE_ENV !== "production" });
  const parse = ajv.compileParser(jsonSchema);
  const dbData = parse(json);
  if (dbData) {
    await clearDB();
    await importActivityInListExpanded(
      dbData[STORE_NAME_ACTIVITY_IN_LIST_EXPANDED],
    );
    await importSettings(dbData[STORE_NAME_SETTINGS]);
    await Promise.all([
      activityStore.import(dbData[STORE_NAME_ACTIVITIES]),
      intervalStore.import(dbData[STORE_NAME_INTERVALS]),
    ]).then((updateStoreSignals) => {
      batch(() => {
        updateStoreSignals.forEach((update) => update());
      });
    });
    return { valid: true };
  } else {
    return { errors: `${parse.message}::${parse.position}`, valid: false };
  }
}

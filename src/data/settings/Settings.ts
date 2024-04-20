import localforage from "localforage";
import { JTDSchemaType } from "ajv/dist/jtd";
import { cloneDeep } from "lodash";

export const STORE_NAME_SETTINGS = "settings";

enum Keys {
  activityList = "activityList",
}

export const settingsStore = localforage.createInstance({
  name: STORE_NAME_SETTINGS,
});

export const getActivityList = () =>
  settingsStore
    .getItem<ActivityList>(Keys.activityList)
    .then((activityList) => activityList ?? DEFAULT_SETTINGS.activityList);

export const setActivityList = (activityList: ActivityList) =>
  settingsStore.setItem<ActivityList>(Keys.activityList, activityList);

export type Settings = {
  activityList: ActivityList;
};

export type ActivityList = {
  showPercentage: boolean;
  showCost: ShowCost;
  showDuration: boolean;
};

export type ShowCost = {
  show: boolean;
  perHour: string;
  currency: Currency;
};

// https://en.wikipedia.org/wiki/ISO_4217
export enum Currency {
  EUR = "EUR",
  USD = "USD",
  JPY = "JPY",
  GBP = "GBP",
  AUD = "AUD",
  CAD = "CAD",
  CHF = "CHF",
  CNH = "CNH",
  HKD = "HKD",
  NZD = "NZD",
}

export const DEFAULT_SETTINGS: Settings = {
  activityList: {
    showPercentage: true,
    showCost: {
      show: false,
      perHour: "10",
      currency: Currency.EUR,
    },
    showDuration: true,
  },
};

export const exportSettings = async () => {
  const result: Record<string, unknown> = cloneDeep(DEFAULT_SETTINGS);
  await settingsStore.iterate((value, key) => {
    result[key] = value;
  });
  return result as Settings;
};

export const clearSettings = () => settingsStore.clear();

export const importSettings = async (exportedSettings: Settings) => {
  if (exportedSettings.activityList) {
    await setActivityList(exportedSettings.activityList);
  }
};

export const jsonSchemaSettings = (): JTDSchemaType<Settings> => ({
  properties: {
    activityList: {
      properties: {
        showPercentage: { type: "boolean" },
        showCost: {
          properties: {
            show: { type: "boolean" },
            perHour: { type: "string" },
            currency: { enum: Object.values(Currency) },
          },
        },
        showDuration: { type: "boolean" },
      },
    },
  },
});

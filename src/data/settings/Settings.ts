import localforage from "localforage";

export const STORE_NAME_SETTINGS = "settings";

enum Keys {
  activityList = "activityList",
}

const store = localforage.createInstance({ name: STORE_NAME_SETTINGS });

export const getActivityList = () =>
  store
    .getItem<ActivityList>(Keys.activityList)
    .then((activityList) => activityList ?? DEFAULT_SETTINGS.activityList);

export const setActivityList = (activityList: ActivityList) =>
  store.setItem<ActivityList>(Keys.activityList, activityList);

type Settings = {
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
  const result: Record<string, unknown> = {};
  await store.iterate((value, key) => {
    result[key] = value;
  });
  return result as Settings;
};

export const clearSettings = () => store.clear();

export const importSettings = async (exportedSettings: Settings) => {
  await setActivityList(exportedSettings.activityList);
};

export const jsonSchemaSettings = () => ({
  type: "object",
  properties: {
    activityList: {
      type: "object",
      properties: {
        showPercentage: { type: "boolean" },
        showCost: {
          type: "object",
          properties: {
            show: { type: "boolean" },
            perHour: { type: "string" },
            currency: { type: "string" },
          },
        },
        showDuration: { type: "boolean" },
      },
    },
  },
});

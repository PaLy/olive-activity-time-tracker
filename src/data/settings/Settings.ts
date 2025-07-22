import localforage from "localforage";
import { JTDSchemaType } from "ajv/dist/jtd";
import { ActivityListSettingValue, Currency } from "../../db/entities";

export const STORE_NAME_SETTINGS = "settings";

enum Keys {
  activityList = "activityList",
}

export const settingsStore = localforage.createInstance({
  name: STORE_NAME_SETTINGS,
});

export type Settings = {
  activityList: ActivityListSettingValue;
};

export const setActivityList = (activityList: ActivityListSettingValue) =>
  settingsStore.setItem<ActivityListSettingValue>(
    Keys.activityList,
    activityList,
  );

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

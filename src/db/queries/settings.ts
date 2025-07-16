import { db } from "../db";
import { SettingKey, SettingValue } from "../entities";

export async function getActivityListSettings() {
  return db.settings.get({ key: SettingKey.ACTIVITY_LIST });
}

export async function updateActivityListSettings(
  newSettings: SettingValue<SettingKey.ACTIVITY_LIST>,
) {
  return db.settings.put({
    key: SettingKey.ACTIVITY_LIST,
    value: newSettings,
  });
}

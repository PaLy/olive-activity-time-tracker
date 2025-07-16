import { DEFAULT_SETTINGS } from "../data/settings/Settings";
import { useLiveQuery } from "dexie-react-hooks";
import { getActivityListSettings } from "../db/queries/settings";

export const useActivityListSettings = () => {
  return (
    useLiveQuery(getActivityListSettings)?.value ??
    DEFAULT_SETTINGS.activityList
  );
};

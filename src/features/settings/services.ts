import { useLiveQuery } from "dexie-react-hooks";
import { getActivityListSettings } from "../../db/queries/settings";
import { DEFAULT_ACTIVITY_LIST_SETTINGS } from "./constants";

export const useActivityListSettings = () => {
  return (
    useLiveQuery(
      () =>
        getActivityListSettings().catch((e) => {
          console.error(e);
          return undefined;
        }),
      [],
    )?.value ?? DEFAULT_ACTIVITY_LIST_SETTINGS
  );
};

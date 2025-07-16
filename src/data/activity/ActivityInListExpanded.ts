import localforage from "localforage";
import { stringArray } from "../JsonSchema";

export const STORE_NAME_ACTIVITY_IN_LIST_EXPANDED = "activityInListExpanded";

export const activityInListExpandedStore = localforage.createInstance({
  name: STORE_NAME_ACTIVITY_IN_LIST_EXPANDED,
});

export const setExpanded = async (activityID: string, expanded: boolean) => {
  try {
    if (!expanded) {
      await activityInListExpandedStore.removeItem(activityID);
    } else {
      await activityInListExpandedStore.setItem(activityID, true);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to set expanded.`);
  }
};

export type ActivityInListExpanded = string[];

export const clearActivityInListExpanded = () =>
  activityInListExpandedStore.clear();

export const importActivityInListExpanded = async (
  exportedData: ActivityInListExpanded,
) => {
  await Promise.all(exportedData.map((id) => setExpanded(id, true)));
};

export const jsonSchemaActivityInListExpanded = () => stringArray;

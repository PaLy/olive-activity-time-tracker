import localforage from "localforage";
import { stringArray } from "../JsonSchema";

export const STORE_NAME_ACTIVITY_IN_LIST_EXPANDED = "activityInListExpanded";

const store = localforage.createInstance({
  name: STORE_NAME_ACTIVITY_IN_LIST_EXPANDED,
});

export const setExpanded = async (activityID: string, expanded: boolean) => {
  try {
    if (!expanded) {
      await store.removeItem(activityID);
    } else {
      await store.setItem(activityID, true);
    }
  } catch (error) {
    throw new Error(`Failed to set expanded: ${error}`);
  }
};

export const getExpanded = (activityID: string) =>
  store.getItem<boolean>(activityID).then((value) => !!value);

export const getAllExpanded = () => store.keys();

export type ActivityInListExpanded = string[];

export const exportActivityInListExpanded = async () => {
  const keys = await getAllExpanded();
  return keys as ActivityInListExpanded;
};

export const clearActivityInListExpanded = () => store.clear();

export const importActivityInListExpanded = async (
  exportedData: ActivityInListExpanded,
) => {
  await Promise.all(exportedData.map((id) => setExpanded(id, true)));
};

export const jsonSchemaActivityInListExpanded = () => stringArray;

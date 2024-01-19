import localforage from "localforage";

export const STORE_NAME_ACTIVITY_IN_LIST_EXPANDED = "activityInListExpanded";

const store = localforage.createInstance({
  name: STORE_NAME_ACTIVITY_IN_LIST_EXPANDED,
});

export const setExpanded = async (activityID: string, expanded: boolean) => {
  if (!expanded) {
    await store.removeItem(activityID);
  } else {
    await store.setItem(activityID, true);
  }
};

export const getExpanded = (activityID: string) =>
  store.getItem<boolean>(activityID).then((value) => !!value);

type ExportedData = string[];

export const exportActivityInListExpanded = async () => {
  const keys = await store.keys();
  return keys as ExportedData;
};

export const clearActivityInListExpanded = () => store.clear();

export const importActivityInListExpanded = async (
  exportedData: ExportedData,
) => {
  await Promise.all(exportedData.map((id) => setExpanded(id, true)));
};

export const jsonSchemaActivityInListExpanded = () => ({
  type: "array",
  items: { type: "string" },
});

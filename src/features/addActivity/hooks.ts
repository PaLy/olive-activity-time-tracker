import {
  AddActivityData,
  AddActivityDataActivity,
} from "../../db/queries/getAddActivityData";
import { useMemo } from "react";
import { activityFullName } from "../activities/services";

export const useActivityFullNames = (
  addActivityData: AddActivityData | undefined,
) => {
  const { activities = new Map() } = addActivityData ?? {};
  return useMemo(
    () =>
      new Map(
        [...activities.entries()].map(([id, activity]) => [
          id,
          activityFullName(activity),
        ]),
      ),
    [activities],
  );
};

export const useActivityNameExists = (
  name: string,
  parentActivity: AddActivityDataActivity | undefined,
) => {
  return useMemo(() => {
    if (!parentActivity) {
      return false;
    }
    const siblingNames = parentActivity.children.map((child) => child.name);

    return siblingNames.some(
      (siblingName) =>
        siblingName.toLowerCase().trim() === name.toLowerCase().trim(),
    );
  }, [name, parentActivity]);
};

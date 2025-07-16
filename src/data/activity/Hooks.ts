import { ACTIVITY_FULL_NAME_SEPARATOR, activityFullName } from "./Algorithms";
import { useMemo } from "react";
import { useClockStore } from "../interval/Hooks";
import { MAX_DATE_MS } from "../../utils/Date";
import {
  AddActivityData,
  AddActivityDataActivity,
} from "../../db/queries/getAddActivityData";
import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import { activityDuration } from "../../db/queries/activities";
import { Activity } from "../../db/entities";

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

export const isInProgress = (activity: ActivityTreeNode) =>
  activity.subtreeLastEndTime === MAX_DATE_MS;

export const depth = (activity: ActivityTreeNode): number => {
  if (!activity.parent || activity.parent.id === -1) {
    return 0;
  } else {
    return 1 + depth(activity.parent);
  }
};

export const useDuration = (activity: ActivityTreeNode | undefined) => {
  const time = useClockStore((state) => state.time);
  if (!activity) {
    return 0;
  }
  return activityDuration(activity, +time);
};

export const useDurationPercentage = (activity: ActivityTreeNode) => {
  const parentActivity = activity.parent;
  const activityDuration = useDuration(activity);
  const parentDuration = useDuration(parentActivity);
  return Math.round((activityDuration / parentDuration) * 100);
};

export const useActivitiesOrderKey = (activities: ActivityTreeNode[]) => {
  return useMemo(
    () =>
      // Should be joined by a character which is not used in any ID.
      activities.map((a) => a.id).join("$"),
    [activities],
  );
};

export const useActivityFullName = (
  activityId: number,
  activities: Map<number, Activity>,
  fromActivityId: number = -1,
) => {
  return useMemo(() => {
    const activity = activities.get(activityId);
    if (!activity) {
      return "";
    }
    const ancestors = [];
    let currentActivity: Activity | undefined = activity;
    while (currentActivity && currentActivity.id !== fromActivityId) {
      ancestors.unshift(currentActivity.name);
      currentActivity = activities.get(currentActivity.parentId);
    }
    return ancestors.join(ACTIVITY_FULL_NAME_SEPARATOR);
  }, [activities, activityId, fromActivityId]);
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
